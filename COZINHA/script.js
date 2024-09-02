document.addEventListener('DOMContentLoaded', function () {
    let pedidosData = []; // Armazena os pedidos para acesso global
    let pedidosAnteriores = new Set(); // Armazena os IDs dos pedidos anteriores

    const updateInterval = 10000; // Intervalo de atualização em milissegundos (10 segundos)

    function playNotificationSound() {
        document.getElementById('notification-sound').play();
    }

function fetchPedidos() {
    fetch('script.php')
        .then(response => response.text())  // Use .text() ao invés de .json() temporariamente
        .then(text => {
            console.log('Resposta do servidor:', text); // Logue a resposta para depuração
            const data = JSON.parse(text);  // Converta manualmente a string JSON para um objeto JavaScript
            const pedidosDiv = document.getElementById('pedidos');
            const novosPedidos = [];

            data.forEach(pedido => {
                if (!pedidosAnteriores.has(pedido.pedido.ID)) {
                    novosPedidos.push(pedido);
                    pedidosAnteriores.add(pedido.pedido.ID); // Adiciona o ID do novo pedido ao set
                }
            });

            if (novosPedidos.length > 0) {
                playNotificationSound(); // Toca o som se houver novos pedidos
            }

            pedidosData = data;
            pedidosDiv.innerHTML = '';
            data.forEach(pedido => {
                const pedidoDiv = document.createElement('div');
                pedidoDiv.className = 'pedido';
                pedidoDiv.innerHTML = `
                    <h2>Pedido ID: ${pedido.pedido.ID}</h2>
                    <p>Cliente: ${pedido.pedido.Nome_Cliente}</p>
                    <p>Telefone: ${pedido.pedido.Telefone}</p>
                    <p>Endereço: ${pedido.pedido.Rua}, ${pedido.pedido.N}, ${pedido.pedido.Bairro}, ${pedido.pedido.Complemento}</p>
                    <p>Forma de Entrega: ${pedido.pedido.Forma_Entrega}</p>
                    <p>Forma de Pagamento: ${pedido.pedido.Forma_Pagamento}</p>
                    <p>Troco: ${pedido.pedido.TROCO}</p>
                    <p>Total: R$ ${pedido.pedido.Total}</p>
                    <button onclick="mostrarDetalhes(${pedido.pedido.ID})">Ver Detalhes</button>
                    <button onclick="concluirPedido(${pedido.pedido.ID})">Concluir Pedido</button>
                `;
                pedidosDiv.appendChild(pedidoDiv);
            });
        })
        .catch(error => console.error('Erro ao carregar os pedidos:', error));
}

    // Inicializa a atualização de pedidos
    fetchPedidos();
    setInterval(fetchPedidos, updateInterval);

    window.mostrarDetalhes = function (id) {
        const pedido = pedidosData.find(p => p.pedido.ID == id);
        if (!pedido) {
            console.warn('Pedido não encontrado:', id);
            return;
        }

        const detalhesDiv = document.getElementById('detalhes');
        detalhesDiv.innerHTML = `<h3>Itens do Pedido ${id}:</h3>`;

        if (pedido.itens && pedido.itens.length > 0) {
            pedido.itens.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'detalhe-item';
                itemDiv.innerHTML = `
                    <p><strong>Nome:</strong> ${item.Nome_Item}</p>
                    <p><strong>Descrição:</strong> ${item.Descricao_Item}</p>
                    <p><strong>Adicionais:</strong> ${item.Adicionais}</p>
                    <p><strong>Observações:</strong> ${item.Observacoes}</p>
                    <p><strong>Quantidade:</strong> ${item.Quantidade}</p>
                    <p><strong>Preço Total:</strong> R$ ${item.Preco_Total}</p>
                    <hr>
                `;
                detalhesDiv.appendChild(itemDiv);
            });
        } else {
            detalhesDiv.innerHTML += `<p>Nenhum item encontrado para este pedido.</p>`;
            console.warn('Nenhum item encontrado para este pedido.');
        }

        const statusButton = document.createElement('button');
        statusButton.textContent = 'Marcar como Concluído';
        statusButton.addEventListener('click', function() {
            alterarStatusPedido(id);
        });
        detalhesDiv.appendChild(statusButton);
    };

    function alterarStatusPedido(id) {
        fetch('alterar_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, status: 'Concluído' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Status do pedido alterado para Concluído.');
                fetchPedidos();
            } else {
                alert('Erro ao alterar o status do pedido.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
        });
    }

    window.concluirPedido = function (id) {
        if (confirm(`Tem certeza que deseja marcar o Pedido ID: ${id} como Concluído?`)) {
            fetch(`concluir_pedido.php?id=${id}`, { method: 'POST' })
                .then(response => response.text())
                .then(responseText => {
                    alert(responseText);
                    fetchPedidos();
                })
                .catch(error => console.error('Erro ao concluir o pedido:', error));
        }
    };

    // Seleciona o modal e o botão de fechar
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');

    // Função para mostrar o modal

        loginModal.style.display = 'block';
        document.body.classList.add('modal-open'); // Desativa interação com o conteúdo da página


    // Função para esconder o modal
    function hideLoginModal() {
        loginModal.style.display = 'none';
        document.body.classList.remove('modal-open'); // Reativa interação com o conteúdo da página
    }

    // Função para carregar as credenciais do arquivo de texto
    function loadCredentials() {
        return fetch('senhas.txt')
            .then(response => response.text())
            .then(text => {
                return text.split('\n').reduce((acc, line) => {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        acc[key.trim()] = value.trim();
                    }
                    return acc;
                }, {});
            })
            .catch(error => console.error('Erro ao carregar o arquivo de credenciais:', error));
    }

    // Carrega as credenciais ao iniciar a página
    loadCredentials().then(credentials => {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Previne o comportamento padrão do formulário

            // Obtém os valores do formulário
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Verifica as credenciais
            if (username === credentials.username && password === credentials.password) {
                alert('Login bem-sucedido!');
                hideLoginModal(); // Fecha o modal após o login
            } else {
                alert('Usuário ou senha incorretos.');
            }
        });
    });

    // Adiciona um botão de logout ao menu (opcional)
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            alert('Logout realizado!');
            // Implementar lógica de logout real aqui, se necessário
        });
    }
});
