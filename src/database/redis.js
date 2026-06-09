const { createClient } = require('redis')
require('dotenv').config();

const redis = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
})

redis.on('error', err => console.error('Redis error', err))

async function connectRedis() {
    try {
        if (!redis.isOpen) {
            await redis.connect()
        }
        return redis
    } catch (error) {
        console.error('Erro ao conectar ao Redis:', error)
        process.exit(1)
    }
}
//* Salas
const SALAS_KEY = 'salas'

async function salvarSala(sala) {
    if (!redis.isOpen) {
        await connectRedis()
    }
    await redis.hSet(SALAS_KEY, sala.codigo, JSON.stringify(sala))
    return sala
}

async function buscarSala(codigo) {
    if (!redis.isOpen) {
        await connectRedis()
    }
    const raw = await redis.hGet(SALAS_KEY, codigo)
    return raw ? JSON.parse(raw) : null
}

async function removerSala(codigo) {
    if (!redis.isOpen) {
        await connectRedis()
    }
    return redis.hDel(SALAS_KEY, codigo)
}

async function listarSalas() {
    if (!redis.isOpen) {
        await connectRedis()
    }
    const raw = await redis.hGetAll(SALAS_KEY)
    return Object.values(raw).map(JSON.parse)
}

module.exports = {
    connectRedis,
    salvarSala,
    buscarSala,
    removerSala,
    listarSalas,
    client: redis
}
