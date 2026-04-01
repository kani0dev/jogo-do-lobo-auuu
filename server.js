const express = require('express');
const cors = require('cors'); //? talvez nem precise, o html vai ser entregue pelo prorpio server.js (de acrodo com o gemini)
const connectDB = require('./src/database/db');//importa a função de conexão do banco de dados
const jogadorRoutes = require('./src/routes/JogadorRoutes');//importa as rotas do CRUD de jogadores

//* Importação de funções pro socket.io funcionar
const { createServer } = require('node:http'); //cria um server "cru" a partir do express, pq o socket só funciona assim
const { Server } = require('socket.io'); //importa o socket.io
const { join } = require('node:path'); //importa o join, necessário pq o express não interpreta rotas relativas
const GameSocket = require('./src/sockets/GameSocket.js') //importa o "GameSocket", onde a lógica do jogo existe
require('dotenv').config();

const app = express();

//* Configuração do socket.io
const server = createServer(app) //cria o server "cru" a partir do express
const io = new Server(server);
GameSocket(io) //envia o "io", objeto principal do socket.io, como parametro pro GameSocket.io

connectDB();// Conecta ao banco de dados

//* Middlewares
app.use(cors()); // ?
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'src/frontend'))); //faz com que o index.html possa acessar arquivos estáticos da pasta "frontend"

//* Rotas da API
app.use('/api', jogadorRoutes);

//* Rota padrão
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '/src/frontend/index.html'))
    /*res.json({
        nome: 'API Lobitos',
        versao: '1.0',
        endpoints: {
            cadastrar: 'POST /api/jogador',
            buscar: 'GET /api/jogador/:nome',
            listar: 'GET /api/jogadores',
            deletar: 'DELETE /api/jogador/:id'
        }
    });*/
});

//* Tratamento de erro 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎮 Servidor rodando na porta ${PORT}`);
    console.log(`📝 API disponível em: http://localhost:${PORT}`);
});