// Variável global para armazenar o carrinho
let CARRINHO = JSON.parse(localStorage.getItem('CARRINHO')) || [];

// Função para abrir o modal
function openModal(modalId) {
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "block";

        updateTotal(modal.querySelector('.modal-content'));

        // Adicionar evento para fechar o modal ao clicar fora dele
        document.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

// Função para fechar o modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";

        // Remover o evento para evitar múltiplos listeners
        document.removeEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

// Função para incrementar a quantidade
function increment(button) {
    let counter = button.previousElementSibling;

    if (counter && counter.textContent) {
        let count = parseInt(counter.textContent, 10);
        counter.textContent = count + 1;
        updateTotal(button.closest(".modal-content"));
    } else {
        console.error('Elemento de contagem não encontrado.');
    }
}

function decrement(button) {
    let counter = button.nextElementSibling;

    if (counter && counter.textContent) {
        let count = parseInt(counter.textContent, 10);
        if (count > 1) {
            counter.textContent = count - 1;
        }
        updateTotal(button.closest(".modal-content"));
    } else {
        console.error('Elemento de contagem não encontrado.');
    }
}

// Função para adicionar ao carrinho
function addToCart(event, modalId) {
    event.stopPropagation();

    const button = event.target;
    const produtoInfos = button.closest(".modal-body");

    if (!produtoInfos) {
        console.error('Modal body não encontrado.');
        return;
    }

    const radios = produtoInfos.querySelectorAll('input[type="radio"]');
    const refrigeranteRadio = produtoInfos.querySelector(".additional-radio:checked");
    if (radios.length > 0 && !refrigeranteRadio) {
        alert('Por favor, selecione uma opção de refrigerante.');
        return;
    }

    const adicionaisCheckboxes = produtoInfos.querySelectorAll(".additional-checkbox");
    let adicionais = {};

    adicionaisCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            adicionais[checkbox.dataset.name] = parseFloat(checkbox.value);
        }
    });

    if (refrigeranteRadio) {
        adicionais[refrigeranteRadio.dataset.name] = parseFloat(refrigeranteRadio.value);
    }

    const produtoNomeElement = produtoInfos.querySelector('h2');
    const precoItemElement = produtoInfos.querySelector(".preco-item");
    const descItemElement = produtoInfos.querySelector(".desc-item");
    const observacoesElement = produtoInfos.querySelector(".observations");
    const itemCountElement = produtoInfos.querySelector(".item-count");

    const produtoNome = produtoNomeElement ? produtoNomeElement.innerText : 'Nome não disponível';
    const produtoPreco = precoItemElement ? parseFloat(precoItemElement.innerText.replace('R$', '').replace(',', '.')) : 0;
    const produtoDesc = descItemElement ? descItemElement.innerText : 'Descrição não disponível';
    const produtoObs = observacoesElement ? observacoesElement.value : '';
    const quantidade = itemCountElement ? parseInt(itemCountElement.innerText, 10) : 1;

    const precoTotal = calcularTotal(produtoPreco, adicionais, quantidade);

    const item = {
        nome: produtoNome,
        descricao: produtoDesc,
        precoBase: produtoPreco,
        adicionais: adicionais,
        precoProduto: produtoPreco,
        observacoes: produtoObs,
        quantidade: quantidade,
        precoTotal: precoTotal
    };

    console.log(produtoNome, produtoDesc, produtoPreco, adicionais, produtoObs, quantidade, precoTotal);

    let CARRINHO = JSON.parse(localStorage.getItem('CARRINHO')) || [];
    CARRINHO.push(item);
    localStorage.setItem('CARRINHO', JSON.stringify(CARRINHO));

    // Atualiza a interface do carrinho
    updateCartUI();

    closeModal(modalId);

    alert("Seu item foi adicionado ao carrinho com sucesso!");
    
}

function updateCartUI() {
    // Obtém a lista de itens no carrinho do localStorage
    const cart = JSON.parse(localStorage.getItem('CARRINHO')) || [];
    const cartCountElement = document.getElementById('cart-count');
    const irAoCarrinhoBtn = document.querySelector(".botao-carrinho");
    
    // Atualiza o contador de itens
    if (cartCountElement) {
        const itemCount = cart.length;
        cartCountElement.textContent = itemCount > 0 ? itemCount : '';
        cartCountElement.style.display = itemCount > 0 ? 'block' : 'none';
    }

}


