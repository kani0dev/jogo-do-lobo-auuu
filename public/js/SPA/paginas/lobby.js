// js/paginas/lobby.js
import { socket } from '../renderPage.js';

export function TelaLobby() {
    return `
        <div>
            <div>
                <h2>Sala: <span id="codigo-sala-titulo">------</span></h2>
                <span id="status-vagas">0/0 Jogadores</span>
            </div>
            
            <p>Aguardando na fila de prontidão...</p>

            
            <div id="lista-jogadores">
            </div>

            <div id="acoes-lobby">
                <p class="texto-espera">Aguardando o anfitrião iniciar a partida...</p>
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
    const btnSair = document.getElementById('btn-sair-sala');

    const codigoSala = localStorage.getItem('codigo_sala_lobitos'); 
    if(!codigoSala){
        window.location.hash = "#salas"
        return
    }
    
    function renderizarLista(sala) {
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
                socket.emit('IniciarPartida', socket.jogador, sala.codigo);
            });
        } else {
            acoesContainer.innerHTML = `<p class="texto-espera">Aguardando o anfitrião iniciar a partida...</p>`;
        }
    }
    
    socket.emit("EntrarSala", codigoSala)
    socket.on('EntrouNaSala', (sala, jogadorNovo) => {
        renderizarLista(sala);
    });

    socket.on('SaiuDaSala', (salaAtualizada, jogador) => {
        console.log(socket.jogador.id)
        if (jogador.id === socket.jogador.id) {
            localStorage.removeItem('codigo_sala_lobitos');
            socket.off('EntrouNaSala');
            socket.off('SaiuDaSala');
            socket.off('PartidaIniciada');
            window.location.hash = '#salas';
            return
        }
        if(salaAtualizada){
            renderizarLista(salaAtualizada);
        }
        
    });
    socket.on('PartidaIniciada', () => {
        window.location.hash = '#jogo';
    });

    if (btnSair) {
        btnSair.addEventListener('click', () => {
            socket.emit('SairSala', codigoSala);
        });
    }
}