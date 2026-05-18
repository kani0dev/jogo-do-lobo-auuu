const express = require('express');
const cors = require('cors'); //! talvez nem precise, o html vai ser entregue pelo prorpio server.js (de acrodo com o gemini)
const connectDB = require('./src/database/db');//importa a função de conexão do banco de dados
const jogadorRoutes = require('./src/routes/JogadorRoutes');//importa as rotas do CRUD de jogadores
const jogoRoutes = require('./src/routes/JogoRoutes');//importa as rotas das salas

//* Importação de funções pro socket.io funcionar
const { createServer } = require('node:http'); //cria um server "cru" a partir do express, pq o socket só funciona assim
const { Server } = require('socket.io'); //importa o socket.io
const { join } = require('node:path'); //importa o join, necessário pq o express não interpreta rotas relativas
const GameSocket = require('./src/sockets/GameSocket.js') //importa o "GameSocket", onde a lógica do jogo existe
const path = require('path');
require('dotenv').config();
const endpointAuth = require("./src/services/JWTAuth")

const app = express();
connectDB();// Conecta ao banco de dados

//* Configuração do socket.io
const server = createServer(app) //cria o server "cru" a partir do express
const io = new Server(server, {connectionStateRecovery: {}});//"connectionRecovery" lida com breves desconexões
GameSocket(io) //envia o "io", objeto principal do socket.io, como parametro pro GameSocket.io

//* Middlewares
app.use(cors()); //!
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

//* Configurar EJS como motor de template
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

//* Servir arquivos estáticos (CSS, imagens)
// app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

//* Rotas da API
app.use('/api', jogadorRoutes);
app.use('/api', jogoRoutes);

//* ROTA DA PÁGINA DE LOGIN (é isso que estava faltando!)
app.get('/', (req, res) => {
    // res.render('login');
    res.sendFile("index.html")
});



// Rota para processar o login
app.post('/entrar',endpointAuth, (req, res) => { 
    let { nome } = req.body;

    console.log("Nome recebido:", nome);
    console.log(token);
    
    res.redirect(`/jogo?nome=${encodeURIComponent(nome)}`);
});

//* Rota da página do jogo
app.get('/jogo', (req, res) => {
    const nome = req.query.nome;
    res.render('jogo', { nome });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(` Servidor rodando na porta ${PORT}`);
    console.log(` Acesse: http://localhost:${PORT}`);
    const repl = require('repl').start('> ');
    repl.context.JogoService = require('./src/services/JogoService');
    repl.context.SalaManager = require('./src/services/SalaManager');
});