function calcularTotal(precoBase, adicionais, quantidade) {
    let adicionaisTotal = Object.values(adicionais).reduce((acc, valor) => acc + valor, 0);
    return (precoBase + adicionaisTotal) * quantidade;
}

function updateTotal(modal) {
    if (!modal) return;

    const precoBaseElement = modal.querySelector(".preco-item");
    const quantidadeElement = modal.querySelector(".item-count");
    const totalPrecoElement = modal.querySelector(".total-preco");

    if (!precoBaseElement || !quantidadeElement || !totalPrecoElement) {
        console.error('Um ou mais elementos necessários não foram encontrados.');
        return;
    }

    const precoBase = parseFloat(precoBaseElement.innerText.replace('R$', '').replace(',', '.'));
    const quantidade = parseInt(quantidadeElement.innerText, 10);
    const adicionaisCheckboxes = modal.querySelectorAll(".additional-checkbox");
    let adicionais = {};

    adicionaisCheckboxes.forEach(checkbox => {
        adicionais[checkbox.dataset.name] = checkbox.checked ? parseFloat(checkbox.value) : 0;
    });

    const total = calcularTotal(precoBase, adicionais, quantidade);
    totalPrecoElement.innerText = `Total: R$${total.toFixed(2)}`;
}

// Função para carregar itens do carrinho na página do carrinho
document.addEventListener("DOMContentLoaded", function() {
    const cartContainer = document.querySelector(".cart-container");
    const totalElement = document.getElementById("total");

    if (cartContainer && totalElement) {
        if (CARRINHO.length === 0) {
            cartContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
            totalElement.textContent = "TOTAL: R$0,00";
            return;
        }

        let total = 0;

        CARRINHO.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");

            let adicionaisHtml = '';
            if (Object.keys(item.adicionais).length > 0) {
                adicionaisHtml = `<p>Adicionais: ${Object.keys(item.adicionais).map(adicional => adicional + " R$" + item.adicionais[adicional].toFixed(2)).join(", ")}</p>`;
            }

            let refrigeranteHtml = '';
            if (item.refrigerante) {
                refrigeranteHtml = `<p>Refrigerante: ${item.refrigerante}</p>`;
            }

            let observacoesHtml = '';
            if (item.observacoes.trim() !== '') {
                observacoesHtml = `<p>Observações: ${item.observacoes}</p>`;
            }

            itemElement.innerHTML = `
                <div class="item-info">
                    <h3>${item.nome}</h3>
                    <p>${item.descricao}</p>
                    ${refrigeranteHtml}
                    ${adicionaisHtml}
                    ${observacoesHtml}
                </div>

                <button class="exibir-detalhes" onclick="exibirItem(this)">Exibir Detalhes</button>

                <div class="item-quantity">
                    <button onclick="incrementItem(this)">+</button>
                    <span>${item.quantidade}</span>
                    <button onclick="decrementItem(this)">-</button>
                </div>
                <div class="item-price">R$${item.precoTotal.toFixed(2)}</div>
                <button class="remove-btn" onclick="removeItem(this)">Remover</button>
            `;

            cartContainer.appendChild(itemElement);

            total += item.precoTotal;
        });


        totalElement.textContent = "TOTAL: R$" + total.toFixed(2).replace('.', ',');
        updateTotalCart()
    }
});

function exibirItem(button) {
    // Encontra o índice do item no carrinho
    const itemIndex = Array.from(button.parentNode.parentNode.children).indexOf(button.parentNode);
    const item = CARRINHO[itemIndex];
    
    // Seleciona o modal e o elemento onde os detalhes serão exibidos
    const modal = document.getElementById('pedido-modal');
    const orderDetailsElement = document.getElementById('pedido-details');

    // Preenche o conteúdo do modal com as informações do item
    orderDetailsElement.innerHTML = `
        <div class="order-item">
            <h3>Item: ${item.nome}</h3>
            <p>Descrição: ${item.descricao}</p>
            <p>Preço: R$${item.precoBase.toFixed(2)}</p>
            ${Object.keys(item.adicionais).length > 0 ? 
                `<p class="adicionais">Adicionais: ${Object.keys(item.adicionais).map(adicional => adicional + " R$" + item.adicionais[adicional].toFixed(2)).join(", ")}</p>` : ''}
            ${item.refrigerante ? `<p class="refrigerante">Refrigerante: ${item.refrigerante}</p>` : ''}
            ${item.observacoes.trim() !== '' ? `<p class="observacoes">Observações: ${item.observacoes}</p>` : ''}
            <p>Quantidade: ${item.quantidade}</p>
            <p>Total: R$${item.precoTotal.toFixed(2)}</p>
        </div>
    `;
    
    // Mostra o modal
    modal.style.display = 'block';
}

