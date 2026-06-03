const SalaManager = require("../services/SalaManager.js")

exports.Funcoes = {
    Lobo:{
        nome: "Lobo",
        descricao: "O lobo em pele de cordeiro, seu objetivo é se alimentar do rebanho sem que ninguem descubra sua verdadeira natureza",
        equipe: "Lobos",
        acao: (Sala, JogadorOrigemId, AlvoId)=>{
            try{
                const Alvo = Sala.jogadores[AlvoId]
                if(!Alvo){
                    return {erro: "Jogador "+AlvoId+" não existe na sala: "+ Sala.codigo}
                }
                if(Alvo.estado.toUpperCase() == "MORTO"){
                    return {erro: "Jogador "+Alvo.nome+" ja esta morto"}
                }
                if(exports.Funcoes[Alvo.funcao].equipe.toUpperCase() == "LOBOS"){
                    return {erro: "Lobo não pode atacar alguem da propria equipe"}
                }
                Alvo.efeitos.push("MATAR") //Adicionar "MATAR" na lista de efeitos do jogador
                return { ok: true }
            }catch(erro){
                return { erro }
            }
        }
    },
    Ovelha:{
        nome: "Ovelha",
        descricao: "Você faz parte do rebanho, seu objetivo é descobrir quem é o lobo, e junto de seus colegas, mandar ele de volta pra floresta",
        equipe: "Rebanho",
        acao: null
    },
    "São Bernardo":{
        nome: "São Bernardo",
        descricao: "Você é um cachorro grande e imponente com um coração proporcional ao seu tamanho, seu objetivo é proteger as ovelhas durante as noites",
        equipe: "Rebanho",
        acao: (Sala, JogadorOrigemId, AlvoId)=>{
            try{
                const Alvo = Sala.jogadores[AlvoId]
                if(!Alvo){
                    return {erro: "Jogador "+AlvoId+" não existe na sala: "+ Sala.codigo}
                }
                if(Alvo.estado.toUpperCase() == "MORTO"){
                    return {erro: "Jogador "+Alvo.nome+" ja esta morto"}
                }
                Alvo.efeitos.push("PROTEGER") //Adicionar "PROTEGER" na lista de efeitos do jogador
                return { ok: true }
            }catch(erro){
                return { erro }
            }
        }
    }
}