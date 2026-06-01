import { socket } from '../renderPage.js';
let SalaEstado = null
let FuncaoAtual = {}

export function TelaJogo() {
    return `
        <div>
            <header>
                <h2 id="codigo-sala-titulo">Sala: --</h2>
                <h2 id="estado-sala">----</h2>
                <h2 id="funcao">----</h2>
                <h4 id="funcao-descricao">----</h4>
            </header>

            <section id="painel-jogo">
                <div id="acoes-jogo">

                </div>
            </section>

            <section id="log-jogo">
                <h3>Eventos</h3>
                <div id="lista-eventos">
                    <p>Nenhum evento ainda.</p>
                </div>
            </section>

            <button id="btn-sair-jogo">Sair do Jogo</button>
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

    socket.once('carregarJogador', (jogador) => {
        socket.jogador = jogador
    });
    function EstadoDaSalaRecebido(resposta){
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

        const Funcao = resposta.dados.Funcao
        console.log(resposta.dados)
        document.getElementById("funcao").innerText = Funcao.nome
        document.getElementById("funcao-descricao").innerText = Funcao.descricao
        if(FuncaoAtual != Funcao){
            FuncaoAtual = Funcao
        }
    }
    socket.emit('BuscarEstadoDaSala', codigoSala, EstadoDaSalaRecebido)

}

export function renderizarAcao(jogador) {
    
}

