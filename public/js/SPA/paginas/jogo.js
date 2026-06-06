import { socket } from '../renderPage.js';

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
                <div id="painel-chat">
                    <div id="chat-log">
                    </div>
                    <input id="chat-input" type="text">
                    <button id="chat-enviar">Enviar</button>
                </div>
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

    socket.on("MudouEstado", (resposta) => {
        if(resposta.erro){
            window.location.hash = "#salas"
            return
        }
        AtualizarSala(resposta.dados.Sala)
    })
    
    socket.emit('BuscarEstadoDaSala', codigoSala, (resposta) => { // Evento emitido quando a pagina é carregada, ele atualiza a sala e salva a sua funcao na memoria
        if(resposta.erro){
            window.location.hash = "#salas"
            return
        }

        const Funcao = resposta.dados.FuncaoDoJogador
        if(Funcao){
            document.getElementById("funcao").innerText = Funcao.nome
            document.getElementById("funcao-descricao").innerText = Funcao.descricao
            if(FuncaoAtual != Funcao){
                FuncaoAtual = Funcao
            }
        }

        AtualizarSala(resposta.dados.Sala)
    })
    
    function AtualizarSala(Sala){
        if(Sala.sala_estado.toUpperCase() == "ESPERANDO"){
            window.location.hash = "#lobby"
            return
        }
        tituloCodigo.innerText = `Sala: ${Sala.codigo}`
        estadoSala.innerText = `--${Sala.sala_estado}--`
        const opcoesAcao = document.getElementById('opcoes-acao')
        opcoesAcao.innerHTML = ""
        
        switch(Sala.sala_estado.toUpperCase()){
            case "NOITE":
                if(FuncaoAtual.TemAcao){
                    ListarJogadores(Sala)
                }else{
                    const opcoesAcao = document.getElementById('opcoes-acao')
                    opcoesAcao.innerHTML = `<h4>Você é um(a) ${FuncaoAtual.nome}, ${FuncaoAtual.nome}s não podem agir durante a noite</h4>`
                }
                ConectarBtnConfirmar(Sala.codigo, "Acao")
                break;
            case "DISCUSSÃO":
                ListarJogadores(Sala)
                ConectarBtnConfirmar(Sala.codigo, "Votar")
                break;
            default:
                console.log("Mudou prum estado que eu nn conheco")
                break;
        }
    }
}

function ListarJogadores(Sala){
    const opcoesAcao = document.getElementById('opcoes-acao')
    opcoesAcao.innerHTML = ""

    for(const j of Object.values(Sala.jogadores)){
        if(j.estado.toUpperCase() == "MORTO" || j.id == socket.jogador.id){ //ignora se a pessoa esta morta ou se a pessoa é voce
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
    opcoesAcao.querySelector('input').checked = true
}

function ConectarBtnConfirmar(codigo, Evento){
    const confirmarAcao = document.getElementById('confirmar-acao')
    confirmarAcao.disabled = false
    confirmarAcao.addEventListener("click", () => {
        const inputField = document.querySelector('input[name="target"]:checked')
        let AlvoId = null
        if(inputField){
            AlvoId = inputField.value
        }
        socket.emit(Evento, codigo, AlvoId, (resposta)=>{
            if(resposta.erro){
                console.log(resposta)
                return
            }
            confirmarAcao.disabled = true
        })
    })
}

function MostrarChat(){
    const painelChat = document.getElementById("painel-chat")
    const chatLog = document.createElement("div")
}