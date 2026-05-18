const express = require('express');
const router = express.Router();
const JogoController = require('../controllers/JogoController');
const endpointAuth = require("../services/JWTAuth")

// Listar todas publicas
router.get('/salas-publicas',endpointAuth, JogoController.listarSalasPublicas);

module.exports = router;