import { socket } from '../renderPage.js';

let FuncaoAtual = {}

export function TelaJogo() {
    return `
        <div>
            <header>
                <button id="btn-sair-jogo">Sair</button>
                <h2 id="codigo-sala-titulo">Sala: --</h2>
                <h2 id="estado-sala">----</h2>
                <h2 id="funcao">----</h2>
                <h4 id="funcao-descricao">----</h4>
            </header>

            <section id="painel-jogo">
                <div id="opcoes-acao">
                    <h2>Aguardando informações...</h2>
                </div>
                <div id="painel-chat">
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

    function ConectarSala() {
        socket.emit('ReconectarSala', codigoSala, (resposta) => {
            if (resposta.ok) {
                socket.emit('BuscarEstadoDaSala', (resposta) => { // Evento emitido quando a pagina é carregada, ele atualiza a sala e salva a sua funcao na memoria
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
                return
            }
        })
        
    }

    if (socket.connected) {
        ConectarSala();
    } else {
        socket.once('connect', ConectarSala);
    }

    const btnSair = document.getElementById('btn-sair-jogo')
    btnSair.addEventListener("click", () => {
        socket.off("MudouEstado")
        window.location.hash = "#salas"
    })

    socket.once('carregarJogador', (jogador) => {
        socket.jogador = jogador
    })

    socket.on("MudouEstado", (requisicao) => {
        if(requisicao.erro){
            socket.off("MudouEstado")
            window.location.hash = "#salas"
            return
        }
        AtualizarSala(requisicao.dados.Sala, requisicao.dados.Mortos)
        
    })

    
    
    function AtualizarSala(Sala, Mortos = []){
        if(Sala.sala_estado.toUpperCase() == "ESPERANDO"){
            socket.off("MudouEstado")
            window.location.hash = "#lobby"
            return
        }
        tituloCodigo.innerText = `Sala: ${Sala.codigo}`
        estadoSala.innerText = `--${Sala.sala_estado}--`
        const opcoesAcao = document.getElementById('opcoes-acao')
        opcoesAcao.innerHTML = ""
        const painelChat = document.getElementById("painel-chat")
        painelChat.innerHTML = ""
        
        switch(Sala.sala_estado.toUpperCase()){
            case "NOITE":
                if(FuncaoAtual.TemAcao){
                    ListarJogadores(Sala, "Acao")
                }else{
                    opcoesAcao.innerHTML = `<h4>Você é um(a) ${FuncaoAtual.nome}, ${FuncaoAtual.nome}s não podem agir durante a noite</h4>`
                    ConectarBtnAvancar()
                }
                break;
            case "DISCUSSÃO":
                ListarJogadores(Sala, "Votar")
                renderChat(Sala.chat)
                break;
            case "DIA":
                ListarMortos(Mortos)
                ConectarBtnAvancar()
                break;
            default:
                console.log("Mudou prum estado que eu nn conheco")
                break;
        }
    }
}

function ListarJogadores(Sala, Evento){
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

    const confirmarAcao = document.createElement("button")
    confirmarAcao.innerText = "Confirmar"
    confirmarAcao.disabled = false
    confirmarAcao.addEventListener("click", () => {
        const inputField = document.querySelector('input[name="target"]:checked')
        let AlvoId = null
        if(inputField){
            AlvoId = inputField.value
        }
        socket.emit(Evento, AlvoId, (resposta)=>{
            if(resposta.erro){
                console.log(resposta)
                return
            }
            confirmarAcao.disabled = true
        })
    })

    opcoesAcao.appendChild(confirmarAcao)
}

function ConectarBtnAvancar(){
    const avancarBtn = document.createElement("button")
    avancarBtn.innerText = "Ok"
    avancarBtn.disabled = false
    avancarBtn.addEventListener("click", () => {
        socket.emit("FinalizarTurno", (resposta)=>{
            if(resposta.erro){
                console.log(resposta)
                return
            }
            avancarBtn.disabled = true
        })
    })
    const opcoesAcao = document.getElementById("opcoes-acao")
    opcoesAcao.appendChild(avancarBtn)

}

function renderChat(chat){
    const painelChat = document.getElementById("painel-chat")
    const chatLog = document.createElement("div")
    const chatInput = document.createElement("input")
    chatInput.type = "text"
    const chatEnviar = document.createElement("button")
    chatEnviar.innerText = "Enviar"

    painelChat.appendChild(chatLog)
    painelChat.appendChild(chatInput)
    painelChat.appendChild(chatEnviar)

    for(const mensagem of chat){
        const mensagemElement = document.createElement("p")
        mensagemElement.innerHTML = `<b>${mensagem.autor}:</b> ${mensagem.texto}`
        chatLog.append(mensagemElement)
    }

    socket.on("MensagemRecebida", (mensagem) => {
        const mensagemElement = document.createElement("p")
        mensagemElement.innerHTML = `<b>${mensagem.autor}:</b> ${mensagem.texto}`
        chatLog.append(mensagemElement)
        console.log(mensagem)
    })

    chatEnviar.addEventListener("click", ()=>{
        if(chatInput.value.trim() == ""){
            return
        }
        socket.emit("EnviarMensagem", chatInput.value)
        chatInput.value = ""
    })
}

function ListarMortos(Mortos){
    const opcoesAcao = document.getElementById("opcoes-acao")
    if(Mortos.length == 0){
        opcoesAcao.innerHTML = "<h3>Não houve mortos nessa noite</h3>"
    }else{
        opcoesAcao.innerHTML = `<h3>Morreram ${Mortos.length} essa noite: </h3>`
        for(const j of Mortos){
            opcoesAcao.innerHTML += `<p>${j.nome}</p>`
        }
    }
}