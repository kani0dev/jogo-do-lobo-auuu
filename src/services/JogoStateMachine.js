const SalaManager = require("./SalaManager")
const JogoService = require("./JogoService")
const ConstFuncoes = require("../constants/ConstFuncoes")


// Esse arquivo é quem vai controlar os estados da sala, um chamado "Maquina de estados" ou "StateMachine"


exports.AvancaEstadoDaSala = (Sala) => {
    try{ 
        var Mortos = []
        
        switch(Sala.sala_estado.toUpperCase()){
            case "ESPERANDO":
                Sala.sala_estado = "NOITE"
                JogoService.DistribuirPapeis(Sala)
                break;
            case "NOITE":
                for(const j of Object.values(Sala.jogadores)){
                    if(j.estado.toUpperCase() == "MORTO"){ //ignora players mortos
                        continue
                    }
                    if(j.efeitos.includes("MATAR") && !j.efeitos.includes("PROTEGER")){
                        j.estado = "MORTO"
                        Mortos.push(j)
                    }
                    j.efeitos = []
                }
                Sala.sala_estado = "PÓS NOITE"
                break;
            case "PÓS NOITE":
                Sala.sala_estado = "DISCUSSÃO"
                break;
            case "DISCUSSÃO":
                var resposta = ProcessarVotos(Sala)
                if(resposta.dados && resposta.dados.jogadorExpulso){
                    resposta.dados.jogadorExpulso.estado = "MORTO"
                    Mortos.push(resposta.dados.jogadorExpulso)
                }
                Sala.votos = []
                Sala.chat = []
                Sala.sala_estado = "PÓS DISCUSSÃO"
                break;
            case "PÓS DISCUSSÃO":
                Sala.sala_estado = "NOITE"
                break;
        }

        // Verifica o estado de fim de jogo, se só existirem funcoes da mesma equipe, 
        // mudar isso mais pra frente pra deixar mais modular 
        // caso tenham funcoes com condições mais especificas pra ganhar

        const FimDoJogo = ChecaFimDoJogo(Sala.codigo) 
        if(FimDoJogo.jogoAcabou){
            return {ok: true, dados: {fim: true, equipeVencedora: FimDoJogo.equipeVencedora, Sala, mensagem: "Partida "+Sala.codigo+" finalizada" }}
        }

        for(const j of Object.values(Sala.jogadores)){ // reseta estado dos players
            if(j.estado.toUpperCase() == "MORTO"){ //ignora players mortos
                continue
            }
            j.estado = "NAO PRONTO"
        }
        
       
        
        return {ok: true, dados: {Sala, Mortos, NovoEstado: Sala.sala_estado, mensagem: "Sala "+Sala.codigo+" mudou o estado para: "+Sala.sala_estado}}
    }catch(erro){
        return { erro }
    }
}

const ProcessarVotos = (Sala) => {
    try{
        let contagemVotos = {}
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
                    expulsar.push(jogador);
                }
            }
        }
        console.log(expulsar)
        console.log(contagemVotos)
        if(expulsar.length > 1){
            return {ok: true, dados: {empate: true}}
        }
        const jogadorExpulso = Sala.jogadores[expulsar[0]]
        return {ok: true, dados: {jogadorExpulso, mensagem: "jogador "+expulsar[0].nome+" foi expulso"}}
    }catch(erro){
        return { erro }
    }
}

const ChecaFimDoJogo = (Sala) => {
    try{
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
            Sala.sala_estado = "FIM"
            console.log("ACABOU")
        }
        return { jogoAcabou, equipeVencedora }
    }catch(erro){
        return { erro }
    }
}