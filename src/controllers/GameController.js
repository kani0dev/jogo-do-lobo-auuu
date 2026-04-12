import { CreateRoom } from "../managers/RoomManager.js"

export function handleCreateRoom(socket){
    const newRoom = CreateRoom(socket.id)
    socket.join(newRoom.id)
}