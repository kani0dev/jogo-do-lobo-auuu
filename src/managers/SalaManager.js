var Salas = {}

exports.CriarSala = (socket, jogador, config = {privacidade: "publico", funcoes = [{nome:"Lobisomen", quantidade: 1},{nome:"Aldeão", quantidade: 9}]}) => {
    try{
        // Muitissimas validações, lol
        const totalJogadores = config.funcoes.reduce((total, funcao) => total + funcao.quantidade, 0)
        if(socket.rooms.size > 1){// Valida se o jogador ja esta em uma sala
            console.log(socket.id + " tentou criar uma sala enquanto já estava em outra sala")
            return { erro: "Você já está em uma sala"}
        }
        if(totalJogadores < 2 || totalJogadores > 20){// Valida a quantidade de jogadores
            console.log(socket.id + " tentou criar uma sala com um número de jogadores inválido: " + config.quantidade_jogadores)
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
        if(config.funcoes.some(funcao => funcao.quantidade < 1)){ // Valida a quantidade de jogadores por função
            console.log(socket.id + " tentou criar uma sala com uma função com quantidade menor que 1")
            return { erro: "Cada função deve ter pelo menos 1 jogador"}
        }
        
        const codigo = GerarCodigoAleatorio()
        Salas[codigo] = {
            codigo : codigo, 
            privacidade: config.privacidade,
            sala_estado: "esperando",
            quantidade_jogadores: totalJogadores,
            anfitrião: socket.id,
            jogadores: [],
            funcoes: config.funcoes,
            votos: []
        }
        exports.EntrarSala(socket, jogador, codigo)
        console.log(Salas[codigo])
        return Salas[codigo]
    }catch(error){
        console.log("Erro ao criar a sala: " + error)
        return { erro: "Erro ao criar a sala: " + error}
    }
}

exports.EntrarSala = (socket, jogador, codigo) => {
    try{
        if(socket.rooms.size > 1){
            console.log(socket.id + "tentou entrar em uma sala enquanto já estava em outra sala")
            return { erro: "Você já está em uma sala"}
        }

        const sala = Salas[codigo]
        if(!sala){
            console.log(socket.id + " tentou entrar em uma sala inexistente")
            return { erro: "Sala " + codigo + " não encontrada"}
        }

        const jogadorExiste = sala.jogadores[socket.id]
        if(jogadorExiste){
            console.log(socket.id + " ja existe na sala: " + code)
            return { erro: "Jogador " + socket.id + " já existe na sala " + codigo}
        }

        Salas[codigo].jogadores[socket.id] = {
            socket_id: socket.id,
            nome: jogador.nome,
            funcao: null,
            estado: "não pronto"
        }

        socket.join(codigo)
        return { ok: true }
    }catch(error){
        console.log("Erro ao entrar na sala: " + error)
        return { erro: "Erro ao entrar na sala: " + error}
    }
}

exports.SairSala = (socket, codigo) => {
    try{
        const sala = Salas[codigo]
        if(!sala){
            console.log(socket.id + " tentou sair de uma sala inexistente")
            return { erro: "Sala " + codigo + " não encontrada"}
        }

        const jogadorNaoExiste = !sala.jogadores[socket.id]
        if(jogadorNaoExiste){
            console.log(socket.id + " já não está na sala: " + code)
            return { erro: "Jogador " + socket.id + " já não está na sala " + codigo}
        }

        delete Salas[codigo].jogadores[socket.id]
        socket.leave(codigo)
        return { ok: true }
    
    }catch(error){
        console.log("Erro ao sair da sala: " + error)
        return { erro: "Erro ao sair da sala: " + error}
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