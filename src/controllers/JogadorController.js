const Jogador = require('../models/Jogador');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwt_secret = `${process.env.JWTSECRET}`

// Criar jogador (cadastro único)
exports.criarJogador = async (req, res) => {
    try {
        const { nome,senha } = req.body;
        
        if (!nome || !senha) {
            return res.status(400).json({ 
                error: 'Senha e Nome são obrigatórios' 
            });
        }

        const existe = await Jogador.findOne({ nome: nome.trim() });
        if (existe) {
            return res.status(400).json({ 
                error: 'Este nome já está em uso!' 
            });
        }
        const hash_senha = await bcrypt.hash(senha, 10);
        const jogador = await Jogador.create({
        nome: nome, 
        senha: hash_senha
    });
        res.status(201).json({
            success: true,
            message: 'Jogador cadastrado!',
            jogador: {
                id: jogador._id,
                nome: jogador.nome,
                dataCadastro: jogador.dataCadastro
            }
        });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Buscar jogador por nome
exports.buscarJogador = async (req, res) => {
    try {
        const { nome } = req.params;
        const jogador = await Jogador.findOne({ nome });
        
        if (!jogador) {
            return res.status(404).json({ error: 'Jogador não encontrado' });
        }
        
        res.json({
            success: true,
            nome: jogador.nome,
            dataCadastro: jogador.dataCadastro
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar' });
    }
};

// Listar todos
exports.listarJogadores = async (req, res) => {
    try {
        const jogadores = await Jogador.find()
            .sort({ dataCadastro: -1 })
            .select('nome dataCadastro');
        
        res.json({
            success: true,
            count: jogadores.length,
            jogadores
        });
    } catch (error) {
        res.status(500).json({ error});
    }
};

// Deletar jogador
exports.deletarJogador = async (req, res) => {
    try {
        const { id } = req.params;
        await Jogador.findByIdAndDelete(id);
        res.json({ success: true, message: 'Jogador removido' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar' });
    }
};

// Rota de login (a ser implementada)
exports.login = async (req, res) => {
    try {
        const { nome, senha } = req.body;

        const jogador = await Jogador.findOne({ nome: nome.trim() });
        
        if (!jogador) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const senhaCorreta = await bcrypt.compare(senha, jogador.senha);

        if (senhaCorreta) {
            const token = jwt.sign(
                { id: jogador._id, nome: jogador.nome }, 
                process.env.JWTSECRET, 
                { expiresIn: '1h' }
            );

            return res.json({ 
                success: true,
                token,
                jogador: { id: jogador._id, nome: jogador.nome } 
            });
        }

        return res.status(401).json({ error: "Credenciais inválidas" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};