const SalaManager = require("./SalaManager")
const ConstFuncoes = require("../constants/ConstFuncoes")
const JogoStateMachine = require("./JogoStateMachine")

// distribuição de papeis no inicio do jogo
exports.DistribuirPapeis = (codigo) => {
    try{
        const Sala = SalaManager.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const JogoNaoComecou = Sala.sala_estado.toUpperCase() == "ESPERANDO" 
        if(JogoNaoComecou){
            return {erro: "O jogo da sala "+codigo+" ainda não começou"}
        }
        const funcoesLista = Sala.funcoes.flatMap(funcao => //Pega as funcoes da sala e as distribui em uma array
            Array.from({ length: funcao.quantidade }, () => funcao.nome)
        );

        for(let i = funcoesLista.length - 1; i > 0; i--){ //Embaralha as funcoes dessa lista
            const j = Math.floor(Math.random() * (i + 1));
            [funcoesLista[i], funcoesLista[j]] = [funcoesLista[j], funcoesLista[i]];
        }   
        
        Object.values(Sala.jogadores).forEach((jogador, index) => { // Atribui as funcoes pra cada jogador
            jogador.funcao = funcoesLista[index]
        })
        return {ok: true, dados: { Sala, mensagem: "Papeis da sala "+codigo+" distribuidos com sucesso" }}
    }catch(erro){
        return { erro }
    }
}

exports.PerformarAção = (socket, jogador, codigo, JogadorAlvo = null) => {
    try{
        //Validações da sala
        const Sala = SalaManager.Salas[codigo]
        if(!Sala){
            return { erro: "Sala "+codigo+", não existe" }
        }
        if(Sala.sala_estado.toUpperCase() != "NOITE"){
            return { erro: jogador.nome + " tentou performar uma ação sem ser a noite"}
        }

        //Validações do jogador
        const JogadorOrigem = Sala.jogadores[jogador.id]
        if(!JogadorOrigem){
            return { erro: jogador.nome + " não está na sala " + codigo}
        }
        if(JogadorOrigem.estado.toUpperCase() == "PRONTO"){
            return { erro: jogador.nome + " já performou a sua ação "}
        }

        //Valida se o jogador tem uma função e um alvo
        const Acao = ConstFuncoes[JogadorOrigem.funcao].acao
        if(Acao && JogadorAlvo){
            const response = Acao(Sala, JogadorOrigem.id, JogadorAlvo.id)
            if(response.erro){
                return response
            }
        }
        JogadorOrigem.estado = "PRONTO"

        for(const j of Object.values(Sala.jogadores)){ //Checa se todos os jogadores estão prontos, se pelo menos um não tiver, ele retorna 
            if(j.estado.toUpperCase() != "PRONTO"){
                return {ok: true, dados: {jogador, mensagem: jogador.nome + " performou ação com sucesso"}}
            }
        }

        const resposta = JogoStateMachine.MudaEstadoDaSala(codigo)
        return resposta
        
    }catch(erro){
        return { erro }
    }
}

//processa votação do rebanho (quem vai ser expulso (mabel))
exports.Votar = (socket, jogador, codigo, JogadorAlvo = null) => {
    try{
        const Sala = SalaManager.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        //Checa se o jogador existe, se ele esta morto ou se ele ja votou
        const Eleitor = Sala.jogadores[jogador.id]
        if(!Eleitor){
            return { erro: jogador.nome + " não está na sala " + codigo}
        }
        if(Eleitor.estado.toUpperCase() == "MORTO"){
            return { erro: jogador.nome +  "está morto, morto não vota"}
        }
        for(const v of Sala.votos){
            if(v.de == jogador.id){
                return { erro: "Jogador " + socket.id + " ja votou"}
            }
        }
        
        let voto = {}

        const Alvo = Sala.jogadores[JogadorAlvo.id]

        if(Alvo){ // Se tiver alvo, consta o voto
            if(Alvo.estado.toUpperCase() == "MORTO"){
                return { erro: "Jogador Alvo " + JogadorAlvo.id + " está morto, morto não é votado"}
            }
            voto = {
                de: jogador.id,
                para: JogadorAlvo.id
            }
        }else{ // Se não tiver, o voto é nulo
            voto = {
                de: jogador.id,
                para: null
            }
        }
        
        Sala.votos.push(voto)
        Eleitor.estado = "PRONTO"
        for(const j of Object.values(Sala.jogadores)){ //Checa se todos os jogadores estão prontos, se pelo menos um não tiver, ele retorna 
            if(j.estado.toUpperCase() != "PRONTO"){
                return {ok: true}
            }
        }
        const resposta = JogoStateMachine.MudaEstadoDaSala(codigo)
        return resposta

    }catch(erro){
        return { erro }
    }
}


//     // conta quantas ovelhas e lobos ainda estão vivas
// const ovelhasVivas = Object.values(papeis).filter(papel => papel === "ovelha").length>0
// const medicoVivo = Object.values(papeis).filter(papel => papel === "medico").length>0
// const lobosVivos = Object.values(papeis).filter(papel => papel === "lobo").length;

// let resultado = {
//     morto: alvo,
//     papelMorto: papelAlvo,
//     ovelhasRestantes: ovelhasVivas,
//     medicoVivo: medicoVivo,
//     lobosRestantes: lobosVivos,
//     JogoAcaba: false,
//     vencedor: null ,
// }

