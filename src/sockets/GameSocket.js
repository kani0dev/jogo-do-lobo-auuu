const JogoService = require('../services/JogoService')
const SalaManager = require('../services/SalaManager')
const ConstFuncoes = require('../constants/ConstFuncoes')
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
        if(!socket.jogador){
            console.log("Jogador não autenticado tentou conectar ao socket");
            socket.disconnect();
            return;
        }           
        console.log(socket.jogador.nome + ' conectado');
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
        socket.on("CriarSala", async (callback) => {
            const resposta = await SalaManager.CriarSala(socket, socket.jogador)
            callback(resposta)
            if(resposta.ok){
                io.emit("AtualizarSalas")
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        });

        // Lógica de entrar na sala
        socket.on("EntrarSala", async (codigo, callback) => {
            const resposta = await SalaManager.EntrarSala(socket, socket.jogador, codigo)
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

        socket.on("ReconectarSala", async (codigo, callback) => {
            const resposta = await SalaManager.ReconectarSala(socket, socket.jogador, codigo)
            callback(resposta)
            if(resposta.ok){
                socket.codigoDaSala = codigo
            }
        });

        socket.on("ListarSalasPublicas", async (callback) => {
            const salasPublicas = await SalaManager.listarSalasPublicas()
            callback({ ok: true, dados:{salas: salasPublicas}})
        });

        socket.on("BuscarEstadoDaSala", async (codigo, callback) => {
            const Sala = await SalaManager.buscarSala(codigo)
            if(!Sala){
                 socket.emit("erro", {erro: "Sala com codigo "+codigo+" não encontrada"})
                 callback({erro: "Sala com codigo "+codigo+" não encontrada"})
                 return
            }
            if(!Sala.jogadores[socket.jogador.id]){
                socket.emit("erro", {erro: socket.jogador.nome + " não encontrado na sala "+codigo})
                return {erro: socket.jogador.nome + " não encontrado na sala "+codigo}
            }

            const { jogadores, votos, ...SalaTratada } = Sala;

            SalaTratada.jogadores = {}

            for(id in Sala.jogadores){
                const j = Sala.jogadores[id];
                SalaTratada.jogadores[id] = {
                    id: j.id,
                    nome: j.nome,
                    estado: j.estado,
                };
            }
            const jogador = Sala.jogadores[socket.jogador.id]
            const Funcao = ConstFuncoes.Funcoes[jogador.funcao]
            const FuncaoDoJogador = {
                nome: Funcao.nome,
                descricao: Funcao.descricao,
                equipe: Funcao.equipe,
                TemAcao: !!Funcao.acao
            } 
            callback({ ok: true, dados:{Sala: SalaTratada, FuncaoDoJogador}})
        })

        // Lógica de sair da sala
        socket.on("SairSala", async (callback) => {
            if(!socket.codigoDaSala){
                return
            }
            const resposta = await SalaManager.SairSala(socket, socket.jogador, socket.codigoDaSala)
            if(callback){
                callback(resposta)
            }
            if(resposta.ok){
                io.to(socket.codigoDaSala+"_GERAL").emit("SaiuDaSala", resposta.dados.Sala, resposta.dados.jogador)
                socket.codigoDaSala = null
                if(!resposta.dados.Sala){
                    io.emit("AtualizarSalas")
                }
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        });

        socket.on("MudarProntidão", async (codigo, callback) => {
            const resposta = await SalaManager.MudarProntidao(socket, socket.jogador, codigo)
            if(callback){
                callback(resposta.dados ? resposta.dados.Jogador : null)
            }
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("AtualizaSala", resposta.dados.Sala)
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        })

        socket.on("IniciarPartida", async (codigo, callback) => {
            const resposta = await SalaManager.ComecarJogo(socket, socket.jogador, codigo)
            if(callback){
                callback(resposta)
            }
            if(resposta.ok){
                 io.to(codigo+"_GERAL").emit("PartidaIniciada", resposta.dados.Sala)
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
                }
            }
        })

        socket.on("ListarJogadores", async (codigo, filtro = {}) => {
            const Sala = await SalaManager.buscarSala(codigo)
            if(!Sala){
                 socket.emit("erro", {erro: "Sala com codigo "+codigo+" não encontrada"})
                 return
            }
            if(!Sala.jogadores[socket.jogador.id]){
                socket.emit("erro", {erro: socket.jogador.nome + " não encontrado na sala "+codigo})
                return {erro: socket.jogador.nome + " não encontrado na sala "+codigo}
            }
        })

        socket.on("Acao", async (codigo, alvo = null, callback) => {
            const resposta = await JogoService.Agir(socket, socket.jogador, codigo, alvo)
            if(callback){
                callback(resposta)
            }
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("MaisUmPronto")
                if(resposta.dados.NovoEstado){
                    io.to(codigo+"_GERAL").emit("MudouEstado", resposta)
                }
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
            
        })

        socket.on("Votar", async (codigo, alvo = null) => {
            const resposta = await JogoService.Votar(socket,socket.jogador, codigo, alvo)
            if(resposta.ok){
                io.to(codigo+"_GERAL").emit("MaisUmPronto")
            }
            if(resposta.dados && resposta.dados.NovoEstado){
                io.to(codigo+"_GERAL").emit("MudouEstado", resposta.dados.NovoEstado)
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
            
        })

        socket.on("disconnect", (reason) => {
            if(!socket.jogador){
                console.log("Jogador não autenticado desconectou do socket");
                return;
            }
            console.log(socket.jogador.nome + ' desconectado');
            if (reason === "ping timeout") {
                console.log("Conexão perdida por inatividade");
            }
        })

    });
};