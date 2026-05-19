import { socket } from '../renderPage.js';

export function TelaLogin() {
    return `
        <div>
            <h2>Entrar no Lobitos</h2>
            <input type="text" id="nome-jogador" placeholder="Digite seu nome de usuário"/>
            <input type="password" id="senha-jogador" placeholder="Digite sua senha"/>
            <button id="btn-logar">Entrar no Jogo</button>
            <input type="text" id="nome-convidado" placeholder="Digite seu nome de usuário"/>
            <button id="btn-convidado">Entrar como convidado</button>
        </div>
    `;
}

export function iniciarTelaLogin() {
    socket.once('carregarJogador', (jogador) => {
        console.log("teste")
        socket.jogador = jogador
        window.location.hash = '#salas';
    });

    const tokenSalvo = localStorage.getItem('token_lobitos');
    if(tokenSalvo){
        socket.auth = {
            token: tokenSalvo // Passa o token aqui dentro do objeto auth
        };
        socket.connect();
        return
    }

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
                    // SALVA NO LOCALSTORAGE DO NAVEGADOR
                    localStorage.removeItem('token_lobitos')
                    localStorage.setItem('token_lobitos', data.token);
                    socket.auth = {
                        token: data.token // Passa o token aqui dentro do objeto auth
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
                        token: data.token // Passa o token aqui dentro do objeto auth
                    };
                    socket.connect();
                } else {
                    alert(data.error || 'Falha no login');
                }
            } catch (err) {
                console.error('Erro ao conectar:', err);
            }
        })
    }

}

