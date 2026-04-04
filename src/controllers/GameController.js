const RoomManager = require('../managers/RoomManager')

export function handleCreateRoom(socket){
    const newRoom = RoomManager.CreateRoom(socket.id)
    socket.join(newRoom.id)
}

