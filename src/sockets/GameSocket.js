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
                io.emit("AtualizarSalas")
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

        const emitirFim = (resposta) => {
            if (resposta && resposta.dados && resposta.dados.fim && socket.codigoDaSala) {
                io.to(socket.codigoDaSala + "_GERAL").emit("Fim", resposta)
            }
        }

        socket.on("ListarSalasPublicas", async (callback) => {
            const salasPublicas = await SalaManager.listarSalasPublicas()
            callback({ ok: true, dados:{salas: salasPublicas}})
        });

        socket.on("BuscarEstadoDaSala", async (callback) => {
            const Sala = await SalaManager.buscarSala(socket.codigoDaSala)
            if(!Sala){
                 socket.emit("erro", {erro: "Sala com codigo "+socket.codigoDaSala+" não encontrada"})
                 callback({erro: "Sala com codigo "+socket.codigoDaSala+" não encontrada"})
                 return
            }
            if(!Sala.jogadores[socket.jogador.id]){
                socket.emit("erro", {erro: socket.jogador.nome + " não encontrado na sala "+socket.codigoDaSala})
                return {erro: socket.jogador.nome + " não encontrado na sala "+socket.codigoDaSala}
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
            if(!jogador){
                socket.emit("erro", {erro: socket.jogador.nome + " não encontrado na sala "+socket.codigoDaSala})
                return {erro: socket.jogador.nome + " não encontrado na sala "+socket.codigoDaSala}
            }
            const Funcao = ConstFuncoes.Funcoes[jogador.funcao]
            if(!Funcao){
                socket.emit("erro", { erro: `Função '${jogador.funcao}' não encontrada` })
                return { erro: `Função '${jogador.funcao}' não encontrada` }
            }
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
                io.emit("AtualizarSalas")
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        });

        socket.on("MudarProntidão", async (callback) => {
            const resposta = await SalaManager.MudarProntidao(socket, socket.jogador, socket.codigoDaSala)
            if(callback){
                callback(resposta.dados ? resposta.dados.Jogador : null)
            }
            if(resposta.ok){
                io.to(socket.codigoDaSala+"_GERAL").emit("AtualizaSala", resposta.dados.Sala)
            }
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        })

        socket.on("IniciarPartida", async (callback) => {
            const resposta = await SalaManager.ComecarJogo(socket, socket.jogador, socket.codigoDaSala)
            console.log(resposta)
            if(callback){
                callback(resposta)
            }
            if(resposta.ok){
                 io.to(socket.codigoDaSala+"_GERAL").emit("PartidaIniciada", resposta.dados.Sala)
            }else{
                if(resposta.erro){
                    socket.emit("erro", resposta)
                }
            }
        })

        socket.on("ListarJogadores", async (filtro = {}) => {
            const Sala = await SalaManager.buscarSala(socket.codigoDaSala)
            if(!Sala){
                 socket.emit("erro", {erro: "Sala com codigo "+socket.codigoDaSala+" não encontrada"})
                 return
            }
            if(!Sala.jogadores[socket.jogador.id]){
                socket.emit("erro", {erro: socket.jogador.nome + " não encontrado na sala "+socket.codigoDaSala})
                return {erro: socket.jogador.nome + " não encontrado na sala "+socket.codigoDaSala}
            }
        })

        socket.on("Acao", async (alvo = null, callback) => {
            const respostaAcao = await JogoService.Agir(socket, socket.jogador, socket.codigoDaSala, alvo)
            console.log(respostaAcao)
            if(callback){
                callback(respostaAcao)
            }
            if(respostaAcao.ok){
                const respostaTurno = await JogoService.FinalizarTurno(socket, socket.jogador, socket.codigoDaSala)
                console.log(respostaTurno)
                if(respostaTurno.ok){
                    io.to(socket.codigoDaSala+"_GERAL").emit("MaisUmPronto")
                }
                if(respostaTurno.dados.NovoEstado){
                    io.to(socket.codigoDaSala+"_GERAL").emit("MudouEstado", respostaTurno)
                }
                emitirFim(respostaTurno)
            }
            if(respostaAcao.erro){
                socket.emit("erro", respostaAcao)
            }
            
        })

        socket.on("Votar", async (alvo = null, callback) => {
            const respostaVotacao = await JogoService.Votar(socket,socket.jogador, socket.codigoDaSala, alvo)
            if(callback){
                callback(respostaVotacao)
            }
            if(respostaVotacao.ok){
                const respostaTurno = await JogoService.FinalizarTurno(socket, socket.jogador, socket.codigoDaSala)
                console.log(respostaTurno)
                if(respostaTurno.ok){
                    io.to(socket.codigoDaSala+"_GERAL").emit("MaisUmPronto")
                }
                if(respostaTurno.dados.NovoEstado){
                    io.to(socket.codigoDaSala+"_GERAL").emit("MudouEstado", respostaTurno)
                }
                emitirFim(respostaTurno)
            }
            if(respostaVotacao.erro){
                socket.emit("erro", respostaVotacao)
            }
            
        })

        socket.on("FinalizarTurno", async(callback) => {
            const resposta = await JogoService.FinalizarTurno(socket, socket.jogador, socket.codigoDaSala)
            if(callback){
                callback(resposta)
            }
            if(resposta.ok){
                io.to(socket.codigoDaSala + "_GERAL").emit("MaisUmPronto")
            }
            if(resposta.dados.NovoEstado){
                io.to(socket.codigoDaSala+"_GERAL").emit("MudouEstado", resposta)
            }
            emitirFim(resposta)
            if(resposta.erro){
                socket.emit("erro", resposta)
            }
        })

        socket.on("EnviarMensagem", async(texto) => {
            const resposta = await JogoService.SalvarMensagem(socket, socket.jogador, socket.codigoDaSala, texto)
            if(resposta.ok){
                io.to(socket.codigoDaSala + "_GERAL").emit("MensagemRecebida", resposta.dados.mensagem)
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