const RoomManager = require('../managers/SalaManager.js')

exports.handleCreateRoom = (socket) => {
    const newRoom = RoomManager.CreateRoom(socket.id)
    socket.join(newRoom.id)
}

