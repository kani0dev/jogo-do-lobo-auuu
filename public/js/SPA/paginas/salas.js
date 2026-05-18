// js/paginas/salasPublicas.js

export function TelaSalasPublicas() {
    return `
        <div>
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

export async function iniciarTelaSalasPublicas() {
    const listaSalasContainer = document.getElementById('lista-salas');
    const btnAtualizar = document.getElementById('btn-atualizar-salas');
    const btnCriarSala = document.getElementById('btn-criar-sala');

    async function carregarSalas() {
        if (!listaSalasContainer) return;
        listaSalasContainer.innerHTML = '<p class="carregando">Buscando salas...</p>';

        try {
            const token = localStorage.getItem('token_lobitos');
            if(!token){
                console.error("Erro ao buscar salas públicas:", erro);
                return 
            }

            const resposta = await fetch('/api/salas-publicas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const dados = await resposta.json();

            if (!dados.sucesso || dados.salas.length === 0) {
                listaSalasContainer.innerHTML = '<p class="aviso-vazio">Nenhuma sala pública encontrada no momento.</p>';
                return;
            }

            listaSalasContainer.innerHTML = '';

            dados.salas.forEach(sala => {
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
                    localStorage.setItem('lobitos_sala_alvo', codigoSala);
                    window.location.hash = '#lobby'; 
                });
            });
        } catch (erro) {
            console.error("Erro ao buscar salas públicas:", erro);
            listaSalasContainer.innerHTML = '<p class="erro-texto">Erro ao carregar as salas.</p>';
        }
    }

    // Configura os botões de ação da tela
    if (btnAtualizar) btnAtualizar.addEventListener('click', carregarSalas);
    carregarSalas();
}