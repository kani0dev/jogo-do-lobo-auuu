const SalaManager = require("../services/SalaManager")

// distribuição de papeis no inicio do jogo
exports.DistribuirPapeis = (codigo) => {
    try{
        const Sala = SalaManager.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        const JogoNaoComecou = Sala.estado.toUpperCase() == "ESPERANDO" 
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
        
        Sala.jogadores.forEach((jogador, index) => { // Atribui as funcoes pra cada jogador
            jogador.funcao = funcoesLista[index]
        })

        return {ok: true, res: Sala}
    }catch(erro){
        return { erro }
    }
}

//processa votação do rebanho (quem vai ser expulso (mabel))
exports.Votar = (socket, codigo, JogadorAlvo) => {
    try{
        const Sala = SalaManager.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        //Checa se o jogador existe, se ele esta morto ou se ele ja votou
        const Eleitor = Sala.jogadores[socket.id]
        if(!Eleitor){
            return { erro: "Jogador " + socket.id + " não está na sala " + codigo}
        }
        if(Eleitor.estado.toUpperCase() == "MORTO"){
            return { erro: "Jogador " + socket.id + " está morto, morto não vota"}
        }
        for(const v of Sala.votos){
            if(v.de == socket.id){
                return { erro: "Jogador " + socket.id + " ja votou"}
            }
        }
        //Checha se o alvo existe e se ele esta morto
        const Alvo = Sala.jogadores[JogadorAlvo.socket_id]
        if(!Alvo){
            return { erro: "Jogador " + socket.id + " não está na sala " + codigo}
        }
        if(Alvo.estado.toUpperCase() == "MORTO"){
            return { erro: "Jogador Alvo " + JogadorAlvo.socket_id + " está morto, morto não é votado"}
        }

        const voto = {
            de: socket.id,
            para: JogadorAlvo.socket_id
        }
        Sala.votos.push(voto)

        return { ok: true, res: voto }
    }catch(erro){
        return { erro }
    }
}

exports.ProcessarVotos = (codigo) => {
    try{
        let contagemVotos = {}
        const Sala = SalaManager.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        Sala.votos.forEach((voto)=>{
            if(!contagemVotos[voto.para]){
                contagemVotos[voto.para] = 0
            }
            contagemVotos[voto.para]++
        })

        let Expulsar = []
        let maxVotos = -1
        for(const jogador in contagemVotos) {
            if(contagemVotos[jogador] > maxVotos) {
                maxVotos = contagemVotos[jogador];
                Expulsar = [jogador];
            }else{
                if(contagemVotos[jogador] == maxVotos){
                    Expulsar.push[jogador];
                }
            }
        }
        if(Expulsar.length > 1){
            return {ok: true, res: {empate: true}}
        }
        Sala.jogadores[Expulsar[0]].estado = "MORTO"
        return {ok: true, res: Expulsar[0]}
    }catch(erro){
        return { erro }
    }
}

exports.VerificaFuncoes

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
