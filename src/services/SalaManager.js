const ConstFuncoes = require("../constants/ConstFuncoes.js")
const JogoStateMachine = require("./JogoStateMachine.js")

exports.Salas = {}

exports.CriarSala = (socket, jogador, config = {privacidade: "PUBLICO", funcoes :[{nome:"Lobo", quantidade: 1}, {nome:"São Bernardo", quantidade: 1}]}) => {
    try{
        // Muitissimas validações, lol
        const totalJogadores = config.funcoes.reduce((total, funcao) => total + funcao.quantidade, 0)
        if(totalJogadores < 2 || totalJogadores > 20){// Valida a quantidade de jogadores
            console.log(jogador.nome + " tentou criar uma sala com um número de jogadores inválido: " + totalJogadores)
            return { erro: "Número de jogadores deve ser entre 2 e 20"}
        }
        if(!["PUBLICO", "PRIVADO"].includes(config.privacidade.toUpperCase())){// Valida a privacidade
            console.log(jogador.nome + " tentou criar uma sala com uma privacidade inválida: " + config.privacidade)
            return { erro: "Privacidade deve ser 'publico' ou 'privado'"}
        }
        if(config.funcoes.length == 0){ // Valida a quantidade de funções
            console.log(jogador.nome + " tentou criar uma sala sem funções")
            return { erro: "A sala deve ter pelo menos uma função"}
        }
        for(const f of config.funcoes){ //Checa se a funcao inserida existe
            if(!ConstFuncoes.Funcoes[f.nome]){
                return { erro: "A funcao "+f.nome+", não é uma função reconhecida pelo jogo"}
            }
        }
        if(config.funcoes.some(funcao => funcao.quantidade < 1)){ // Valida a quantidade de jogadores por função
            console.log(jogador.nome + " tentou criar uma sala com uma função com quantidade menor que 1")
            return { erro: "Cada função deve ter pelo menos 1 jogador"}
        }
        
        const codigo = GerarCodigoAleatorio()
        const Sala = exports.Salas[codigo] = {
            codigo : codigo, 
            privacidade: config.privacidade,
            sala_estado: "ESPERANDO",
            quantidade_jogadores: totalJogadores,
            anfitriao: jogador.id,
            jogadores: {},
            //espectadores:{},  
            funcoes: config.funcoes,
            votos: []
        }

        return {ok: true, dados:{ Sala, mensagem: "Sala com o codigo "+codigo+" criada com sucesso"}}
    }catch(erro){
        console.log("Erro ao criar a sala: " + erro)
        return { erro }
    }
}


exports.EntrarSala = (socket, jogador, codigo) => {
    try{
        if(socket.rooms.size > 1){
            console.log(socket.id + "tentou entrar em uma sala enquanto já estava em outra sala")
            return { erro: "Você já está em uma sala"}
        }

        const Sala = exports.Salas[codigo]
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
        return { ok: true, dados: { Sala, jogadorNovo ,mensagem: jogador.nome + " entrou na sala "+codigo+" com sucesso" } }

    }catch(erro){
        console.log("Erro ao entrar na sala: " + erro)
        return { erro }
    }
}

exports.SairSala = (socket, jogador, codigo) => {
    try{
        const Sala = exports.Salas[codigo]
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
            delete exports.Salas[codigo]
            return { ok: true, dados:{Sala: false, jogador, message: jogador.nome + " saiu da sala "+codigo+" com sucesso"}}
        }else{
            return { ok: true, dados:{Sala, jogador,message: jogador.nome + " saiu da sala "+codigo+" com sucesso"} }
        }
    
    }catch(erro){
        console.log("Erro ao sair da sala: " + erro)
        return { erro }
    }

}

exports.ReconectarSala = (socket, jogador, codigo) => {
    try{
        const Sala = exports.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const Jogador = Sala.jogadores[jogador.id]
        if(!Jogador){
            return {erro: jogador.nome+" não encontrado na sala "+codigo}
        }
        Jogador.socket_id = socket.id
        socket.join(codigo + "_GERAL")
        socket.to(codigo+"_GERAL").emit("Reconectou", Jogador)
        return {ok: true, dados: {Jogador, Sala}}
    }catch(erro){
        return { erro }
    }
}

exports.MudarConfigSala = (socket, jogador, codigo, config = {}) => {
    try{
        const Sala = exports.Salas[codigo]
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
                case privacidade:
                    Sala.privacidade = config[c]
                    break;
                case funcoes:
                    const totalJogadores = config[c].reduce((total, funcao) => total + funcao.quantidade, 0)
                    if(totalJogadores < 2 || totalJogadores > 20){// Valida a quantidade de jogadores
                        console.log(jogador.nome + " tentou criar uma sala com um número de jogadores inválido: " + totalJogadores)
                        return { erro: "Número de jogadores deve ser entre 2 e 20"}
                    }
                    for(const f of config[c]){//Checa se a funcao inserida existe
                        if(!ConstFuncoes.Funcoes[f.nome]){
                            return { erro: "A funcao "+f.nome+", não é uma função reconhecida pelo jogo"}
                        }
                    }
                    if(config.funcoes.some(funcao => funcao.quantidade < 1)){ // Valida a quantidade de jogadores por função
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
        return { ok: true, dados: { Sala } }
    }catch(erro){
        return { erro }
    }
}

exports.MudarProntidao = (socket, jogador, codigo)=>{
    try{
        const Sala = exports.Salas[codigo]
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

        Jogador.estado = (Jogador.estado.toUpperCase() === "PRONTO") ? "NAO PRONTO" : "PRONTO" // Da um toggle no estado do jogador

        return { ok: true, dados: { Jogador } }
    }catch(erro){
        console.log(erro)
        return { erro }
    }
}

exports.ComecarJogo = (socket, jogador, codigo)=>{
    try{
        const Sala = exports.Salas[codigo]
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

        const IniciaJogo = JogoStateMachine.MudaEstadoDaSala(codigo)
        if(IniciaJogo.ok){
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