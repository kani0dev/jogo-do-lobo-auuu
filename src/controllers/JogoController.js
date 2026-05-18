const SalaManager = require("../services/SalaManager")
const JogoService = require("../services/JogoService")

//TODO: Mudar pra ca as requisições do socket, GameSocket -> JogoController -> JogoService/SalaManager

exports.listarSalasPublicas = (req, res) => {
    const todasAsSalas = Object.values(SalaManager.Salas);
    
    const salasPublicas = todasAsSalas.filter(sala => 
        sala.privacidade === 'publica' && sala.sala_estado === 'ESPERANDO'
    );

    return res.status(200).json({
        sucesso: true,
        salas: salasPublicas
    });
}