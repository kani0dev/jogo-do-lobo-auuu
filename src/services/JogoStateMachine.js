const SalaManager = require("./SalaManager")
const JogoService = require("./JogoService")
const ConstFuncoes = require("../constants/ConstFuncoes")


//TODO: Por agora, os efeitos e seus resultados esrão hardcoded, seria interessante refatorar essa parte, mas nn sei se tem como tbm

// Esse arquivo é quem vai controlar os estados da sala, um chamado "Maquina de estados" ou "StateMachine"
exports.MudaEstadoDaSala = (codigo) => {
    try{ 
        const Sala = SalaManager[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        //Ele verifica o estado atual da sala, faz as coisas que tem que fazer, e logo muda o estado
        switch(Sala.estado.toUpperCase()){
            case "ESPERANDO":
                Sala.estado = "NOITE"
                JogoService.DistribuirPapeis()
                break;
            case "NOITE":
                for(const j of Object.values(Sala.jogadores)){
                    if(j.estado.toUpperCase() == "MORTO"){ //ignora players mortos
                        continue
                    }
                    if(j.efeitos.includes("MATAR") && !j.efeitos.includes("PROTEGER")){
                        j.estado = "MORTO"
                    }
                }
                Sala.estado = "DISCUSSÃO"
                break;
            case "DISCUSSÃO": //TODO: Decidir em talvez ser uma discussão estilo among us, e não lobitos
                Sala.estado = "DIA"
                break;
            case "DIA":
                var resposta = ProcessarVotos(codigo)
                if(resposta.dados.jogador){
                    resposta.dados.jogador.estado = "MORTO"
                }
                Sala.estado = "NOITE"
                break;
        }

        // Verifica o estado de fim de jogo, se só existirem funcoes da mesma equipe, 
        // mudar isso mais pra frente pra deixar mais modular 
        // caso tenham funcoes com condições mais especificas pra ganhar

        const FimDoJogo = ChecaFimDoJogo(codigo) 
        if(FimDoJogo.jogoAcabou){
            //TODO: O que fazer a partir daqui? Enviar mensagem via socket pra room "Codigo_da_sala+'_GERAL'" e depois lidar com a mensagem no front
            return {ok: true, dados: {fim: true, equipeVencedora: FimDoJogo.equipeVencedora, Sala, mensagem: "Partida "+Sala.codigo+" finalizada" }}
        }

        for(const j of Object.values(Sala.jogadores)){ // reseta estado dos players
            if(j.estado.toUpperCase() == "MORTO"){ //ignora players mortos
                continue
            }
            j.estado = "NAO PRONTO"
        }
        return {ok: true, dados: {Sala, mensagem: "Sala "+codigo+" mudou o estado para: "+Sala.estado}}
    }catch(erro){
        return { erro }
    }
}

const ProcessarVotos = (codigo) => {
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

        let expulsar = []
        let maxVotos = -1
        for(const jogador in contagemVotos) {
            if(contagemVotos[jogador] > maxVotos) {
                maxVotos = contagemVotos[jogador];
                expulsar = [jogador];
            }else{
                if(contagemVotos[jogador] == maxVotos){
                    expulsar.push[jogador];
                }
            }
        }
        if(expulsar.length > 1){
            return {ok: true, dados: {empate: true}}
        }
        return {ok: true, dados: {jogador: expulsar[0], mensagem: "jogador "+expulsar[0].nome+" foi expulso"}}
    }catch(erro){
        return { erro }
    }
}

const ChecaFimDoJogo = (codigo) => {
    try{
        const Sala = SalaManager.Salas[codigo]
        if(!Sala){
            return {erro: "Sala "+codigo+", não existe"}
        }
        let jogoAcabou = true
        let equipeVencedora = ""
        for(const j of Object.values(Sala.jogadores)){
            const equipe = ConstFuncoes.Funcoes[j.funcao].equipe.toUpperCase()
            if(j.estado.toUpperCase() == "MORTO"){
                continue
            }
            if(!equipeVencedora){
                equipeVencedora = equipe
                continue
            }
            if(equipe != equipeVencedora){
                jogoAcabou = false
                break
            }
        }
        if(jogoAcabou){
            Sala.estado = "FIM"
        }
        return { jogoAcabou, equipeVencedora }
    }catch(erro){
        return { erro }
    }
}