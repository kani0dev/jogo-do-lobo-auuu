const SalaManager = require("../services/SalaManager")
const JogoService = require("../services/JogoService")
const jwt = require('jsonwebtoken')
const jwt_secret = `${process.env.JWTSECRET}`

exports.listarSalasPublicas = async (req, res) => {
    try{
        const salasPublicas = await SalaManager.listarSalasPublicas()

        return res.status(200).json({
            ok: true,
            salas: salasPublicas
        });
    }catch(erro){
        res.status(500).json({ erro });
    }
}

exports.GetSalaEspecifica = async (req, res) => {
    try{
        const { codigo } = req.params
        const { jogador } = req.body
        const Sala = await SalaManager.buscarSala(codigo)
        if(!Sala){
            return res.status(500).json({ erro: "Sala com o codigo "+codigo+" não existe" });
        }
        const jogadorNaSala = Sala.jogadores[jogador.id]
        if(!jogadorNaSala){
            return res.status(500).json({ erro: "Jogador "+jogador.nome+" não está na sala "+codigo});
        }

        return res.status(200).json({
            ok: true,
            Sala 
        })

    }catch(erro){
        res.status(500).json({ erro });
    }
}

exports.CriarSala = async (req, res) => {
    try{
        const { socket, jogador, config = {} } = req.body
        const resposta = await SalaManager.CriarSala(socket, jogador, config)
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