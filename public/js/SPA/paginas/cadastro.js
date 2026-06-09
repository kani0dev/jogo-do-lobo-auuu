
export function TelaCadastro() {
    return `
        <div>
            <h2>Cadastrar no Lobitos</h2>
            <input type="text" id="email-jogador" placeholder="Digite seu e-mail"/>
            <input type="text" id="nome-jogador" placeholder="Digite seu nome de usuário"/>
            <input type="password" id="senha-jogador" placeholder="Digite sua senha"/>
            <button id="btn-cadastrar">Cadastrar no Jogo</button>
            <a href="#login">Já tenho conta/quero jogar sem conta</a>
        </div>
    `;
}

export function iniciarTelaCadastro() {
    const btnCadastrar = document.getElementById('btn-cadastrar');
    if(btnCadastrar){
        btnCadastrar.addEventListener('click', async () => {
            const inputEmail = document.getElementById('email-jogador');
            const email = inputEmail.value.trim()
            const inputNome = document.getElementById('nome-jogador');
            const nome = inputNome.value.trim();
            const inputSenha = document.getElementById('senha-jogador');
            const senha = inputSenha.value.trim();

            if (!email) {
                alert("Por favor, insira um email para cadastrar!");
                return;
            }
            if (!nome) {
                alert("Por favor, insira um nome para cadastrar!");
                return;
            }
            if (!senha) {
                alert("Por favor, insira uma senha para cadastrar!");
                return;
            }

            try {
                const response = await fetch('/api/jogador', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, nome, senha })
                });

                const data = await response.json();


                if (response.ok && data.jogador) {
                    alert("Jogador cadastrado com sucesso!")
                    window.location.hash = "#login"
                } else {
                    alert(data.error || 'Falha no login');
                }
            } catch (err) {
                console.error('Erro ao conectar:', err);
            }
        });
    }
}

