const mongoose = require('mongoose');

const jogadorSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, 'E-mail é obrigatório'],
        unique: true,
        trim: true
    },
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        unique: true,
        trim: true,
        minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
        maxlength: [20, 'Nome deve ter no máximo 20 caracteres']
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatório']
    },
    foto: {
        type: String,
        required: false,
        default: null
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    }
},{
    collection: 'Jogadores'
});

module.exports = mongoose.model('Jogador', jogadorSchema);