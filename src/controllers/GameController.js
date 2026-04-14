const RoomManager = require('../managers/RoomManager.js')

exports.handleCreateRoom = (socket) => {
    const newRoom = RoomManager.CreateRoom(socket.id)
    socket.join(newRoom.id)
}

