const GameController = require('../controllers/GameController')
const RoomManager = require('../managers/RoomManager')

//* Aqui é onde a lógica do jogo acontece
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(socket.id + ' conectado');
        // Lógica de entrar na sala
        socket.on("JoinRoom", (code) => {
            //GameController.JoinRoom(code)
            console.log("join room: " + code)
        });

        // Lógica de criar sala
        socket.on("CreateRoom", () => {
            //GameController.CreateRoom()
            console.log("room code: " + RoomManager.GetRandomCode())
        });

        socket.on('disconnect', () => {
            console.log(socket.id + ' desconectado');
        });
    });
};