// // o jogo só acaba se NÃO houver mais ovelhas.

// if (ovelhasVivas === 0){
//     resultado.JogoAcaba = true;
//     resultado.vencedor = "lobos"
// }

// // médico protege alguém mas é opcional
// function medicoProtege(protegido){
//  protegido.protegido = true,
//  salvou = protegido
//  return salvou

// }

// // RODADA COMPLETA (DIA + NOITE)

// function rodadaCompleta(estadoAtual, votos, alvoLobo, protegidoMedico = null) {
//     let { papeis } = estadoAtual;

//     // Processa a votação do rebanho
//     const jogadorExpulso = processarVotacaoRebanho(votos);

//     let jogadores = Object.keys(papeis);

//    console.log(`/n========= RODADA ${estadoAtual.rodada} =========/n`);
//    console.log("Jogadores vivos: ${jogadores.join(", ")}");
//    console.log("Jogador expulso: ${jogadorExpulso} (${papeis[jogadorExpulso]})");
// }

//    // Se o jogador expulso for um lobo, o jogo pode acabar
//    if (papeis[jogadorExpulso] === "lobo") {
//        const lobosRestantes = Object.values(papeis).filter(papel => papel === "lobo").length - 1; // -1 porque um lobo foi expulso
//        if (lobosRestantes === 0) {
//            return { vencedor: "ovelhas", jogoAcaba: true };
//        }}
//    else{
// console.log(`DIA: Ninguém foi expulso, o jogo continua!`);
//    }

//    jogadores = Object.keys(papeis);
//    console.log("Jogadores vivos após votação: ${jogadores.join(", ")}");

//    if(jogadores.length === 0){
//     return{
//         rodada: rodada ,
//         resultadoFinal: `Todos os jogadores foram eliminados. LOBOS VENCEM!`,
//         historico: historico
//     };

//     }

//     // verifica proteção do médico
//     if (protegidoMedico && protegidoMedico.protegido) {
//         console.log(`NOITE: ninguem morreu ${protegidoMedico.id}`);
//     }

//     //qualquer outro caso, o lobo mata alguém
//     const resultadoLobo = LoboMata(alvoLobo, papeis);
//     console.log(`NOITE: ${alvoLobo} foi atacado e era um ${resultadoLobo}`);

//     // atualiza o estado do jogo
//     estadoAtual.papeis = papeis;
//     estadoAtual.rodada++;
//     return estadoAtual;

//     // proxima rodada

//       return {
//         rodada: rodada,
//         jogoContinua: true,
//         novoEstado: {
//             papeis: papeis,
//             medicoVivo: medicoAindaVivo,
//             rodada: rodada + 1,
//             historico: [...historico, {
//                 rodada: rodada,
//                 expulso: resultadoDia.expulso,
//                 morto: alvoFinal,
//                 medicoSalvou: medicoSalvou
//             }]
//         },
//         resumoDia: resultadoDia,
//         resumoNoite: resultadoNoite,
//         mensagem: resultadoNoite ? resultadoNoite.mensagem : "Ninguém morreu durante a noite."
//     };


//     //Verifica se o jogo já acabou (antes de começar)
// function verificarVitoriaAntecipada(papeis) {
//     const lobos = Object.values(papeis).filter(p => p === 'lobo').length;
//     const ovelhas = Object.values(papeis).filter(p => p === 'ovelha').length;
    
//     if (lobos === 0) {
//         return { acabou: true, vencedor: 'aldeia', motivo: 'Todos os lobos foram expulsos!' };
//     }
    
//     if (ovelhas === 0) {
//         return { acabou: true, vencedor: 'lobo', motivo: 'Todas as ovelhas foram mortas!' };
//     }
    
//     return { acabou: false };
// }

// //Visão de cada jogador
// function getVisaoJogador(jogador, papeis, historico, rodada) {
//     const papel = papeis[jogador];
//     const todosVivos = Object.keys(papeis);
    
//     if (papel === 'lobo') {
//         const outrosLobos = todosVivos.filter(j => j !== jogador && papeis[j] === 'lobo');
//         return {
//             seuPapel: 'lobo',
//             aliados: outrosLobos,
//             visao: ` Você é LOBO. Aliados: ${outrosLobos.join(', ') || 'você é o único lobo'}`,
//             mortos: historico.filter(h => h.morto)
//         };
//     }
    
//     if (papel === 'medico') {
//         return {
//             seuPapel: 'medico',
//             aliados: [],
//             visao: `Você é MÉDICO. Proteja os inocentes!`,
//             mortos: historico.filter(h => h.morto)
//         };
//     }
    
//     return {
//         seuPapel: 'ovelha',
//         aliados: [],
//         visao: `Você é OVELHA. Descubra quem é o lobo antes que seja tarde! (talvez seja a Mabel)`,
//         mortos: historico.filter(h => h.morto)
//     };
// }


// // EXPORTA

// module.exports = {
//     distribuirPapeis,
//     processarVotacaoRebanho,
//     LoboMata,
//     medicoProtege,
//     rodadaCompleta,
//     verificarVitoriaAntecipada,
//     getVisaoJogador
// }
