export const socket = io({autoConnect: false});

// socket.on('carregarJogador', (jogador) => {
//     socket.jogador = jogador;
// });

socket.on("erro", (erro) => {
    alert(JSON.stringify(erro.erro))
})

socket.on("connect_error", (erro) => {
    console.error("Erro ao conectar socket:", erro.message);
    if (erro && erro.message &&
        (erro.message.includes("Token inválido") ||
         erro.message.includes("expirado") ||
         erro.message.includes("Token não fornecido"))) {
        localStorage.removeItem('token_lobitos');
        socket.auth = {};
        socket.disconnect();
        window.location.hash = '#login';
    }
});

socket.on("disconnect", (reason) => {
    socket.emit("SairSala")
    localStorage.removeItem('token_lobitos')
    localStorage.removeItem('codigo_sala_lobitos')
    socket.auth = {}
    socket.jogador = {}
    window.location.hash = '#login'
})
// js/renderPage.js
import { TelaLogin, iniciarTelaLogin } from './paginas/login.js';
import { TelaLobby, iniciarTelaLobby } from './paginas/lobby.js';
import { TelaSalas, iniciarTelaSalas} from './paginas/salas.js';

const appContainer = document.getElementById('app');

/**
 * Função responsável por mapear as hashes e renderizar as telas correspondentes
 */

function roteadorSPA() {
    try{
        const hash = window.location.hash || '#login'; // Padrão é ir para o login
        
        appContainer.innerHTML = '';// Limpa os elementos visuais antigos para evitar vazamento de eventos
        switch (hash) {
            case '#login':
                appContainer.innerHTML = TelaLogin();
                iniciarTelaLogin();
                break;
            case '#salas':
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
    }catch(erro){
        console.log(erro)
    }
}

// Escuta quando o usuário clica em links ou muda a hash via código
window.addEventListener('hashchange', (event) => {
    const hash = window.location.hash
    const tokenSalvo = localStorage.getItem('token_lobitos');
    if(!tokenSalvo && !(hash == "#login")) {
        alert("Para entrar na pagina: '"+hash+"', é nescessário logar ou entrar como convidado")
        window.location.hash = "#login"
        if(!socket.disconnected){
            socket.disconnect()
        }
        return
    }
   
    const hashAnterior = new URL(event.oldURL).hash;
    const hashNova = new URL(event.newURL).hash;
    if(["#lobby", "#jogo"].includes(hashAnterior) && !["#lobby", "#jogo"].includes(hashNova)){
        console.log("saiu da sala")
        socket.emit("SairSala")
        localStorage.removeItem('codigo_sala_lobitos');
    }
    roteadorSPA()

});

// Executa a primeira vez quando a página é carregada do zero
window.addEventListener('DOMContentLoaded', () => {
    const tokenSalvo = localStorage.getItem('token_lobitos');
    if(tokenSalvo) {
        socket.auth = { token: tokenSalvo }; 
        socket.connect();
    }else{
        window.location.hash = "#login"
    }
    roteadorSPA()
});

window.addEventListener('beforeunload', () => {
   
});
