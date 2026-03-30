const express = require('express');
const cors = require('cors');//talvez nem precise, o html vai ser entregue pelo prorpio  (de acrodo com o gemini)
//importação de funções de servidor(necessário pro socket.io funcionar)
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');
require('dotenv').config();


const connectDB = require('./src/database/db');
const jogadorRoutes = require('./src/routes/JogadorRoutes');

const app = express();

//configuração do socket.io
const server = createServer(app)
const io = new Server(server);

// Conectar ao banco de dados
connectDB();

// Middlewares
app.use(cors()); //** 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'src/frontend')));

// Rotas da API
app.use('/api', jogadorRoutes);

// Rota de teste
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

// Tratamento de erro 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

//Funções do socket.io
io.on('connection', (socket) => {
    console.log(socket.id + ' connected');

    socket.on("entrar", (cod) => {
        //Logica de entrar na sala
        console.log(socket.id + " conectou na sala " + cod)
    })

    socket.on("criar", () => {
        //Lógica de criar sala
    })

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎮 Servidor rodando na porta ${PORT}`);
    console.log(`📝 API disponível em: http://localhost:${PORT}`);
});