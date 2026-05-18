const socket = io();
// js/renderPage.js
import { TelaLogin, iniciarTelaLogin } from './paginas/login.js';
// import { TelaLobby, iniciarTelaLobby } from './paginas/lobby.js';
import { TelaSalasPublicas, iniciarTelaSalasPublicas} from './paginas/salas.js';

const appContainer = document.getElementById('app');

/**
 * Função responsável por mapear as hashes e renderizar as telas correspondentes
 */
function roteadorSPA() {
    const hash = window.location.hash || '#login'; // Padrão é ir para o login

    // Limpa os elementos visuais antigos para evitar vazamento de eventos
    appContainer.innerHTML = '';

    switch (hash) {
        case '#login':
            appContainer.innerHTML = TelaLogin();
            iniciarTelaLogin();
            break;

        // case '#lobby':
        //     // Verificação de segurança simples: se não tem token, chuta pro login
        //     if (!localStorage.getItem('lobitos_id')) {
        //         window.location.hash = '#login';
        //         return;
        //     }
        //     appContainer.innerHTML = TelaLobby();
        //     iniciarTelaLobby();
        //     break;
        
        case '#salas':
            // Verificação de segurança simples: se não tem token, chuta pro login
            if (!localStorage.getItem('token_lobitos')) {
                window.location.hash = '#login';
                return;
            }
            appContainer.innerHTML = TelaSalasPublicas();
            iniciarTelaSalasPublicas();
            break;

        case '#jogo':
            // appContainer.innerHTML = TelaJogo();
            // iniciarTelaJogo();
            break;

        default:
            // Se digitar uma hash maluca, joga pro login
            appContainer.innerHTML = `<h2>Página não encontrada (404)</h2><a href="#login">Ir para o Login</a>`;
            break;
    }
}

// Escuta quando o usuário clica em links ou muda a hash via código
window.addEventListener('hashchange', roteadorSPA);

// Executa a primeira vez quando a página é carregada do zero
window.addEventListener('DOMContentLoaded', roteadorSPA);