const mongoose = require('mongoose');

const jogadorSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        unique: true,
        trim: true,
        minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
        maxlength: [20, 'Nome deve ter no máximo 20 caracteres']
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
});

module.exports = mongoose.model('Jogador', jogadorSchema);