// Função para fechar o modal
function closePedidoModal() {
    const modal = document.getElementById('pedido-modal');
    if (modal) {
        modal.style.display = 'none'; // Oculta o modal
    }
}


function incrementItem(button) {
    let counter = button.nextElementSibling;
    if (counter && counter.textContent) {
        let count = parseInt(counter.textContent, 10);
        counter.textContent = count + 1;
        updateTotalCart();
    } else {
        console.error('Elemento de contagem não encontrado.');
    }
}

function decrementItem(button) {
    let counter = button.previousElementSibling;
    if (counter && counter.textContent) {
        let count = parseInt(counter.textContent, 10);
        if (count > 1) {
            counter.textContent = count - 1;
        }
        updateTotalCart();
    } else {
        console.error('Elemento de contagem não encontrado.');
    }
}

function removeItem(button) {
    let cartItem = button.closest('.cart-item');
    if (cartItem) {
        let itemIndex = Array.from(cartItem.parentNode.children).indexOf(cartItem);
        CARRINHO.splice(itemIndex, 1);
        localStorage.setItem('CARRINHO', JSON.stringify(CARRINHO));
        cartItem.remove();
        updateTotalCart();
    } else {
        console.error('Item do carrinho não encontrado.');
    }
}

function updateTotalCart() {
    let total = 0;
    let cartItems = document.querySelectorAll('.cart-item');

    // Calcula o total dos itens do carrinho
    cartItems.forEach(item => {
        let quantity = parseInt(item.querySelector('.item-quantity span').textContent, 10);
        let price = parseFloat(item.querySelector('.item-price').textContent.replace('R$', '').replace(',', '.'));
        total += quantity * price;
    });




    // Atualiza o total na página
    document.getElementById('total').textContent = 'TOTAL: R$' + total.toFixed(2).replace('.', ',');
}




// Função para mostrar/ocultar os campos de endereço com base na opção de entrega selecionada
function selectDeliveryOption(option) {
    const addressFields = document.getElementById('address-fields');
    const deliveryFee = document.getElementById('delivery-fee');

    if (!addressFields) {
        console.error('Elementos de endereço ou taxa de entrega não encontrados.');
        return;
    }

    if (option === 'Entrega') {
        addressFields.style.display = 'block'; // Mostra os campos de endereço
        deliveryFee.style.display = 'block'; // Mostra a taxa de entrega
    } else {
        addressFields.style.display = 'none'; // Oculta os campos de endereço
        deliveryFee.style.display = 'none'; // Oculta a taxa de entrega
    }

    // Atualiza o total ao alterar a opção de entrega
    updateTotalCart();
}


