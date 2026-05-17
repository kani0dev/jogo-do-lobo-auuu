const JogoService = require('../services/JogoService')
const SalaManager = require('../services/SalaManager')

//* Aqui é onde as requisições do socket são recebidas e passadas pro controller
//TODO: Mandar as requisições pro controller e não direto daqui pros services
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(socket.id + ' conectado');

        // Lógica de criar sala
        socket.on("CriarSala", (jogador) => {
            const resposta = SalaManager.CriarSala(socket, jogador)
            if(resposta.ok){
                socket.to(socket.id).emit("SalaCriada", resposta.Sala)
            }else{
                if(resposta.erro){
                    io.to(socket.id).emit("erro", resposta)
                }
            }
        });

        // Lógica de entrar na sala
        socket.on("EntrarSala", (jogador, codigo) => {
            const resposta = SalaManager.EntrarSala(socket, jogador, codigo)
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("EntrouNaSala", resposta.Sala, resposta.Sala.jogadores[jogador.id])
            }else{
                if(resposta.erro){
                    io.to(socket.id).emit("erro", resposta)
                }
            }
        });

        // Lógica de sair da sala
        socket.on("SairSala", (jogador, codigo) => {
            const resposta = SalaManager.SairSala(socket, jogador, codigo)
            if(resposta.ok){
                 io.to(codigo+"_GERAL").emit("SaiuDaSala", resposta.Sala, resposta.Sala.jogadores[jogador.id])
            }else{
                if(resposta.erro){
                    io.to(socket.id).emit("erro", resposta)
                }
            }
        });

        socket.on("Acao", (jogador, codigo, alvo = null) => {
            const resposta = JogoService.PerformarAção(socket, jogador, codigo, alvo)
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("PerformouAcao", jogador.id)
            }else{
                if(resposta.erro){
                    io.to(socket.id).emit("erro", resposta)
                }
            }
        })

        socket.on("Votar", (jogador, codigo, alvo = null) => {
            const resposta = JogoService.Votar(socket,jogador, codigo, alvo)
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("Votou", jogador.id)
            }else{
                if(resposta.erro){
                    io.to(socket.id).emit("erro", resposta)
                }
            }
        })

    });
};