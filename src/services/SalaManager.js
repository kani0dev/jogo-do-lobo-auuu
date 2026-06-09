const ConstFuncoes = require("../constants/ConstFuncoes.js")
const JogoStateMachine = require("./JogoStateMachine.js")
const { connectRedis, salvarSala, buscarSala, removerSala, listarSalas } = require("../database/redis")

connectRedis().catch(err => console.error("Redis connection failed:", err))

// Exporta funções do Redis diretamente
exports.salvarSala = salvarSala
exports.buscarSala = buscarSala

exports.listarSalasPublicas = async () => {
    const salas = await listarSalas()
    return salas.filter(sala => 
        sala.privacidade.toUpperCase() === 'PUBLICO' 
        && sala.sala_estado.toUpperCase() === 'ESPERANDO'
        && Object.keys(sala.jogadores).length != sala.quantidade_jogadores 
    )
}

exports.CriarSala = async (socket, jogador, config = {privacidade: "PUBLICO", funcoes :[{nome:"Lobo", quantidade: 1}, {nome:"São Bernardo", quantidade: 1}]}) => {
    try{
        const totalJogadores = config.funcoes.reduce((total, funcao) => total + funcao.quantidade, 0)
        if(totalJogadores < 2 || totalJogadores > 20){
            console.log(jogador.nome + " tentou criar uma sala com um número de jogadores inválido: " + totalJogadores)
            return { erro: "Número de jogadores deve ser entre 2 e 20"}
        }
        if(!["PUBLICO", "PRIVADO"].includes(config.privacidade.toUpperCase())){
            console.log(jogador.nome + " tentou criar uma sala com uma privacidade inválida: " + config.privacidade)
            return { erro: "Privacidade deve ser 'publico' ou 'privado'"}
        }
        if(config.funcoes.length == 0){
            console.log(jogador.nome + " tentou criar uma sala sem funções")
            return { erro: "A sala deve ter pelo menos uma função"}
        }
        for(const f of config.funcoes){
            if(!ConstFuncoes.Funcoes[f.nome]){
                return { erro: "A funcao "+f.nome+", não é uma função reconhecida pelo jogo"}
            }
        }
        if(config.funcoes.some(funcao => funcao.quantidade < 1)){
            console.log(jogador.nome + " tentou criar uma sala com uma função com quantidade menor que 1")
            return { erro: "Cada função deve ter pelo menos 1 jogador"}
        }
        
        const codigo = GerarCodigoAleatorio()
        const Sala = {
            codigo : codigo,
            privacidade: config.privacidade,
            sala_estado: "ESPERANDO",
            quantidade_jogadores: totalJogadores,
            anfitriao: jogador.id,
            jogadores: {},
            funcoes: config.funcoes,
            votos: [],
            chat: [],
            turno: 0
        }
        await salvarSala(Sala)
        return {ok: true, dados:{ Sala, mensagem: "Sala com o codigo "+codigo+" criada com sucesso"}}
    }catch(erro){
        console.log("Erro ao criar a sala: " + erro)
        return { erro }
    }
}


exports.EntrarSala = async (socket, jogador, codigo) => {
    try{
        if(socket.rooms.size > 1){
            console.log(socket.id + "tentou entrar em uma sala enquanto já estava em outra sala")
            return { erro: "Você já está em uma sala"}
        }

        const Sala = await buscarSala(codigo)
        if(!Sala){
            console.log(jogador.nome + " tentou entrar em uma sala inexistente")
            return { erro: "Sala " + codigo + " não encontrada"}
        }

        const jogadorExiste = Sala.jogadores[jogador.id]
        if(jogadorExiste){
            console.log(jogador.nome + " ja existe na sala: " + codigo)
            return { erro: "Jogador " + jogador.nome + " já existe na sala " + codigo, dados:{Sala}}
        }

        if(Object.keys(Sala.jogadores).length >= Sala.quantidade_jogadores){
            return { erro: "A sala "+codigo+" está cheia" }
        }

        const jogadorNovo = Sala.jogadores[jogador.id] = {
            id: jogador.id,
            socket_id: socket.id,
            nome: jogador.nome,
            funcao: null,
            estado: "NAO PRONTO",
            efeitos: []
        }
        socket.join(codigo + "_GERAL")
        await salvarSala(Sala)
        return { ok: true, dados: { Sala, jogadorNovo ,mensagem: jogador.nome + " entrou na sala "+codigo+" com sucesso" } }

    }catch(erro){
        console.log("Erro ao entrar na sala: " + erro)
        return { erro }
    }
}

exports.SairSala = async (socket, jogador, codigo) => {
    try{
        const Sala = await buscarSala(codigo)
        if(!Sala){
            console.log(jogador.nome + " tentou sair de uma sala inexistente")
            return { erro: "Sala " + codigo + " não encontrada"}
        }

        const jogadorNaSala = Sala.jogadores[jogador.id]
        if(!jogadorNaSala){
            return { erro: jogador.nome + " já não está na sala " + codigo}
        }
        if(jogador.id == Sala.anfitriao && Object.keys(Sala.jogadores).length > 1){
            Sala.anfitriao = Object.keys(Sala.jogadores)[1]
        }
        delete Sala.jogadores[jogador.id]
        socket.leave(codigo+"_GERAL")
        

        if(Object.keys(Sala.jogadores).length <= 0){
            await removerSala(codigo)
            return { ok: true, dados:{Sala: false, jogador, message: jogador.nome + " saiu da sala "+codigo+" com sucesso"}}
        }else{
            await salvarSala(Sala)
            return { ok: true, dados:{Sala, jogador,message: jogador.nome + " saiu da sala "+codigo+" com sucesso"} }
        }
    
    }catch(erro){
        console.log("Erro ao sair da sala: " + erro)
        return { erro }
    }

}

