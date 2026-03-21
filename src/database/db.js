const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' MongoDB conectado com sucesso!');
        console.log(` Banco: ${process.env.MONGODB_URI}`);
    } catch (error) {
        console.error(' Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;