// Função para mostrar o modal com a mensagem de pedido realizado
function showMessageModal() {
    const modal = document.getElementById('order-modal');
    const orderDetailsElement = document.getElementById('order-details');
    const deliveryTimeElement = document.getElementById('delivery-time');
    const taxaEntrega = document.getElementById('taxa-entrega')
    const totalModal = document.getElementById('totalModal');

    if (!modal || !orderDetailsElement || !deliveryTimeElement) {
        console.error('Um ou mais elementos do modal não encontrados.');
        return;
    }

    // Obtém as informações do endereço se a opção de entrega for selecionada
    const deliveryOption = document.querySelector('input[name="delivery-option"]:checked').value;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const street = document.getElementById('street').value;
    const number = document.getElementById('number').value;
    const neighborhood = document.getElementById('bairro').value;
    const complemento = document.getElementById('complemento').value;
    const changeAmount = paymentMethod === 'Dinheiro' ? parseFloat(document.getElementById('change-amount').value) || 0 : 0;
    const Total = document.getElementById('total').textContent;

    // Define o conteúdo do modal
    orderDetailsElement.innerHTML = `
        <div class="order-item">
            <h3>Nome: ${document.getElementById('name').value}</h3>
            <p>Telefone: ${document.getElementById('phone').value}</p>
            <p>Forma de Pagamento: ${paymentMethod}</p>
            ${paymentMethod === 'Dinheiro' ? `<p>Troco Necessário: R$${changeAmount.toFixed(2)}</p>` : ''}
            <p>Opção de Entrega: ${deliveryOption}</p>
            ${deliveryOption === 'Entrega' ? `
                <p>Endereço de Entrega:</p>
                <p>Rua: ${street}</p>
                <p>Número: ${number}</p>
                <p>Bairro: ${neighborhood}</p>
                <p>Complemento ${complemento}</p>
            ` : ''}
        </div>
        ${CARRINHO.map(item => `
            <div class="order-item">
                <h3>Item: ${item.nome}</h3>
                <p>Descrição: ${item.descricao}</p>
                ${Object.keys(item.adicionais).length > 0 ? 
                    `<p class="adicionais">Adicionais: ${Object.keys(item.adicionais).map(adicional => adicional + " R$" + item.adicionais[adicional].toFixed(2)).join(", ")}</p>` : ''}
                ${item.observacoes.trim() !== '' ? `<p class="observacoes">Observações: ${item.observacoes}</p>` : ''}
                <p>Preço: R$${item.precoBase.toFixed(2)}</p>
                <p>Quantidade: ${item.quantidade}</p>
                <p>Total: R$${item.precoTotal.toFixed(2)}</p>
            </div>
        `).join('')}
    `;


    totalModal.textContent = Total;

    deliveryTimeElement.textContent = deliveryOption === 'Entrega' ? '10 a 50 min' : '30 min';

    modal.style.display = 'block'; // Mostra o modal
}




// Função para fechar o modal
function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.style.display = 'none'; // Oculta o modal
    }
}


