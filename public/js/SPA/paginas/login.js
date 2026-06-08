// js/paginas/login.js
import { socket } from '../renderPage.js';

export function TelaLogin() {
    return `
    <div class="login-container">
        <div class="login-card">
            <h1 class="login-title">Lobitos</h1>
            <p class="login-subtitle">Escolha como deseja se conectar para jogar</p>
            
            <form class="login-form" id="form-login" onsubmit="event.preventDefault();">
                
                <div class="input-group">
                    <label for="nome-jogador">Nome de Usuário</label>
                    <input type="text" id="nome-jogador" placeholder="Digite seu nome de usuário"/>
                </div>
                
                <div class="input-group">
                    <label for="senha-jogador">Senha</label>
                    <input type="password" id="senha-jogador" placeholder="Digite sua senha"/>
                </div>
                
                <button type="button" class="btn-login" id="btn-logar">Entrar no Jogo</button>
                
                <div class="separator"></div>

                <div class="input-group">
                    <input type="text" id="nome-convidado" placeholder="Digite seu apelido de convidado"/>
                </div>
                
                <button type="button" class="btn-login" id="btn-convidado">Entrar como convidado</button>
            </form>
        </div>
    </div>
    `;
}

export function iniciarTelaLogin() {
    socket.once('carregarJogador', (jogador) => {
        socket.jogador = jogador;
        window.location.hash = '#salas';
    });

    const tokenSalvo = localStorage.getItem('token_lobitos');
    if(tokenSalvo){
        if(!socket.connected){
            socket.auth = {
                token: tokenSalvo 
            };
            socket.connect();
        }else{
            window.location.hash = '#salas';
        }
        return;
    }

    // BOTÃO LOGAR REGULAR
    const btnLogar = document.getElementById('btn-logar');
    if(btnLogar){
        btnLogar.addEventListener('click', async () => {
            const inputNome = document.getElementById('nome-jogador');
            const nome = inputNome.value.trim();
            const inputSenha = document.getElementById('senha-jogador');
            const senha = inputSenha.value.trim();

            if (!nome) {
                alert("Por favor, insira um nome para jogar!");
                return;
            }
            if (!senha) {
                alert("Por favor, insira uma senha para jogar!");
                return;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, senha })
                });

                const data = await response.json();

                if (response.ok && data.token) {
                    localStorage.setItem('token_lobitos', data.token);
                    socket.auth = {
                        token: data.token 
                    };
                    socket.connect();
                } else {
                    alert(data.error || 'Falha no login');
                }
            } catch (err) {
                console.error('Erro ao conectar:', err);
            }
        });
    }

    // BOTÃO ENTRAR COMO CONVIDADO
    const btnConvidado = document.getElementById('btn-convidado');
    if(btnConvidado){
        btnConvidado.addEventListener("click", async ()=>{
            const inputNome = document.getElementById('nome-convidado');
            const nome = inputNome.value.trim();
            if (!nome) {
                alert("Por favor, insira um nome para jogar!");
                return;
            }
            try {
                const response = await fetch('/api/login-convidado', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome })
                });

                const data = await response.json();
                if (response.ok && data.token) {
                    localStorage.setItem('token_lobitos', data.token);
                    socket.auth = {
                        token: data.token 
                    };
                    socket.connect();
                } else {
                    alert(data.error || 'Falha no login');
                }
            } catch (err) {
                console.error('Erro ao conectar:', err);
            }
        });
    }
}

