const ConstFuncoes = require("../constants/ConstFuncoes.js")
const JogoStateMachine = require("./JogoStateMachine.js")

exports.Salas = {}

exports.CriarSala = (socket, jogador, config = {privacidade: "publico", funcoes :[{nome:"Lobo", quantidade: 1},{nome:"Ovelha", quantidade: 9}]}) => {
    try{
        // Muitissimas validações, lol
        const totalJogadores = config.funcoes.reduce((total, funcao) => total + funcao.quantidade, 0)
        if(socket.rooms.size > 1){// Valida se o jogador ja esta em uma sala
            console.log(socket.id + " tentou criar uma sala enquanto já estava em outra sala")
            return { erro: "Você já está em uma sala"}
        }
        if(totalJogadores < 2 || totalJogadores > 20){// Valida a quantidade de jogadores
            console.log(socket.id + " tentou criar uma sala com um número de jogadores inválido: " + totalJogadores)
            return { erro: "Número de jogadores deve ser entre 2 e 20"}
        }
        if(!["publico", "privado"].includes(config.privacidade)){// Valida a privacidade
            console.log(socket.id + " tentou criar uma sala com uma privacidade inválida: " + config.privacidade)
            return { erro: "Privacidade deve ser 'publico' ou 'privado'"}
        }
        if(config.funcoes.length == 0){ // Valida a quantidade de funções
            console.log(socket.id + " tentou criar uma sala sem funções")
            return { erro: "A sala deve ter pelo menos uma função"}
        }
        for(const f of config.funcoes){ //Checa se a funcao inserida existe
            if(!ConstFuncoes.Funcoes[f.nome]){
                return { erro: "A funcao "+f.nome+", não é uma função reconhecida pelo jogo"}
            }
        }
        if(config.funcoes.some(funcao => funcao.quantidade < 1)){ // Valida a quantidade de jogadores por função
            console.log(socket.id + " tentou criar uma sala com uma função com quantidade menor que 1")
            return { erro: "Cada função deve ter pelo menos 1 jogador"}
        }
        
        const codigo = GerarCodigoAleatorio()
        exports.Salas[codigo] = {
            codigo : codigo, 
            privacidade: config.privacidade,
            sala_estado: "ESPERANDO",
            quantidade_jogadores: totalJogadores,
            anfitriao: socket.id,
            jogadores: {},
            funcoes: config.funcoes,
            votos: []
        }
        exports.EntrarSala(socket, jogador, codigo)

        return {ok: true, res: exports.Salas[codigo]}
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
            console.log(socket.id + " tentou entrar em uma sala inexistente")
            return { erro: "Sala " + codigo + " não encontrada"}
        }

        const jogadorExiste = Sala.jogadores[socket.id]
        if(jogadorExiste){
            console.log(socket.id + " ja existe na sala: " + code)
            return { erro: "Jogador " + socket.id + " já existe na sala " + codigo}
        }

        if(Object.keys(Sala.jogadores).length >= Sala.quantidade_jogadores){
            return { erro: "A sala "+codigo+" está cheia" }
        }

        Sala.jogadores[socket.id] = {
            socket_id: socket.id,
            nome: jogador.nome,
            funcao: null,
            estado: "NÃO PRONTO",
            efeitos: []
        }
        socket.join(codigo)

        return { ok: true, res: Sala }

    }catch(erro){
        console.log("Erro ao entrar na sala: " + erro)
        return { erro }
    }
}

exports.SairSala = (socket, codigo) => {
    try{
        const Sala = exports.Salas[codigo]
        if(!Sala){
            console.log(socket.id + " tentou sair de uma sala inexistente")
            return { erro: "Sala " + codigo + " não encontrada"}
        }

        const jogadorNaoExiste = !Sala.jogadores[socket.id]
        if(jogadorNaoExiste){
            console.log(socket.id + " já não está na sala: " + code)
            return { erro: "Jogador " + socket.id + " já não está na sala " + codigo}
        }

        delete Sala.jogadores[socket.id]
        socket.leave(codigo)

        return { ok: true }
    
        Sala.estado = "NOITE" //TODO: chamar maquina de estados
    }catch(erro){
        console.log("Erro ao sair da sala: " + error)
        return { erro }
    }

}

exports.MudarConfigSala = (socket, codigo, config = {}) => {
    try{
        const Sala = exports.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const Jogador = Sala.jogadores[socket.id]
        if(!Jogador){
            return {erro: "Jogador "+socket.id+" não encontrado na sala "+codigo}
        }
        if(Sala.anfitriao != socket.id){
            return {erro: "Apenas o anfitrião pode mudar as configurações da sala"}
        }
        if(Sala.estado.toUpperCase() != "ESPERANDO"){
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
                        console.log(socket.id + " tentou criar uma sala com um número de jogadores inválido: " + totalJogadores)
                        return { erro: "Número de jogadores deve ser entre 2 e 20"}
                    }
                    for(const f of config[c]){//Checa se a funcao inserida existe
                        if(!ConstFuncoes.Funcoes[f.nome]){
                            return { erro: "A funcao "+f.nome+", não é uma função reconhecida pelo jogo"}
                        }
                    }
                    if(config.funcoes.some(funcao => funcao.quantidade < 1)){ // Valida a quantidade de jogadores por função
                        console.log(socket.id + " tentou criar uma sala com uma função com quantidade menor que 1")
                        return { erro: "Cada função deve ter pelo menos 1 jogador"}
                    }
                    Sala.funcoes = config[c]
                    Sala.quantidade_jogadores = config[c].reduce((total, funcao) => total + funcao.quantidade, 0)
                    break;
                default:
                    break;
            }
        }
        return { ok: true, res: Sala }
    }catch(erro){
        return { erro }
    }
}

exports.MudarProntidao = (socket, codigo)=>{
    try{
        const Sala = exports.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const Jogador = Sala.jogadores[socket.id]
        if(!Jogador){
            return {erro: "Jogador "+socket.id+" não encontrado na sala "+codigo}
        }
        const JogoComecou = Sala.estado.toUpperCase() != "ESPERANDO" 
        if(JogoComecou){
            return {erro: "O jogo da sala "+codigo+" ja começou"}
        }

        Jogador.estado = (Jogador.estado.toUpperCase() === "PRONTO") ? "NÃO PRONTO" : "PRONTO" // Da um toggle no estado do jogador

        return { ok: true, res: Jogador }
    }catch(erro){
        console.log(erro)
        return { erro }
    }
}

exports.ComecarJogo = (socket, codigo)=>{
    try{
        const Sala = exports.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const Jogador = Sala.jogadores[socket.id]
        if(!Jogador){
            return {erro: "Jogador "+socket.id+" não encontrado na sala "+codigo}
        }
        if(Sala.anfitriao != socket.id){
            return {erro: "Apenas o anfitrião pode começar a partida"}
        }
        if(Sala.estado.toUpperCase() != "ESPERANDO"){
            return {erro: "Partida "+codigo+" já começou"}
        }
        if(Object.keys(Sala.jogadores).length != Sala.quantidade_jogadores){
            return { erro: "A quantidade de jogadores não bate com a quantidade de papeis"}
        }
        
        for(const j in Object.values(Sala.jogadores)){
            if(j.estado.toUpperCase() != "PRONTO"){
                return {erro: "Todos os jogadores devem estar prontos pra partida começar"}
            }
        }

        const IniciaJogo = JogoStateMachine.IniciaJogo(codigo)

        if(IniciaJogo.ok){
            return { ok: true, res: Sala }
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