exports.ReconectarSala = async (socket, jogador, codigo) => {
    try{
        const Sala = await buscarSala(codigo)
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const Jogador = Sala.jogadores[jogador.id]
        if(!Jogador){
            return {erro: jogador.nome+" não encontrado na sala "+codigo}
        }
        Jogador.socket_id = socket.id
        socket.join(codigo + "_GERAL")
        await salvarSala(Sala)
        socket.to(codigo+"_GERAL").emit("Reconectou", Jogador)
        return {ok: true, dados: {Jogador, Sala}}
    }catch(erro){
        return { erro }
    }
}

exports.MudarConfigSala = async (socket, jogador, codigo, config = {}) => {
    try{
        const Sala = await buscarSala(codigo)
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const Jogador = Sala.jogadores[jogador.id]
        if(!Jogador){
            return {erro: jogador.nome+" não encontrado na sala "+codigo}
        }
        if(Sala.anfitriao != jogador.id){
            return {erro: "Apenas o anfitrião pode mudar as configurações da sala"}
        }
        if(Sala.sala_estado.toUpperCase() != "ESPERANDO"){
            return {erro: "Partida "+codigo+" já começou"}
        }
        
        for(const c in config){
            switch(c){
                case 'privacidade':
                    Sala.privacidade = config[c]
                    break;
                case 'funcoes':
                    const totalJogadores = config[c].reduce((total, funcao) => total + funcao.quantidade, 0)
                    if(totalJogadores < 2 || totalJogadores > 20){
                        console.log(jogador.nome + " tentou criar uma sala com um número de jogadores inválido: " + totalJogadores)
                        return { erro: "Número de jogadores deve ser entre 2 e 20"}
                    }
                    for(const f of config[c]){
                        if(!ConstFuncoes.Funcoes[f.nome]){
                            return { erro: "A funcao "+f.nome+", não é uma função reconhecida pelo jogo"}
                        }
                    }
                    if(config.funcoes.some(funcao => funcao.quantidade < 1)){
                        console.log(jogador.nome + " tentou criar uma sala com uma função com quantidade menor que 1")
                        return { erro: "Cada função deve ter pelo menos 1 jogador"}
                    }
                    Sala.funcoes = config[c]
                    Sala.quantidade_jogadores = config[c].reduce((total, funcao) => total + funcao.quantidade, 0)
                    break;
                default:
                    break;
            }
        }
        await salvarSala(Sala)
        return { ok: true, dados: { Sala } }
    }catch(erro){
        return { erro }
    }
}

exports.MudarProntidao = async (socket, jogador, codigo)=>{
    try{
        const Sala = await buscarSala(codigo)
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const Jogador = Sala.jogadores[jogador.id]
        if(!Jogador){
            return {erro: jogador.nome + " não encontrado na sala "+codigo}
        }
        const JogoComecou = Sala.sala_estado.toUpperCase() != "ESPERANDO" 
        if(JogoComecou){
            return {erro: "O jogo da sala "+codigo+" ja começou"}
        }

        Jogador.estado = (Jogador.estado.toUpperCase() === "PRONTO") ? "NAO PRONTO" : "PRONTO"
        await salvarSala(Sala)
        return { ok: true, dados: { Jogador } }
    }catch(erro){
        console.log(erro)
        return { erro }
    }
}

exports.ComecarJogo = async (socket, jogador, codigo)=>{
    try{
        const Sala = await buscarSala(codigo)
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const Jogador = Sala.jogadores[jogador.id]
        if(!Jogador){
            return {erro: jogador.nome +" não encontrado na sala "+codigo}
        }
        if(Sala.anfitriao != jogador.id){
            return {erro: "Apenas o anfitrião pode começar a partida"}
        }
        if(Sala.sala_estado.toUpperCase() != "ESPERANDO"){
            return {erro: "Partida "+codigo+" já começou"}
        }
        if(Object.keys(Sala.jogadores).length != Sala.quantidade_jogadores){
            return { erro: "A quantidade de jogadores não bate com a quantidade de papeis"}
        }
        
        Jogador.estado = "PRONTO"
        for(const j of Object.values(Sala.jogadores)){
            if(j.estado.toUpperCase() != "PRONTO"){
                return {erro: "Todos os jogadores devem estar prontos pra partida começar"}
            }
        }

        const IniciaJogo = await JogoStateMachine.AvancaEstadoDaSala(Sala)
        if(IniciaJogo.ok){
            await salvarSala(Sala)
            return { ok: true, dados: {Sala} }
        }else{
            return IniciaJogo.erro 
        }

        
    }catch(erro){
        return { erro }
    }
}

// Cria um código de 6 caracteres
GerarCodigoAleatorio = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    var code = ''
    for(var i = 0; i <= 6; i++){
        code += characters.charAt(Math.random() * 36)
    }
    return code
}