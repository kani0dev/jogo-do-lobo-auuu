// js/paginas/salasPublicas.js

import { socket } from '../renderPage.js';

export function TelaSalas() {
    return `
        <div>
            <button id="btn-deslogar">
                Sair
            </button>
            <h2 id="nome-display">Olá, ------</h2>
            <h2>Salas Públicas</h2>
            <p>Escolha uma sala para entrar ou crie a sua própria.</p>
            
            <button id="btn-criar-sala">
                + Criar Nova Sala
            </button>

            <div id="lista-salas">
                <p>Buscando salas disponíveis...</p>
            </div>

            <div>
                <button id="btn-atualizar-salas">Atualizar</button>
            </div>

        </div>
    `;
}

export async function iniciarTelaSalas() {
    const listaSalasContainer = document.getElementById('lista-salas');
    const btnAtualizar = document.getElementById('btn-atualizar-salas');
    const btnCriarSala = document.getElementById('btn-criar-sala');
    const nomeDisplay = document.getElementById('nome-display');
    const btnDeslogar = document.getElementById('btn-deslogar');

    if (nomeDisplay) {
        nomeDisplay.textContent = `Olá, ${socket.jogador.nome}`;
    }

    socket.emit("ListarSalasPublicas", (resposta) => {
        AtualizarLista(resposta.dados.salas)
    })

    function AtualizarLista(salas){
        if (!listaSalasContainer) return;
        listaSalasContainer.innerHTML = '';
        
        if(salas.length < 1){
            listaSalasContainer.innerHTML = '<p>Nenhuma sala publica encontrada</p>';
            return
        }

        salas.forEach(sala => {
            const cardSala = document.createElement('div');//TODO: arrumar tudo aqui do front
            cardSala.innerHTML = `
                <div>
                    <span class="codigo-sala">#${sala.codigo}</span>
                    <span class="jogadores-sala">${sala.quantidade_jogadores}/${sala.quantidade_jogadores} jogadores</span>
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
            socket.disconnect()
            localStorage.removeItem("token_lobitos")
            window.location.hash = "#login"
        })
    }

}
