<?php
require_once __DIR__ . '/init.php';

$transaction_id = $_GET['transaction_id'] ?? null;
if (!$transaction_id) jsonResponse(['success' => false, 'message' => 'transaction_id required'], 400);

$db = new Database();
$pdo = $db->getConnection();

try {
    $stmt = $pdo->prepare('SELECT * FROM payments WHERE transaction_id = :transaction_id LIMIT 1');
    $stmt->execute([':transaction_id' => $transaction_id]);
    $payment = $stmt->fetch();

    if (!$payment) {
        jsonResponse(['success' => false, 'message' => 'Payment not found'], 404);
    }

    jsonResponse(['success' => true, 'payment' => $payment]);
} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
}
?>