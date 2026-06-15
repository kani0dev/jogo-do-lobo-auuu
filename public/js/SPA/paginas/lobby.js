// js/paginas/lobby.js
import { socket } from '../renderPage.js';

export function TelaLobby() {
    return `
        <div>
            <header>
                <h2>Sala: <span id="codigo-sala-titulo">------</span></h2>
                <span id="status-vagas">0/0 Jogadores</span>
            </header>
            
            <p>Aguardando na fila de prontidão...</p>

            
            <div id="lista-jogadores">
            </div>

            <div id="acoes-lobby">
                <p class="texto-espera">Aguardando o anfitrião iniciar a partida...</p>
                <button id="btn-pronto">ficar pronto</button>
            </div>

            <button id="btn-sair-sala">
                Sair da Sala
            </button>
        </div>
    `;
}

export function iniciarTelaLobby() {
    const listaContainer = document.getElementById('lista-jogadores');
    const tituloCodigo = document.getElementById('codigo-sala-titulo');
    const statusVagas = document.getElementById('status-vagas');
    const acoesContainer = document.getElementById('acoes-lobby');

    socket.once('carregarJogador', (jogador) => {
        socket.jogador = jogador
    });

    const codigoSala = localStorage.getItem('codigo_sala_lobitos');
    if(!codigoSala){
        console.log("não tem codigo!!")
        window.location.hash = "#salas"
        return
    }

    function reconectarOuEntrar() {
        socket.emit('ReconectarSala', codigoSala, (resposta) => {
            if (resposta.ok) {
                AtualizarSala(resposta.dados.Sala)
                return
            }

            socket.emit('EntrarSala', codigoSala, (respostaEntrar) => {
                if(respostaEntrar.erro){
                    if(!respostaEntrar.erro.includes("já existe")){
                        window.location.hash = "#salas"
                        return
                    }
                }
                AtualizarSala(respostaEntrar.dados.Sala)
            })
        })
    }

    if (socket.connected) {
        reconectarOuEntrar();
    } else {
        socket.once('connect', reconectarOuEntrar);
    }

    function AtualizarSala(sala) {
        if(sala.sala_estado.toUpperCase() != "ESPERANDO"){ //Se a partida ja comecou, ele manda o jogador pra pagina de jogo
            socket.off("EntrouNaSala")
            socket.off("SaiuDaSala")
            window.location.hash = "#jogo"
        }
        
        if (!listaContainer) return;

        
        tituloCodigo.textContent = sala.codigo;
        statusVagas.textContent = `${Object.keys(sala.jogadores).length}/${sala.quantidade_jogadores}`;
        listaContainer.innerHTML = '';
        
        // Percorre todos os jogadores que o backend enviou
        Object.values(sala.jogadores).forEach(jogador => {
            const itemJogador = document.createElement('div');
            const ehAnfitriao = sala.anfitriao === jogador.id;
            const sufixoVoce = jogador.id === socket.jogador.id ? ' (Você)' : '';
            
            itemJogador.innerHTML = `
                <div class="avatar-jogador ${ehAnfitriao ? 'dono' : ''}"></div>
                <span class="nome-jogador">${jogador.nome}${sufixoVoce}</span>
                ${ehAnfitriao ? '<span class="badge-dono">★ Líder</span>' : ''}
            `;
            listaContainer.appendChild(itemJogador);
        });
        // Configura os botões de ação baseado em quem você é
        if (sala.anfitriao === socket.jogador.id) {
            acoesContainer.innerHTML = `
                <button id="btn-iniciar-jogo">
                ➔ Iniciar Partida
                </button>
            `;
            
            const btnIniciar = document.getElementById('btn-iniciar-jogo');
            btnIniciar.addEventListener('click', () => {
                socket.emit('IniciarPartida', (resposta)=>{
                    
                    console.log(JSON.stringify(resposta))
                    if(resposta.ok){
                        socket.off("EntrouNaSala")
                        socket.off("SaiuDaSala")
                        window.location.hash = "#jogo"
                    }else{
                        console.log(JSON.stringify(resposta))
                    }
                });
            });
        } else {
            const estadoAtual = sala.jogadores[socket.jogador.id].estado
            acoesContainer.innerHTML = `
                <p class="texto-espera">Aguardando o anfitrião iniciar a partida...</p>
                <button id="btn-pronto">${estadoAtual}</button>
            `;
            const btnPronto = document.getElementById('btn-pronto');
            if(btnPronto){
                btnPronto.addEventListener('click', () => {
                    socket.emit("MudarProntidão",(jogador)=>{
                        btnPronto.innerText = jogador.estado
                    })
                });
            }
        }
    }
    
    // O envio do evento para entrar na sala é tratado por reconectarOuEntrar()

    socket.on('EntrouNaSala', (sala, jogadorNovo) => {
        AtualizarSala(sala);
    });

    socket.on('SaiuDaSala', (sala, jogador) => {
        AtualizarSala(sala);
    });

    socket.once('PartidaIniciada', () => {
        socket.off("EntrouNaSala")
        socket.off("SaiuDaSala")
        window.location.hash = '#jogo';
    });

    const btnSair = document.getElementById('btn-sair-sala');
    if(btnSair) {
        btnSair.addEventListener('click', () => {
            socket.off("EntrouNaSala")
            socket.off("SaiuDaSala")
            window.location.hash = '#salas';
        });
    }
}