var Rooms = {}

export function GetRandomCode(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    var code = ''
    for(var i = 0; i <= 6; i++){
        code += characters.charAt(Math.random() * 36)
    }
    return code
}

export function CreateRoom(socket){
    const code = GetRandomCode()
    //Placeholder
    Rooms[code] = {
        "owner": OwnerId,
        "state":"night",
        "players":[],
        "privacy":"public"
    }
    return Rooms[code]
}
