import { socket } from '../renderPage.js';

let chatlog = []
let FuncaoAtual = {}

export function TelaJogo() {
    return `
        <div>
            <header>
                <button id="btn-sair-jogo">Sair</button>
                <h2 id="codigo-sala-titulo">Sala: --</h2>
                <h2 id="estado-sala">----</h2>
            </header>

            <section id="painel-jogo">
                <h2 id="funcao">----</h2>
                <h4 id="funcao-descricao">----</h4>
                <div id="opcoes-acao">
                    <h2>Aguardando informações...</h2>
                </div>
                <button id="confirmar-acao">Confirmar</button>
            </section>
        </div>
    `;
}

export function iniciarTelaJogo() {
    const tituloCodigo = document.getElementById('codigo-sala-titulo');
    const estadoSala = document.getElementById('estado-sala')
    
    const codigoSala = localStorage.getItem('codigo_sala_lobitos');
    if(!codigoSala){
        console.log("não tem codigo!!")
        window.location.hash = "#salas"
        return
    }

    const btnSair = document.getElementById('btn-sair-jogo')
    btnSair.addEventListener("click", () => {
        window.location.hash = "#salas"
    })

    socket.once('carregarJogador', (jogador) => {
        socket.jogador = jogador
    })

    socket.on("MaisUmPronto", () => {
        console.log("mais um foi")
    })

    socket.on("MudouEstado", AtualizarSala)

    function AtualizarSala(resposta){
        if(resposta.erro){
            window.location.hash = "#salas"
            return
        }
        const Sala = resposta.dados.Sala
        if(Sala.sala_estado.toUpperCase() == "ESPERANDO"){
            window.location.hash = "#lobby"
            return
        }
        tituloCodigo.innerText = `Sala: ${Sala.codigo}`
        estadoSala.innerText = `--${Sala.sala_estado}--`

        const Funcao = resposta.dados.FuncaoDoJogador
        document.getElementById("funcao").innerText = Funcao.nome
        document.getElementById("funcao-descricao").innerText = Funcao.descricao
        if(FuncaoAtual != Funcao){
            FuncaoAtual = Funcao
        }

        switch(Sala.sala_estado.toUpperCase()){
            case "NOITE":
                RenderAcao(Sala, Funcao.nome)
                break;
            case "DIA":
            default:
                console.log("Mudou prum estado que eu nn conheco")
                break;
        }
    }

    socket.emit('BuscarEstadoDaSala', codigoSala, AtualizarSala)
}

function RenderAcao(Sala, Funcao){
    const opcoesAcao = document.getElementById('opcoes-acao')
    switch(Funcao.toUpperCase()){
        case "SÃO BERNARDO":
        case "LOBO":
            opcoesAcao.innerHTML = ""
            for(const j of Object.values(Sala.jogadores)){
                if(j.estado.toUpperCase() == "MORTO"){
                    continue
                }
                let JogadorContainer = document.createElement("div")
                
                let JogadorRadio = document.createElement("input")
                JogadorRadio.type = "radio"
                JogadorRadio.name = "target"
                JogadorRadio.value = `${j.id}`

                let JogadorNome = document.createElement("h3")
                JogadorNome.innerText = `${j.nome}`
                
                JogadorContainer.append(JogadorNome)
                JogadorContainer.append(JogadorRadio)
                opcoesAcao.appendChild(JogadorContainer)
            }
            break;
        default:
            opcoesAcao.innerHTML = `Você é uma ${Funcao}, ${Funcao}s não podem fazer nada durante a noite`
            break;
    }

    const confirmarAcao = document.getElementById('confirmar-acao')
    confirmarAcao.disabled = false
    confirmarAcao.addEventListener("click", () => {
        const AlvoId = document.querySelector('input[name="target"]:checked').value
        socket.emit("Acao", Sala.codigo, AlvoId? AlvoId: null, (resposta)=>{
            console.log(resposta)
            confirmarAcao.disabled = true
        })
    })
}

function RenderVotacao(Sala){
    const opcoesAcao = document.getElementById('opcoes-acao')
    opcoesAcao.innerHTML = ""
    for(const j of Object.values(Sala.jogadores)){
        if(j.estado.toUpperCase() == "MORTO"){
            continue
        }
        let JogadorContainer = document.createElement("div")
        
        let JogadorRadio = document.createElement("input")
        JogadorRadio.type = "radio"
        JogadorRadio.name = "target"
        JogadorRadio.value = `${j.id}`
        let JogadorNome = document.createElement("h3")
        JogadorNome.innerText = `${j.nome}`
        
        JogadorContainer.append(JogadorNome)
        JogadorContainer.append(JogadorRadio)
        opcoesAcao.appendChild(JogadorContainer)
    }
    const confirmarAcao = document.getElementById('confirmar-acao')
    confirmarAcao.disabled = false
    confirmarAcao.addEventListener("click", () => {
        const alvo = document.querySelector('input[name="target"]:checked')
        socket.emit("Votar", Sala.codigo, alvo? alvo: null, (resposta)=>{
            if(resposta.erro){
                console.log(resposta.erro)
                return
            }
            confirmarAcao.disabled = true
        })
    })
}