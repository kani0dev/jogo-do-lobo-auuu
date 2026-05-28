import { socket } from '../renderPage.js';

export function TelaJogo() {
    return `
        <div>
            <header>
                <h2>Jogo Lobisomem</h2>
                <div id="info-sala">Sala: --</div>
            </header>

            <section id="painel-jogo">
                <div id="status-jogo">
                    <p>Aguardando informações do servidor...</p>
                </div>

                <div id="acoes-jogo">
                    <!-- Aqui entram botões de ação, votação e outros controles -->
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
    // Inicialização da página de jogo
    // Aqui você pode ligar eventos do socket e atualizar o DOM
}
