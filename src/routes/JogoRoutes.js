const express = require('express');
const router = express.Router();
const JogoController = require('../controllers/JogoController');
const endpointAuth = require("../services/JWTAuth")

// Listar todas publicas
router.get('/salas-publicas',endpointAuth, JogoController.listarSalasPublicas);
router.get('/sala-especifica/:codigo', endpointAuth, JogoController.GetSalaEspecifica)

router.post('/criar-sala', endpointAuth, JogoController.CriarSala)


module.exports = router;