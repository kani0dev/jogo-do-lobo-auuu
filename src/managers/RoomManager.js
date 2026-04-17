const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

//* Super placeholder, fazendo o basico pra entender como fazer

// Banco de dados em memória pra gerenciar as salas, 
// com a tabela de jogadores nas salas e as salas em si
// aqui vou armazenar os estados de jogo da sala, funções dos jogadores,
// se os jogadores ja estão prontos(ready, not ready, morto e etc) 
// pra pular de fase e etc

// Por enquanto só tem a inicialização do sqlite, 
// os dados em si tão sendo armazenados na variavel Rooms logo abaixo
// TODO: Decidir se vai continuar com a variavel ou com o sqlite
exports.initRooms = () => {
    const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE salas (
            id TEXT PRIMARY KEY,
            dono TEXT,
            status TEXT
        )
    `);

    await db.exec(`
        CREATE TABLE jogadores_da_sala (
            id TEXT PRIMARY KEY,
            nome TEXT,
            status TEXT,
            funcao TEXT
        )
    `);
}

var Rooms = {}


// Cria um código de 6 caracteres
exports.GetRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    var code = ''
    for(var i = 0; i <= 6; i++){
        code += characters.charAt(Math.random() * 36)
    }
    return code
}

exports.CreateRoom = (jogador) => {
    const code = GetRandomCode()
    //Placeholder
    Rooms[code] = {
        "sala_id": code,
        "dono": jogador.id,//? talvez(?)
        "estado":"noite",
        "jogadores":{},
        "privacidade":"publico"
    }
    return Rooms[code]
}

exports.JoinRoom = (socket, code) => {
    const room = Rooms[code]
    if(!room){
        console.log(socket.id + " tentou entrar em uma sala inexistente")
        return "Erro: sala não encontrada" 
    }

    const jogadorExiste = room.jogadores[socket.id]
    if(jogadorExiste){
        console.log(socket.id + " ja existe na sala: " + code)
        return "Erro: jogador ja existe na sala"
    }

    Rooms[code].jogadores[socket.id] = {
        "socket_id":socket.id,
        "pronto": false
    }
    socket.join(code)
    
}

exports.ChangeState = () => {

}