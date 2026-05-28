const JogoService = require('../services/JogoService')
const SalaManager = require('../services/SalaManager')
const jwt = require('jsonwebtoken');
const jwt_secret = `${process.env.JWTSECRET}`

//* Aqui é onde as requisições do socket são recebidas e passadas pro controller
module.exports = (io) => {
    io.use((socket, next) => { // Middleware que checa o token do jogador antes de conectar o socket
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Acesso negado. Token não fornecido."));
        }
        try {
            const decodificado = jwt.verify(token, jwt_secret);            
            socket.jogador = decodificado
            socket.codigoDaSala = null
            next(); 
        } catch (erro) {
            return next(new Error("Token inválido ou expirado."));
        }
    });
    
    
    io.on('connection', (socket) => {
        console.log(socket.id + ' conectado');
        socket.use((packet, next) => { // Middleware que checa o token do jogador após cada requisição do socket
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Acesso negado. Token não fornecido."));
            }
            try {
                jwt.verify(token, jwt_secret);
                next();
            } catch (erro) {
                return next(new Error("Token inválido ou expirado."));
            }
        });
        socket.emit('carregarJogador', socket.jogador, socket.codigoDaSala); // Manda as informações do jogador pro cliente pra ele mandar 
        
        // Lógica de criar sala
        socket.on("CriarSala", (callback) => {
            const resposta = SalaManager.CriarSala(socket, socket.jogador)
            callback(resposta)
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        });

        // Lógica de entrar na sala
        socket.on("EntrarSala", (codigo, callback) => {
            const resposta = SalaManager.EntrarSala(socket, socket.jogador, codigo)
            callback(resposta)
            if(resposta.ok){
                socket.broadcast.to(codigo+"_GERAL").emit("EntrouNaSala", resposta.dados.Sala, resposta.dados.jogadorNovo)
                socket.codigoDaSala = codigo
            }
            if(resposta.erro){
                if(!resposta.erro.includes("já existe")){
                    socket.emit("erro", resposta)
                    return
                }
                socket.codigoDaSala = codigo
            }
        });

        socket.on("ReconectarSala", (codigo, callback) => {
            const resposta = SalaManager.ReconectarSala(socket, socket.jogador, codigo)
            callback(resposta)
            if(resposta.ok){
                socket.codigoDaSala = codigo
            } //else if(resposta.erro){
            //     socket.emit("erro", resposta)
            // }
        });

        socket.on("ListarSalasPublicas", (callback) => {
            const todasAsSalas = Object.values(SalaManager.Salas);
            const salasPublicas = todasAsSalas.filter(sala => 
                sala.privacidade.toUpperCase() === 'PUBLICO' && sala.sala_estado === 'ESPERANDO'
            );
            callback({ ok: true, dados:{salas: salasPublicas}})
        });

        socket.on("BuscarSala", (codigo) => {
            const Sala = SalaManager.Salas[codigo]
            if(!Sala){
                 socket.emit("erro", {erro: "Sala com codigo "+codigo+" não encontrada"})
                 return
            }


            socket.emit("SalaEncontrada", Sala)
        })

        // Lógica de sair da sala
        socket.on("SairSala", (callback) => {
            if(!socket.codigoDaSala){
                return
            }
            const resposta = SalaManager.SairSala(socket, socket.jogador, socket.codigoDaSala)
            if(callback){
                callback(resposta)
            }
            if(resposta.ok){
                io.to(socket.codigoDaSala+"_GERAL").emit("SaiuDaSala", resposta.dados.Sala, resposta.dados.jogador)
                socket.codigoDaSala = null
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        });

        socket.on("MudarProntidão", (codigo, callback) => {
            const resposta = SalaManager.MudarProntidao(socket, socket.jogador, codigo)
            if(callback){
                callback(resposta.dados.Jogador)
            }
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("AtualizaSala", resposta.dados.Sala)
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        })

        socket.on("IniciarPartida", (codigo, callback) => {
            const resposta = SalaManager.ComecarJogo(socket, socket.jogador, codigo)
            console.log(resposta)
            callback()
            if(resposta.ok){
                 io.to(codigo+"_GERAL").emit("PartidaIniciada", resposta.dados.Sala)
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
                }
            }
        })

        socket.on("Acao", (codigo, alvo = null) => {
            const resposta = JogoService.PerformarAção(socket, socket.jogador, codigo, alvo)
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("MaisUmPronto")
                socket.emit("PerformouAcao")
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
                }
            }
        })

        socket.on("Votar", (codigo, alvo = null) => {
            const resposta = JogoService.Votar(socket,socket.jogador, codigo, alvo)
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("MaisUmPronto")
                socket.emit("Votou")
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
                }
            }
        })

        socket.on("disconnect", (reason) => {
            console.log(socket.jogador.nome + ' desconectado');
            if (reason === "ping timeout") {
                console.log("Conexão perdida por inatividade");
            }
        })

    });
};