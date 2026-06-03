import { socket } from '../renderPage.js';

let FuncaoAtual = {}

export function TelaJogo() {
    return `
        <div>
            <header>
                <h2 id="codigo-sala-titulo">Sala: --</h2>
                <h2 id="estado-sala">----</h2>
            </header>

            <section id="painel-jogo">
                <h2 id="funcao">----</h2>
                <h4 id="funcao-descricao">----</h4>
                <div id="opcoes-acao">
                    <h2>Você é uma ovelha, ovelhas não podem fazer nada durante a noite</h2>
                </div>
                <div id="btns-acao">
                    <button id="confirmar-acao">Confirmar</button>
                </div>
            </section>

            <button id="btn-sair-jogo">Sair do Jogo</button>
        </div>
    `;
}

export function iniciarTelaJogo() {
    const tituloCodigo = document.getElementById('codigo-sala-titulo');
    const estadoSala = document.getElementById('estado-sala')
    const opcoesAcao = document.getElementById('opcoes-acao')
    
    const codigoSala = localStorage.getItem('codigo_sala_lobitos');
    if(!codigoSala){
        console.log("não tem codigo!!")
        window.location.hash = "#salas"
        return
    }

    socket.once('carregarJogador', (jogador) => {
        socket.jogador = jogador
    })

    socket.on("MudouEstado", (novoEstado) => {
        console.log(`nn é mais noite, é ${novoEstado}`)
    })

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
            default:
                console.log("Mudou prum estado que eu nn conheco")
                break;
        }
    }

    function RenderAcao(Sala, Funcao){
        switch(Funcao.toUpperCase()){
            case "SÃO BERNARDO":
            case "LOBO":
                opcoesAcao.innerHTML = ""
                for(let j of Object.values(Sala.jogadores)){
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
        confirmarAcao.addEventListener("click", () => {
            const alvo = document.querySelector('imput[name="target"]:checked')
            socket.emit("Acao", Sala.codigo, alvo? alvo: null, (resposta)=>{
                console.log(resposta)
            })
        })
    }

    socket.on("MaisUmPronto", () => {
        console.log("mais um foi")
    })


    socket.emit('BuscarEstadoDaSala', codigoSala, AtualizarSala)
}

