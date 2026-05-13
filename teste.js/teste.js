const Gamelogic = require('./src/controllers/GameController.js');

//5 jogadores
const jogadores = ['Pedro', 'Arthur', 'Mabel', 'Favela', 'Gabriel']

// distribuição de papeis
const papeis = Gamelogic.distribuirPapeis(jogadores)
console.log("Resultado da distribuição de papéis:", papeis);
console.log("Jogadores:", jogadores);

// estado inicial do jogo
let estadoAtual = {
    papeis: papeis,
    rodada: 1,
    historico: []
};

console.log("Estado inicial do jogo:", estadoAtual);

// Simulação de uma rodada completa

const votosDia = {
    'Pedro': 'Mabel',
    'Arthur': 'Mabel',
    'Mabel': 'Arthur',
    'Favela': 'Arthur',
    'Gabriel': 'Mabel'
};

// Simulação de um ataque noturno, (não acaba o jogo a menos que sejam todas as ovelhas e medicos mortos)
const alvoLobo = 'Favela';
const protegidoMedico = { id: 'Favela', protegido: true }; // Simula o médico protegendo Favela
estadoAtual = Gamelogic.rodadaCompleta(estadoAtual, votosDia, alvoLobo, protegidoMedico);
console.log("Estado do jogo após a rodada completa:", estadoAtual);

// FUNÇÃO PARA PROTEGER O JOGADOR PELO MÉDICO

function protegerJogador(jogador, estadoAtual) {
    let { papeis } = estadoAtual;
    let protegido = { id: jogador, protegido: true };
if (resultado.resultadoFinal) {
    console.log(`\n🏆 VENCEDOR: ${resultado.resultadoFinal.toUpperCase()}`);
    console.log(resultado.mensagem);
} else {
    console.log('\n🔄 JOGO CONTINUA!');
}
return protegido
}
