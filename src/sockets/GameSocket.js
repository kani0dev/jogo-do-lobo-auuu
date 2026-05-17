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
                socket.emit("SalaCriada", resposta.Sala)
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
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
                    socket.emit("erro", resposta)
                }
            }
        });

        // Lógica de sair da sala
        socket.on("SairSala", (jogador, codigo) => {
            const resposta = SalaManager.SairSala(socket, jogador, codigo)
            if(resposta.ok){
                 io.to(codigo+"_GERAL").emit("SaiuDaSala", resposta.jogador, resposta.Sala)
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
                }
            }
        });

        socket.on("Acao", (jogador, codigo, alvo = null) => {
            const resposta = JogoService.PerformarAção(socket, jogador, codigo, alvo)
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("MaisUmPronto")
                socket.emit("PerformouAcao")
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
                }
            }
        })

        socket.on("Votar", (jogador, codigo, alvo = null) => {
            const resposta = JogoService.Votar(socket,jogador, codigo, alvo)
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("MaisUmPronto")
                socket.emit("Votou")
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
                }
            }
        })

    });
};