const express = require('express');
const router = express.Router();
const jogadorController = require('../controllers/jogadorController');

// Criar jogador (quando começar o jogo)
router.post('/jogador', jogadorController.criarJogador);

router.post('/login', jogadorController.login); // Rota de login (a ser implementada)

// Listar todos (admin)
router.get('/jogadores', jogadorController.listarJogadores);

// Buscar jogador por nome
router.get('/jogador/:nome', jogadorController.buscarJogador);

module.exports = router;