// Função para finalizar a compra
function finalizarCompra() {
    if (CARRINHO.length === 0) {
        alert('Seu carrinho está vazio. Adicione itens ao carrinho antes de finalizar a compra.');
        return;
    }

    const nameElement = document.getElementById('name');
    const phoneElement = document.getElementById('phone');
    const streetElement = document.getElementById('street');
    const numberElement = document.getElementById('number');
    const neighborhoodElement = document.getElementById('bairro');
    const complementoElement = document.getElementById('complemento');
    const deliveryOptionElement = document.querySelector('input[name="delivery-option"]:checked');
    const paymentMethodElement = document.querySelector('input[name="payment-method"]:checked');
    const changeAmountElement = document.getElementById('change-amount');

    // Verifique a existência dos elementos e obtenha os valores
    const name = nameElement ? nameElement.value.trim() : '';
    const phone = phoneElement ? phoneElement.value.trim() : '';
    const street = streetElement ? streetElement.value.trim() : '';
    const number = numberElement ? numberElement.value.trim() : '';
    const neighborhood = neighborhoodElement ? neighborhoodElement.value.trim() : '';
    const complemento = complementoElement ? complementoElement.value.trim() : '';
    
    // Se deliveryOptionElement ou paymentMethodElement forem nulos, atribua uma string vazia
    const deliveryOption = deliveryOptionElement ? deliveryOptionElement.value : '';
    const paymentMethod = paymentMethodElement ? paymentMethodElement.value : '';
    
    const changeAmount = paymentMethod === 'Dinheiro' && changeAmountElement ? parseFloat(changeAmountElement.value) || 0 : 0;

    if (!deliveryOption) {
        alert("Por favor, escolha a forma de entrega!");
        return;
    }

    if (deliveryOption === 'Entrega' && (!street || !number || !neighborhood || !name || !phone)) {
        alert('Por favor, preencha todos os campos obrigatórios para a entrega!');
        return;
    }

    if (deliveryOption === 'Retirar' && (!name || !phone)) {
        alert('Por favor, preencha todos os campos obrigatórios para a retirada!');
        return;
    }

    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        alert('Por favor, insira um número de celular válido no formato (99) 99999-9999.');
        return;
    }

    if (!paymentMethod) {
        alert('Por favor, selecione a forma de pagamento!');
        return;
    }

    if (paymentMethod === 'Dinheiro' && isNaN(changeAmount)) {
        alert('Por favor, insira um valor válido para o troco!');
        return;
    }

    const cartItems = document.querySelectorAll('.cart-item');
    const cartData = Array.from(cartItems).map(item => {
        const itemInfo = item.querySelector('.item-info');
        const itemName = itemInfo.querySelector('h3').textContent;
        const itemDescription = itemInfo.querySelector('p').textContent;

        const adicionaisElement = Array.from(itemInfo.querySelectorAll('p')).find(p => p.textContent.startsWith('Adicionais:'));
        const adicionaisText = adicionaisElement ? adicionaisElement.textContent.replace('Adicionais: ', '') : '';
        const adicionais = adicionaisText.split(',').reduce((acc, adicional) => {
            const [name, value] = adicional.split(' R$');
            if (name && value) {
                acc[name.trim()] = parseFloat(value);
            }
            return acc;
        }, {});

        const observacoesElement = Array.from(itemInfo.querySelectorAll('p')).find(p => p.textContent.startsWith('Observações:'));
        const observacoes = observacoesElement ? observacoesElement.textContent.replace('Observações: ', '') : '';

        const itemQuantity = parseInt(item.querySelector('.item-quantity span').textContent, 10);
        const itemPrice = parseFloat(item.querySelector('.item-price').textContent.replace('R$', '').replace(',', '.'));

        return {
            nome: itemName,
            descricao: itemDescription,
            quantidade: itemQuantity,
            preco: itemPrice,
            obs: observacoes,
            adicionais: adicionais
        };
    });

    if (verificarHorarioDeAtendimento() === false) {
        return;
    } else {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('street', street);
        formData.append('number', number);
        formData.append('neighborhood', neighborhood);
        formData.append('complemento', complemento);
        formData.append('deliveryOption', deliveryOption);
        formData.append('paymentMethod', paymentMethod);
        formData.append('changeAmount', changeAmount);
        formData.append('cart_items', JSON.stringify(cartData));

        console.log(formData)

        fetch('script.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.log('Sucesso:', data);

            localStorage.removeItem('CARRINHO');
            document.querySelector('.cart-container').innerHTML = "<p>Seu carrinho está vazio.</p>";
            showMessageModal();
            document.getElementById('total').textContent = "TOTAL: R$0,00";


        })
        .catch((error) => {
            console.error('Erro:', error);
        });
    }
}




document.addEventListener('DOMContentLoaded', function() {
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const changeRequestDiv = document.getElementById('change-request');

    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Dinheiro') {
                changeRequestDiv.style.display = 'block'; // Mostra o campo de troco
            } else {
                changeRequestDiv.style.display = 'none'; // Oculta o campo de troco
            }
        });
    });
});

function formatPhoneNumber(value) {
    // Remove todos os caracteres que não são dígitos
    value = value.replace(/\D/g, '');
    // Adiciona o formato (00) 00000-0000
    if (value.length <= 2) {
        return `(${value}`;
    } else if (value.length <= 5) {
        return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length <= 10) {
        return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else {
        return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
    }
}

document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value;
    e.target.value = formatPhoneNumber(value);
});

document.getElementById('phone').addEventListener('keypress', function(e) {
    // Permite apenas números e impede letras e caracteres especiais
    if (e.key < '0' || e.key > '9') {
        e.preventDefault();
    }
});


function verificarHorarioDeAtendimento() {
    const agora = new Date();
    const diaDaSemana = agora.getDay(); // 0 (domingo) a 6 (sábado)
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();

    // Horário de atendimento da loja (exemplo: segunda a sexta das 10:00 às 18:00)
    const diasDeAtendimento = [2,3,4,5,6,0]; // Segunda a sexta-feira
    const horaAbertura = 18; // 10:00
    const horaFechamento = 23; // 18:00

    if (diasDeAtendimento.includes(diaDaSemana) &&
        (horaAtual > horaAbertura && horaAtual < horaFechamento ||
         (horaAtual === horaAbertura && minutoAtual >= 0) ||
         (horaAtual === horaFechamento && minutoAtual <= 0))) {
        return true;
    } else {
        alert("A Hamburgueria está fechada no momento. Horário de atendimento: terça-feira a sexta-feira das 18:00 às 23:00.");
        return false;
    }
}