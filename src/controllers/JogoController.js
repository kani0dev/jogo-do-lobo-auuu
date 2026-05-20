const SalaManager = require("../services/SalaManager")
const JogoService = require("../services/JogoService")
const jwt = require('jsonwebtoken')
const jwt_secret = `${process.env.JWTSECRET}`

exports.listarSalasPublicas = (req, res) => {
    try{
        const todasAsSalas = Object.values(SalaManager.Salas);
        
        const salasPublicas = todasAsSalas.filter(sala => 
            sala.privacidade === 'publica' && sala.sala_estado === 'ESPERANDO'
        );

        return res.status(200).json({
            ok: true,
            salas: salasPublicas
        });
    }catch(erro){
        res.status(500).json({ erro });
    }
}

exports.GetSalaEspecifica = (req, res) => {
    try{
        const { codigo } = req.params
        const { jogador } = req.body
        const Sala = SalaManager.Salas[codigo]
        if(!Sala){
            res.status(500).json({ erro: "Sala com o codigo "+codigo+" não existe" });
        }
        const jogadorNaSala = Sala.jogadores[jogador.id]
        if(!jogadorNaSala){
            res.status(500).json({ erro: "Jogador "+jogador.nome+" não está na sala "+codigo});
        }

        return res.status(200).json({
            ok: true,
            Sala 
        })

    }catch(erro){
        res.status(500).json({ erro });
    }
}

exports.CriarSala = (req, res) => {
    try{
        const { socket, jogador, config = {} } = req.body
        const resposta = SalaManager.CriarSala(socket, jogador, config)
        if(resposta.ok){
            return res.status(200).json({
                ok: true,
                Sala: resposta.dados.Sala
            });
        }else{
            if(resposta.erro){
                res.status(500).json({ erro });
            }
        }
    }catch(erro){
        res.status(500).json({ erro });
    }
}