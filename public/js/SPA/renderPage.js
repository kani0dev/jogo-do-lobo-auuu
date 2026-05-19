export const socket = io({autoConnect: false});
socket.on('carregarJogador', (jogador) => {
    socket.jogador = jogador;
});

socket.on("erro", (erro) => {
    console.log(erro)
})
// js/renderPage.js
import { TelaLogin, iniciarTelaLogin } from './paginas/login.js';
import { TelaLobby, iniciarTelaLobby } from './paginas/lobby.js';
import { TelaSalas, iniciarTelaSalas} from './paginas/salas.js';

const appContainer = document.getElementById('app');

/**
 * Função responsável por mapear as hashes e renderizar as telas correspondentes
 */

//TODO: lidar com as disconnections. O q fazer quando desconectar? sair da sala? morrer na sala? oq acontece quando um player sai no meio da partida?
function roteadorSPA() {
    

    const hash = window.location.hash || '#login'; // Padrão é ir para o login
    

    // Limpa os elementos visuais antigos para evitar vazamento de eventos
    appContainer.innerHTML = '';

    switch (hash) {
        case '#login':
            appContainer.innerHTML = TelaLogin();
            iniciarTelaLogin();
            break;
        case '#salas':
            if (!localStorage.getItem('token_lobitos')) {
                window.location.hash = '#login';
                return;
            }
            appContainer.innerHTML = TelaSalas();
            iniciarTelaSalas();
            break;
        case '#lobby':
            if (!localStorage.getItem('token_lobitos')) {
                window.location.hash = '#login';
                return;
            }
            appContainer.innerHTML = TelaLobby();
            iniciarTelaLobby();
            break;

        default:
            appContainer.innerHTML = `<h2>Página não encontrada (404)</h2><a href="#login">Ir para o Login</a>`;
            break;
    }
}

// Escuta quando o usuário clica em links ou muda a hash via código
window.addEventListener('hashchange', (event) => {
    roteadorSPA()

    const tokenSalvo = localStorage.getItem('token_lobitos');
    if(!tokenSalvo) {
        window.location.hash = "#login"
    }

    const hashAnterior = new URL(event.oldURL).hash;
    const hashNova = new URL(event.newURL).hash;
    if(["#lobby", "#jogo"].includes(hashAnterior) && !["#lobby", "#jogo"].includes(hashNova)){
        const codigoSala = localStorage.getItem("codigo_sala_lobitos")
        if(!codigoSala){
            return
        }
        socket.emit("SairSala", codigoSala)
    }


});

// Executa a primeira vez quando a página é carregada do zero
window.addEventListener('DOMContentLoaded', () => {
    roteadorSPA()
    const tokenSalvo = localStorage.getItem('token_lobitos');
    if (tokenSalvo) {
        socket.auth = { token: tokenSalvo }; 
        socket.connect();
    }else{
        window.location.hash = "#login"
    }
});

window.addEventListener('beforeunload', () => {
    const codigoSala = localStorage.getItem("codigo_sala_lobitos")
    if(!codigoSala){
        return
    }
    socket.emit("SairSala", codigoSala)
    localStorage.removeItem('codigo_sala_lobitos');
});
