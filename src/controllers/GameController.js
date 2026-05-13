const SalaManager = require("../managers/SalaManager")

exports.handleAttack = (target) => {
    SalaManager.Salas[codigo].jogadores[target].estado = "atacado" //? Sla algo assim
}

// distribuição de papeis no inicio do jogo
function distribuirPapeis(jogadores){
    //olha como no inicio vamos deixar no simples, depois podemos pensar em algo mais complexo
    const papeis = ["lobo", "ovelha", "medico"]
    const jogadoresIds = Object.keys(jogadores)

    const quantidadedeLobos = jogadoresIds.length >= 6 ? 2 : 1;

    const papeis = []

    // para adicionar os lobos
    for(let i = 0; i < quantidadedeLobos; i++){
        papeis.push("lobo")
    }

    //para adicionar médico 
    papeis.push("medico")

    // o restante são ovelhas
    const quantidadeOvelhas = jogadoresIds.length - quantidadedeLobos - 1
    for(let i = 0; i < quantidadeOvelhas; i++){
        papeis.push("ovelha")
    }

    // embaralha os papeis
    const embaralhado = [...jogadores];
    for(let i = embaralhado.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
    }   

    // atribui os papeis aos jogadores
    const resultado = {}
    embaralhado.forEach((jogador, index) => {
        resultado[jogador] = papeis[index]
    });

    return resultado
}

//processa votação do rebanho (quem vai ser expulso (mabel))

function processarVotacaoRebanho(votos){
    // votos é um objeto onde a chave é o id do jogador e o valor é o id do jogador votado
    const contagemVotos = {}
    Object.values(votos).forEach(voto => {
        if(!contagemVotos[voto]){
            contagemVotos[voto] = 0
        }
        contagemVotos[voto]++
    });

    // encontra o jogador com mais votos
    let jogadorExpulso = null
    let maxVotos = 0;

    for (const jogador in contagemVotos) {
        if (contagemVotos[jogador] > maxVotos) {
            maxVotos = contagemVotos[jogador];
            jogadorExpulso = jogador;
        }
    }

    return jogadorExpulso;

}

// se houver empate, ninguém é expulso, ou seja, o jogo continua normalmente
 const empate = Object.values(contagemVotos).filter(votos => votos === maxVotos).length > 1
    if(empate){
        return { empate: true }
    }

    // lobo MATA alguem a noite (mabel)

    function LoboMata(alvo, papeis){
        const papelAlvo = papeis[alvo];

    // mata alvo
    delete papeis[alvo]

    return papelAlvo
    }

    // conta quantas ovelhas e lobos ainda estão vivas
const ovelhasVivas = Object.values(papeis).filter(papel => papel === "ovelha").length>0
const medicoVivo = Object.values(papeis).filter(papel => papel === "medico").length>0
const lobosVivos = Object.values(papeis).filter(papel => papel === "lobo").length;

let resultado = {
    morto: alvo,
    papelMorto: papelAlvo,
    ovelhasRestantes: ovelhasVivas,
    medicoVivo: medicoVivo,
    lobosRestantes: lobosVivos,
    JogoAcaba: false,
    vencedor: null ,
}

// o jogo só acaba seNÃO houver mais ovelhas.

if (ovelhasVivas === 0){
    resultado.JogoAcaba = true;
    resultado.vencedor = "lobos"
}

// médico protege alguém mas é opcional
function medicoProtege(protegido){
 protegido.protegido = true,
 salvou = protegido
 return salvou

}

// RODADA COMPLETA (DIA + NOITE)

