class Sala{
    constructor(codigo, privacidade, sala_estado, admin){
        this.codigo = codigo
        this.privacidade = privacidade
        this.sala_estado = sala_estado
        this.admin = admin
        this.jogadores = []
    }
}

class Jogador{
    constructor(socket_id, nome, funcao, jogador_estado){
        this.socket_id = socket_id
        this.nome = nome
        this.funcao = funcao
        this.estado = jogador_estado
    }
}

var Salas = {}

exports.CriarSala = (socket, jogador) => {
    const codigo = GerarCodigoAleatorio()
    Salas[codigo] = new Sala(
        codigo, 
        "publico",
        "esperando",
        socket.id
    )

    exports.EntrarSala(socket, jogador, codigo)
    console.log(Salas[codigo])
    return Salas[codigo]
}

exports.EntrarSala = (socket, jogador, codigo) => {
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

    Salas[codigo].jogadores[socket.id] = new Jogador(
        socket.id,
        jogador.nome,
        null,
        "não pronto"
    )

    socket.join(codigo)
    return { ok: true }
}

exports.SairSala = (socket, codigo) => {
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