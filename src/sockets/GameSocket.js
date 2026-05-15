const JogoController = require('../controllers/JogoController')
const SalaManager = require('../services/SalaManager')

//* Aqui é onde a lógica do jogo acontece
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(socket.id + ' conectado');

        // Lógica de criar sala
        socket.on("CriarSala", (jogador) => {
            console.log(jogador)
            SalaManager.CriarSala(socket, jogador)
        });

        // Lógica de entrar na sala
        socket.on("EntrarSala", (codigo, jogador) => {
            SalaManager.EntrarSala(socket, jogador, codigo)
        });

        // Lógica de sair da sala
        socket.on('SairSala', (codigo) => {
            SalaManager.SairSala(socket, codigo)
        });

        socket.on('Pronto', (codigo)=>{
            JogoController.AtualizarSala(socket, codigo)
        })
    });
};