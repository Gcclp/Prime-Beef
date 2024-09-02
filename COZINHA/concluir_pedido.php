<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
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

    // Obtém o ID do pedido
    $pedido_id = $_GET['id'];

    // Atualiza o status do pedido para 'Concluído'
    $stmt = $conn->prepare("UPDATE PEDIDOS_CLIENTE SET Status = 'Concluído' WHERE ID = ?");
    $stmt->bind_param('i', $pedido_id);

    if ($stmt->execute()) {
        echo "Pedido ID: $pedido_id marcado como Concluído com sucesso!";
    } else {
        echo "Erro ao concluir o pedido: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Requisição inválida.";
}
?>
