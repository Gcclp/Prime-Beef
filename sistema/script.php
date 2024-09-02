<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Inclui o arquivo de configuração
    $config = require '../../config.php';
    
    // Configurações de conexão com o banco de dados
    $host = $config['db_host'];
    $dbname = $config['db_name'];
    $username = $config['db_user'];
    $password = $config['db_pass'];
    
    // Cria a conexão
    $conn = new mysqli($host, $username, $password, $dbname);
    
    // Verifica a conexão
    if ($conn->connect_error) {
        die("Conexão falhou: " . $conn->connect_error);
    }
    

    // Obtém os dados do formulário
    $nome = $conn->real_escape_string($_POST['name']);
    $telefone = $conn->real_escape_string($_POST['phone']);
    $opcao_entrega = $conn->real_escape_string($_POST['deliveryOption']);
    $forma_pagamento = $conn->real_escape_string($_POST['paymentMethod']);
    $troco = isset($_POST['changeAmount']) ? $conn->real_escape_string($_POST['changeAmount']) : null;
    $rua = $opcao_entrega === 'Entrega' ? ($conn->real_escape_string($_POST['street']) ?: 'na') : null;
    $numero = $opcao_entrega === 'Entrega' ? ($conn->real_escape_string($_POST['number']) ?: 'na') : null;
    $bairro = $opcao_entrega === 'Entrega' ? ($conn->real_escape_string($_POST['neighborhood']) ?: 'na') : null;
    $complemento = $opcao_entrega === 'Entrega' ? ($conn->real_escape_string($_POST['complemento']) ?: 'na') : null;

    $status = "Pendente"; // Definindo o status diretamente

    // Obtém os itens do carrinho
    $itens = isset($_POST['cart_items']) ? json_decode($_POST['cart_items'], true) : [];


    if (!is_array($itens)) {
        $itens = [];
    }

    // Inicia uma transação
    $conn->begin_transaction();

    try {
        // Insere o pedido na tabela Cliente
        $stmt = $conn->prepare("INSERT INTO `PEDIDOS_CLIENTE` (`ID`, `Nome_Cliente`, `Telefone`, `Rua`, `N`, `Bairro`, `Complemento`, `Forma_Entrega`, `Forma_Pagamento`, `TROCO`, `Total`, `Status`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $observacoes = ''; // Defina uma observação padrão, se necessário
        $preco_total_pedido = array_sum(array_column($itens, 'preco')); // Calcula o preço total do pedido
        $stmt->bind_param('sssssssssss', $nome, $telefone, $rua, $numero, $bairro, $complemento, $opcao_entrega, $forma_pagamento, $troco, $preco_total_pedido, $status);

        if (!$stmt->execute()) {
            throw new Exception("Erro ao inserir pedido: " . $stmt->error);
        }

        $pedido_id = $stmt->insert_id; // Obtém o ID do pedido inserido
        $stmt->close();

        // Insere os itens do pedido na tabela ITENS_PEDIDO
        $stmt = $conn->prepare("INSERT INTO `ITENS_PEDIDO` (`ID_PEDIDO`, `Nome_Item`, `Descricao_Item`, `Adicionais`, `Observacoes`, `Quantidade`, `Preco_Total`) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        foreach ($itens as $item) {
            $nome_item = isset($item['nome']) ? $conn->real_escape_string($item['nome']) : 'Nome não especificado';
            $descricao_item = isset($item['descricao']) ? $conn->real_escape_string($item['descricao']) : '';
            $preco_base = isset($item['preco']) ? (float)$item['preco'] : 0.0;
            
            // Processa adicionais para armazenar apenas os nomes
            $adicionais = isset($item['adicionais']) ? array_keys($item['adicionais']) : [];
            $adicionais_str = implode(', ', $adicionais); // Concatena nomes com vírgula
            
            $observacoes_item = isset($item['obs']) ? $conn->real_escape_string($item['obs']) : '';
            $quantidade = isset($item['quantidade']) ? (int)$item['quantidade'] : 0;
            $preco_total_item = isset($item['preco']) ? (float)$item['preco'] : 0.0;

            $stmt->bind_param('issssid', $pedido_id, $nome_item, $descricao_item, $adicionais_str, $observacoes_item, $quantidade, $preco_total_item);

            if (!$stmt->execute()) {
                throw new Exception("Erro ao inserir item do pedido: " . $stmt->error);
            }
        }

        $stmt->close();

        // Se tudo deu certo, confirma a transação
        $conn->commit();

        $conn->close();

        echo "Pedido realizado com sucesso!";
    } catch (Exception $e) {
        // Se algo deu errado, desfaz a transação
        $conn->rollback();

        echo "Erro ao realizar pedido: " . $e->getMessage();
    }
} else {
    echo "Método não permitido";
}
