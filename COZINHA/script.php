<?php
    header('Content-Type: application/json');

    $config = require '../../config.php';

    $host = $config['db_host'];
    $dbname = $config['db_name'];
    $username = $config['db_user'];
    $password = $config['db_pass'];

    $conn = new mysqli($host, $username, $password, $dbname);

    if ($conn->connect_error) {
        echo json_encode(['error' => 'Conexão falhou: ' . $conn->connect_error]);
        exit;
    }

    $sql_clientes = "
        SELECT 
            ID, Nome_Cliente, Telefone, Rua, N, Bairro, Complemento, Forma_Entrega, Forma_Pagamento, TROCO, Total, Status
        FROM PEDIDOS_CLIENTE
        WHERE Status != 'Concluído'
    ";

    $result_clientes = $conn->query($sql_clientes);

    if (!$result_clientes) {
        echo json_encode(['error' => 'Erro na consulta de pedidos: ' . $conn->error]);
        exit;
    }

    $pedidos = array();

    if ($result_clientes->num_rows > 0) {
        while ($cliente_row = $result_clientes->fetch_assoc()) {
            $id_pedido = $cliente_row['ID'];

            $sql_itens = "
                SELECT Nome_Item, Descricao_Item, Adicionais, Observacoes, Quantidade, Preco_Total
                FROM ITENS_PEDIDO
                WHERE ID_PEDIDO = '$id_pedido'
            ";
            $result_itens = $conn->query($sql_itens);

            if (!$result_itens) {
                echo json_encode(['error' => 'Erro na consulta de itens: ' . $conn->error]);
                exit;
            }

            $itens = array();
            if ($result_itens->num_rows > 0) {
                while ($item_row = $result_itens->fetch_assoc()) {
                    $itens[] = $item_row;
                }
            }

            $pedidos[] = array(
                'pedido' => $cliente_row,
                'itens' => $itens
            );
        }
    } else {
        echo json_encode(['error' => 'Nenhum pedido encontrado.']);
    }

    echo json_encode($pedidos);
    $conn->close();
?>
