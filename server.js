const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./src/database/db');
const jogadorRoutes = require('./src/routes/jogadorRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar EJS como motor de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos (CSS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api', jogadorRoutes);

// ROTA DA PÁGINA DE LOGIN (é isso que estava faltando!)
app.get('/', (req, res) => {
    res.render('login');
});

// Rota para processar o login
app.post('/entrar', (req, res) => {
    const { nome } = req.body;
    console.log("Nome recebido:", nome);
    res.redirect(`/jogo?nome=${encodeURIComponent(nome)}`);
});

// Rota da página do jogo
app.get('/jogo', (req, res) => {
    const nome = req.query.nome;
    res.render('jogo', { nome });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Servidor rodando na porta ${PORT}`);
    console.log(` Acesse: http://localhost:${PORT}`);
});