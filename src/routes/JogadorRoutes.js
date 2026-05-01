const express = require('express');
const router = express.Router();
const jogadorController = require('../controllers/JogadorController');
const endpointAuth = require("../managers/JWTAuth")
// Criar jogador (quando começar o jogo)

router.post('/jogador', jogadorController.criarJogador);

router.post('/login', jogadorController.login); // Rota de login (a ser implementada)

// Listar todos (admin)
router.get('/jogadores',endpointAuth, jogadorController.listarJogadores);

// Buscar jogador por nome
router.get('/jogador/:nome', jogadorController.buscarJogador);

module.exports = router;