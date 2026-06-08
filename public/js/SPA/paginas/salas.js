// js/paginas/salasPublicas.js

import { socket } from '../renderPage.js';

export function TelaSalas() {
    return `
    <div class="salas-container">
        <header class="salas-header">
            <div class="user-info">
                <span class="user-avatar">🐺</span>
                <h2 id="nome-display">Olá, ------</h2>
            </div>
            <button id="btn-deslogar" class="btn-sair">Sair</button>
        </header>

        <main class="salas-content">
            <div class="content-header">
                <div>
                    <h1 class="content-title">Salas Públicas</h1>
                    <p class="content-subtitle">Escolha uma sala para entrar ou crie a sua própria para jogar.</p>
                </div>
                <button id="btn-criar-sala" class="btn-primary">+ Criar Nova Sala</button>
            </div>

            <div class="rooms-list-wrapper">
                <div id="lista-salas" class="rooms-grid">
                    <p class="carregando">Buscando salas disponíveis...</p>
                </div>
            </div>

            <div class="salas-footer">
                <button id="btn-atualizar-salas" class="btn-secondary">Atualizar Lista</button>
            </div>
        </main>
    </div>
    `;
}

export async function iniciarTelaSalas() {
    const listaSalasContainer = document.getElementById('lista-salas');
    const btnAtualizar = document.getElementById('btn-atualizar-salas');
    const btnCriarSala = document.getElementById('btn-criar-sala');
    const nomeDisplay = document.getElementById('nome-display');
    const btnDeslogar = document.getElementById('btn-deslogar');
    
    socket.once('carregarJogador', (jogador) => { 
        socket.jogador = jogador
        if (nomeDisplay) {
            nomeDisplay.innerHTML = `Olá, <span class="highlight-name">${socket.jogador.nome}</span>`;
        }
    });

    if (nomeDisplay && socket.jogador){
        nomeDisplay.innerHTML = `Olá, <span class="highlight-name">${socket.jogador.nome}</span>`;
    }

    socket.emit("ListarSalasPublicas", (resposta) => {
        AtualizarLista(resposta.dados.salas)
    })

    function AtualizarLista(salas){
        if (!listaSalasContainer) return;
        listaSalasContainer.innerHTML = '';
        
        if(salas.length < 1){
            listaSalasContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🗺️</div>
                    <h3>Nenhuma sala pública encontrada</h3>
                    <p>Que tal criar uma sala nova agora mesmo?</p>
                </div>
            `;
            return
        }

        salas.forEach(sala => {
            const cardSala = document.createElement('div');
            cardSala.className = 'room-card'; // Nova classe para estilizar os cartões de sala
            cardSala.innerHTML = `
                <div class="room-details">
                    <span class="codigo-sala">#${sala.codigo}</span>
                    <span class="jogadores-sala">👤 ${sala.quantidade_jogadores}/${sala.quantidade_jogadores} jogadores</span>
                </div>
                <button class="btn-entrar-sala" data-codigo="${sala.codigo}">Entrar</button>
            `;
            listaSalasContainer.appendChild(cardSala);
        });
        
        const botoesEntrar = document.querySelectorAll('.btn-entrar-sala');
        botoesEntrar.forEach(botao => {
            botao.addEventListener('click', () => {
                const codigoSala = botao.getAttribute('data-codigo');
                localStorage.setItem('codigo_sala_lobitos', codigoSala);
                window.location.hash = '#lobby';
            });
        });
    }

    if(btnAtualizar){ 
        btnAtualizar.addEventListener("click", ()=> {
            if (!listaSalasContainer) return;
            listaSalasContainer.innerHTML = '<p class="carregando">Buscando salas...</p>';
            socket.emit("ListarSalasPublicas", (resposta) => {
                AtualizarLista(resposta.dados.salas)
            })
        })
    }

    if(btnCriarSala){
        btnCriarSala.addEventListener("click", () => {
            if (!socket.jogador) {
                alert('Aguardando autenticação. Tente novamente em alguns segundos.');
                return;
            }
            socket.emit("CriarSala", (resposta) => {
                if(resposta.ok){
                    localStorage.setItem('codigo_sala_lobitos', resposta.dados.Sala.codigo);
                    window.location.hash = '#lobby'; 
                }
            })
        })
    }

    if(btnDeslogar){ 
        btnDeslogar.addEventListener("click", ()=> {
            socket.manualDisconnect = true;
            socket.disconnect()
            localStorage.removeItem("token_lobitos")
            localStorage.removeItem("codigo_sala_lobitos")
            window.location.hash = "#login"
        })
    }
}
