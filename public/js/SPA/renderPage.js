export const socket = io({autoConnect: false});
socket.manualDisconnect = false;

// socket.once('carregarJogador', (jogador) => {
//     socket.jogador = jogador;
// });

socket.on("erro", (erro) => {
    console.log(erro)
    alert(JSON.stringify(erro))
})

socket.on("connect_error", (erro) => {
    console.error("Erro ao conectar socket:", erro.message);
    if (erro && erro.message &&
        (erro.message.includes("Token inválido") ||
         erro.message.includes("expirado") ||
         erro.message.includes("Token não fornecido"))) {
        localStorage.removeItem('token_lobitos');
        localStorage.removeItem('codigo_sala_lobitos');
        socket.auth = {};
        socket.disconnect();
        window.location.hash = '#login';
    }
});

socket.on("disconnecting", () => {
    if (!socket.manualDisconnect) {
        return;
    }
    window.location.hash = '#login';
});

// js/renderPage.js
import { TelaLogin, iniciarTelaLogin } from './paginas/login.js';
import { TelaCadastro, iniciarTelaCadastro} from './paginas/cadastro.js'
import { TelaLobby, iniciarTelaLobby } from './paginas/lobby.js';
import { TelaSalas, iniciarTelaSalas} from './paginas/salas.js';
import { TelaJogo, iniciarTelaJogo } from './paginas/jogo.js';

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
            case '#cadastro':
                appContainer.innerHTML = TelaCadastro();
                iniciarTelaCadastro();
                break;
            case '#salas':
                appContainer.innerHTML = TelaSalas();
                iniciarTelaSalas();
                break;
            case '#lobby':
                appContainer.innerHTML = TelaLobby();
                iniciarTelaLobby();
                break;
            case '#jogo':
                appContainer.innerHTML = TelaJogo();
                iniciarTelaJogo();
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
    if(!tokenSalvo && !["#login", "#cadastro"].includes(hash)) {
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
        socket.emit("SairSala", (resposta) => {
            console.log(resposta)
        })
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
