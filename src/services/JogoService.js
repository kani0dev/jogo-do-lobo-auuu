const SalaManager = require("./SalaManager")
const ConstFuncoes = require("../constants/ConstFuncoes")
const JogoStateMachine = require("./JogoStateMachine")

// distribuição de papeis no inicio do jogo
exports.DistribuirPapeis = (Sala) => {
    try{
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

exports.Agir = async (socket, jogador, codigo, AlvoId = null) => {
    try{
        //Validações da sala
        const Sala = await SalaManager.buscarSala(codigo)
        if(!Sala){
            return { erro: "Sala "+codigo+", não existe" }
        }
        if(Sala.sala_estado.toUpperCase() != "NOITE"){
            return { erro: jogador.nome + " tentou agir sem ser a noite"}
        }

        //Validações do jogador
        const JogadorOrigem = Sala.jogadores[jogador.id]
        if(!JogadorOrigem){
            return { erro: jogador.nome + " não está na sala " + codigo}
        }
        if(JogadorOrigem.estado.toUpperCase() == "PRONTO"){
            return { erro: jogador.nome + " já agiu na noite de hoje"}
        }

        //Valida se o jogador tem uma função e um alvo
        const Funcao = ConstFuncoes.Funcoes[JogadorOrigem.funcao]
        if(!Funcao){
            return { erro: `Função '${JogadorOrigem.funcao}' não encontrada` }
        }
        const Acao = Funcao.acao

        if(Acao){
            if(!AlvoId){
                return { erro: `Ação de '${JogadorOrigem.funcao}' precisa de um alvo` }
            }
            const response = Acao(Sala, JogadorOrigem.id, AlvoId)
            if(response.erro){
                return response
            }
        }

        
        await SalaManager.salvarSala(Sala)
        return {ok: true, dados: {jogador, mensagem: jogador.nome + " agiu com sucesso"}}
    }catch(erro){
        return { erro }
    }
}

//processa votação do rebanho (quem vai ser expulso (mabel))
exports.Votar = async (socket, jogador, codigo, AlvoId = null) => {
    try{
        const Sala = await SalaManager.buscarSala(codigo)
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

        const Alvo = Sala.jogadores[AlvoId]

        if(Alvo){ // Se tiver alvo, consta o voto
            if(Alvo.estado.toUpperCase() == "MORTO"){
                return { erro: "Jogador Alvo " + AlvoId + " está morto, morto não é votado"}
            }
            voto = {
                de: jogador.id,
                para: AlvoId
            }
        }else{ // Se não tiver, o voto é nulo
            voto = {
                de: jogador.id,
                para: null
            }
        }
        
        Sala.votos.push(voto)
        await SalaManager.salvarSala(Sala)
        return {ok: true, dados:{Sala, mensagem: jogador.nome + " votou com sucesso"}}
    }catch(erro){
        return { erro }
    }
}

exports.FinalizarTurno = async (socket, jogador, codigo) => {
    try{
        const Sala = await SalaManager.buscarSala(codigo)
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        //Checa se o jogador existe, se ele esta morto ou se ele ja votou
        const jogadorNaSala = Sala.jogadores[jogador.id]
        if(!jogadorNaSala){
            return { erro: jogador.nome + " não está na sala " + codigo}
        }

        if(jogadorNaSala.estado.toUpperCase() == "PRONTO"){
            return { erro: jogador.nome + " ja finalizou seu turno"}
        }

        jogadorNaSala.estado = "PRONTO"

        for(const j of Object.values(Sala.jogadores)){
            if(j.estado.toUpperCase() === "MORTO"){
                continue
            }
            if(j.estado.toUpperCase() != "PRONTO"){
                await SalaManager.salvarSala(Sala)
                return { ok: true, dados:{}}
            }
        }
        
        const resposta = JogoStateMachine.AvancaEstadoDaSala(Sala)
        if(resposta.erro){
            return { erro: resposta.erro }
        }
        await SalaManager.salvarSala(Sala)
        return resposta

    }catch(erro){
        return {erro}
    }

}

exports.SalvarMensagem = async (socket, jogador, codigo, texto) => {
    try{
        const Sala = await SalaManager.buscarSala(codigo)
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }

        const jogadorNaSala = Sala.jogadores[jogador.id]
        if(!jogadorNaSala){
            return { erro: jogador.nome + " não está na sala " + codigo}
        }

        const mensagem = {
            autor: jogador.nome,
            texto: texto
        }

        Sala.chat.push(mensagem)
        SalaManager.salvarSala(Sala)
        return { ok:true, dados:{mensagem} }
    }catch(erro){
        return { erro }
    }
}