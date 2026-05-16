const JogoService = require('../services/JogoService')
const SalaManager = require('../services/SalaManager')

//* Aqui é onde as requisições do socket são recebidas e passadas pro controller
//TODO: Mandar as requisições pro controller e não direto daqui pros services
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(socket.id + ' conectado');

        // Lógica de criar sala
        socket.on("CriarSala", (jogador) => {
            
            const teste = SalaManager.CriarSala(socket, jogador)
            console.log(teste)
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
            JogoService.AtualizarSala(socket, codigo)
        })
    });
};