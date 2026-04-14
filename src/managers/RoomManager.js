var Rooms = {}

exports.GetRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    var code = ''
    for(var i = 0; i <= 6; i++){
        code += characters.charAt(Math.random() * 36)
    }
    return code
}

exports.CreateRoom = (socket) => {
    const code = GetRandomCode()
    //Placeholder
    Rooms[code] = {
        "dono": socket.id,//? talvez(?)
        "estado":"noite",
        "jogadores":[],
        "privacidade":"publico"
    }
    return Rooms[code]
}
