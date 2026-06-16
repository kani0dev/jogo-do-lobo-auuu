const Jogador = require('../models/Jogador');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwt_secret = `${process.env.JWTSECRET}`

// Criar jogador (cadastro único)
exports.criarJogador = async (req, res) => {
    try {
        const { email, nome, senha } = req.body;
        
        if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
            return res.status(400).json({ 
                error: 'Todos os campos (nome, email, senha) são obrigatórios' 
            });
        }
        
        const emailLimpo = email.trim().toLowerCase()
        const emailExiste = await Jogador.findOne({ email: emailLimpo });
        if (emailExiste) {
            return res.status(400).json({ 
                error: 'Este email já está em uso!' 
            });
        }

        const nomeExiste = await Jogador.findOne({ nome: nome.trim() });
        if (nomeExiste) {
            return res.status(400).json({ 
                error: 'Este nome já está em uso!' 
            });
        }
        
        const senhaCript = await bcrypt.hash(senha,10)
        const jogador = await Jogador.create({ 
            email: emailLimpo,
            nome: nome.trim(),
            senha: senhaCript
        });
        
        res.status(201).json({
            success: true,
            message: 'Jogador cadastrado!',
            jogador: {
                email: jogador.email,
                nome: jogador.nome
            }
        });
    } catch (error) {
        console.log(error)
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
        console.log(error)
        res.status(500).json({ error: 'Erro ao buscar' });
    }
};

// Listar todos
exports.listarJogadores = async (req, res) => {
    try {
        const jogadores = await Jogador.find()
            .sort({ dataCadastro: -1 })
            .select('email nome dataCadastro');
        
        res.json({
            success: true,
            count: jogadores.length,
            jogadores
        });
    } catch (error) {
        console.log(error)
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
        console.log(error)
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
                { id: jogador._id, nome: jogador.nome, logado: true }, 
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
        res.status(500).json({ 
            error: "Erro interno no servidor",
            message : error
         });
    }
};

exports.loginConvidado = async (req, res)=> {
    try {
        const { nome } = req.body;

        const TempId = crypto.randomUUID()

        if(nome.trim() != "") {
            const token = jwt.sign(
                { id: TempId, nome: nome+"(Convidado)", logado: false }, 
                process.env.JWTSECRET, 
                { expiresIn: '1h' }
            );

            return res.json({ 
                success: true,
                token,
                jogador: { id: TempId, nome } 
            });
        }

        res.status(500).json({ 
            error: "Erro interno no servidor",
            message : error
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Erro interno no servidor",
            message : error
         });
    }
}