function rodadaCompleta(estadoAtual, votos, alvoLobo, protegidoMedico = null) {
    let { papeis } = estadoAtual;

    // Processa a votação do rebanho
    const jogadorExpulso = processarVotacaoRebanho(votos);

    let jogadores = Object.keys(papeis);

   console.log(`/n========= RODADA ${estadoAtual.rodada} =========/n`);
   console.log("Jogadores vivos: ${jogadores.join(", ")}");
   console.log("Jogador expulso: ${jogadorExpulso} (${papeis[jogadorExpulso]})");
}

   // Se o jogador expulso for um lobo, o jogo pode acabar
   if (papeis[jogadorExpulso] === "lobo") {
       const lobosRestantes = Object.values(papeis).filter(papel => papel === "lobo").length - 1; // -1 porque um lobo foi expulso
       if (lobosRestantes === 0) {
           return { vencedor: "ovelhas", jogoAcaba: true };
       }}
   else{
console.log(`DIA: Ninguém foi expulso, o jogo continua!`);
   }

   jogadores = Object.keys(papeis);
   console.log("Jogadores vivos após votação: ${jogadores.join(", ")}");

   if(jogadores.length === 0){
    return{
        rodada: rodada ,
        resultadoFinal: `Todos os jogadores foram eliminados. LOBOS VENCEM!`,
        historico: historico
    };

    }

    // verifica proteção do médico
    if (protegidoMedico && protegidoMedico.protegido) {
        console.log(`NOITE: ninguem morreu ${protegidoMedico.id}`);
    }

    //qualquer outro caso, o lobo mata alguém
    const resultadoLobo = LoboMata(alvoLobo, papeis);
    console.log(`NOITE: ${alvoLobo} foi atacado e era um ${resultadoLobo}`);

    // atualiza o estado do jogo
    estadoAtual.papeis = papeis;
    estadoAtual.rodada++;
    return estadoAtual;

    // proxima rodada

      return {
        rodada: rodada,
        jogoContinua: true,
        novoEstado: {
            papeis: papeis,
            medicoVivo: medicoAindaVivo,
            rodada: rodada + 1,
            historico: [...historico, {
                rodada: rodada,
                expulso: resultadoDia.expulso,
                morto: alvoFinal,
                medicoSalvou: medicoSalvou
            }]
        },
        resumoDia: resultadoDia,
        resumoNoite: resultadoNoite,
        mensagem: resultadoNoite ? resultadoNoite.mensagem : "Ninguém morreu durante a noite."
    };


    //Verifica se o jogo já acabou (antes de começar)
function verificarVitoriaAntecipada(papeis) {
    const lobos = Object.values(papeis).filter(p => p === 'lobo').length;
    const ovelhas = Object.values(papeis).filter(p => p === 'ovelha').length;
    
    if (lobos === 0) {
        return { acabou: true, vencedor: 'aldeia', motivo: 'Todos os lobos foram expulsos!' };
    }
    
    if (ovelhas === 0) {
        return { acabou: true, vencedor: 'lobo', motivo: 'Todas as ovelhas foram mortas!' };
    }
    
    return { acabou: false };
}

//Visão de cada jogador
function getVisaoJogador(jogador, papeis, historico, rodada) {
    const papel = papeis[jogador];
    const todosVivos = Object.keys(papeis);
    
    if (papel === 'lobo') {
        const outrosLobos = todosVivos.filter(j => j !== jogador && papeis[j] === 'lobo');
        return {
            seuPapel: 'lobo',
            aliados: outrosLobos,
            visao: ` Você é LOBO. Aliados: ${outrosLobos.join(', ') || 'você é o único lobo'}`,
            mortos: historico.filter(h => h.morto)
        };
    }
    
    if (papel === 'medico') {
        return {
            seuPapel: 'medico',
            aliados: [],
            visao: `Você é MÉDICO. Proteja os inocentes!`,
            mortos: historico.filter(h => h.morto)
        };
    }
    
    return {
        seuPapel: 'ovelha',
        aliados: [],
        visao: `Você é OVELHA. Descubra quem é o lobo antes que seja tarde! (talvez seja a Mabel)`,
        mortos: historico.filter(h => h.morto)
    };
}


// EXPORTA

module.exports = {
    distribuirPapeis,
    processarVotacaoRebanho,
    LoboMata,
    medicoProtege,
    rodadaCompleta,
    verificarVitoriaAntecipada,
    getVisaoJogador
}
