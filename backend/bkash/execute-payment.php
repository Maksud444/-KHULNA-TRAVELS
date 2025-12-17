<?php
require_once __DIR__ . '/../../backend/init.php';

$input = getInputJSON();
if (!$input) jsonResponse(['success' => false, 'message' => 'Invalid input'], 400);

$db = new Database();
$pdo = $db->getConnection();

$payment_id = $input['payment_id'] ?? null;
$transaction_id = $input['transaction_id'] ?? null;
$gateway_payment_id = $input['gateway_payment_id'] ?? ($input['payment_id'] ?? null);

if (!$transaction_id) jsonResponse(['success' => false, 'message' => 'transaction_id required'], 400);

try {
    // update payment record
    $sql = "UPDATE payments SET status = 'completed', gateway_payment_id = :gateway_payment_id, payment_completed_at = NOW(), callback_response = :cb WHERE transaction_id = :transaction_id";
    $stmt = $pdo->prepare($sql);
    $cb = json_encode($input);
    $stmt->execute([
        ':gateway_payment_id' => $gateway_payment_id,
        ':cb' => $cb,
        ':transaction_id' => $transaction_id
    ]);

    // fetch payment id for logging
    $stmt2 = $pdo->prepare("SELECT id FROM payments WHERE transaction_id = :transaction_id");
    $stmt2->execute([':transaction_id' => $transaction_id]);
    $row = $stmt2->fetch();
    $pid = $row['id'] ?? null;

    if ($pid) log_payment($pdo, $pid, $transaction_id, 'callback', 'execute-payment', $input, 'bkash', 'execute-payment.php', 200);

    jsonResponse(['success' => true, 'message' => 'Payment executed', 'transaction_id' => $transaction_id]);

} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => $e->getMessage()], 500);
}
?>