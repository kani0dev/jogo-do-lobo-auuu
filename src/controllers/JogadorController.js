const Jogador = require('../models/Jogador');

// Criar jogador (cadastro único)
exports.criarJogador = async (req, res) => {
    try {
        const { nome } = req.body;
        
        if (!nome || nome.trim() === '') {
            return res.status(400).json({ 
                error: 'Nome é obrigatório' 
            });
        }

        const existe = await Jogador.findOne({ nome: nome.trim() });
        if (existe) {
            return res.status(400).json({ 
                error: 'Este nome já está em uso!' 
            });
        }

        const jogador = await Jogador.create({ nome: nome.trim() });
        
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
        res.status(500).json({ error: 'Erro ao cadastrar' });
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
        res.status(500).json({ error: 'Erro ao listar' });
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