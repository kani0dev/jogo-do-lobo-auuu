const SalaManager = require("../services/SalaManager.js")

exports.Funcoes = {
    Lobo:{
        nome: "Lobo",
        descricao: "O lobo em pele de cordeiro, seu objetivo é se alimentar do rebanho sem que ninguem descubra sua verdadeira natureza",
        equipe: "Lobos",
        acao: (CodigoSala, JogadorOrigem, JogadorAlvo)=>{
            const Sala = SalaManager.Salas[CodigoSala]
            const Alvo = Sala.jogadores[JogadorAlvo]
            if(!Alvo){
                return {erro: "Jogador "+JogadorAlvo+" não existe na sala: "+ CodigoSala}
            }
            if(Alvo.estado.toUpperCase() == "MORTO"){
                return {erro: "Jogador "+JogadorAlvo+" ja esta morto"}
            }
            if(Funcoes[Alvo.funcao].equipe.toUpperCase() == "LOBOS"){
                return {erro: "Lobo não pode atacar alguem da propria equipe"}
            }
            Sala.jogadores[JogadorAlvo].efeitos.push("MATAR") //Adicionar "MATAR" na lista de efeitos do jogador
            Sala.jogadores[JogadorOrigem].estado = "PRONTO" //Finaliza o 
            return {ok: true}
        }
    },
    Ovelha:{
        nome: "Ovelha",
        descricao: "Você faz parte do rebanho, seu objetivo é descobrir quem é o lobo, e junto de seus colegas, mandar ele de volta pra floresta",
        equipe: "Rebanho",
        acao: null
    }
}