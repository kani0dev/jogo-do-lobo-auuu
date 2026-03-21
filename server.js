const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/database/db');
const jogadorRoutes = require('./src/routes/jogadorRoutes');

const app = express();

// Conectar ao banco de dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api', jogadorRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        nome: 'API Lobitos',
        versao: '1.0',
        endpoints: {
            cadastrar: 'POST /api/jogador',
            buscar: 'GET /api/jogador/:nome',
            listar: 'GET /api/jogadores',
            deletar: 'DELETE /api/jogador/:id'
        }
    });
});

// Tratamento de erro 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🎮 Servidor rodando na porta ${PORT}`);
    console.log(`📝 API disponível em: http://localhost:${PORT}`);
});