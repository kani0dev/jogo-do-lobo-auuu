const SalaManager = require("./SalaManager")
const JogoService = require("./JogoService")


//TODO: Por agora, os efeitos e seus resultados esrão hardcoded, seria interessante refatorar essa parte, mas nn sei se tem como tbm

// Esse arquivo é quem vai controlar os estados da sala, um chamado "Maquina de estados" ou "StateMachine"
exports.MudaEstadoDaSala = (codigo) => {
    const Sala = SalaManager[codigo]
    if(!Sala){
        return {erro: "Sala "+codigo+", não existe"}
    }
    //Ele verifica o estado atual da sala, faz as coisas que tem que fazer, e logo muda o estado, se tiver um proximo
    switch(Sala.estado.toUpperCase()){
        case "ESPERANDO":
            Sala.estado = "NOITE"
            JogoService.DistribuirPapeis()
            break;
        case "NOITE":
            for(const j in Object.values(Sala.jogadores)){
                if(j.estado.toUpperCase() == "MORTO"){ //ignora players mortos
                    continue
                }
                if(j.efeitos.includes("MATAR") && !j.efeitos.includes("PROTEGER")){
                    j.estado = "MORTO"
                }
            }
            Sala.estado = "DIA"
            break;
        case "DIA":
            var resposta = JogoService.ProcessarVotos(codigo)
            if(resposta.res.empate){
            
            }else{
                resposta.res.estado = "MORTO"
            }
    }
}