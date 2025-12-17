<?php
require_once __DIR__ . '/../../backend/init.php';

$input = getInputJSON();
if (!$input) jsonResponse(['success' => false, 'message' => 'Invalid input'], 400);

$db = new Database();
$pdo = $db->getConnection();

$transaction_id = 'TXN' . time() . rand(100, 999);

try {
    $sql = "INSERT INTO payments (transaction_id, booking_id, user_id, amount, payment_method, status, customer_name, customer_phone, customer_email, customer_address, payment_initiated_at) VALUES (:transaction_id, :booking_id, :user_id, :amount, :payment_method, 'pending', :customer_name, :customer_phone, :customer_email, :customer_address, NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':transaction_id' => $transaction_id,
        ':booking_id' => $input['booking_id'] ?? '',
        ':user_id' => $input['user_id'] ?? 'GUEST',
        ':amount' => $input['amount'] ?? 0,
        ':payment_method' => 'sslcommerz',
        ':customer_name' => $input['customer_name'] ?? '',
        ':customer_phone' => $input['customer_phone'] ?? '',
        ':customer_email' => $input['customer_email'] ?? null,
        ':customer_address' => $input['customer_address'] ?? null,
    ]);

    $payment_id = $pdo->lastInsertId();
    log_payment($pdo, $payment_id, $transaction_id, 'request', 'init-payment', $input, 'sslcommerz', 'init-payment.php', 200);

} catch (Exception $e) {
    $payment_id = null;
}

$gateway_url = (isset($_SERVER['REQUEST_SCHEME']) ? $_SERVER['REQUEST_SCHEME'] : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/sslcommerz/mock-pay.php?transaction_id=' . $transaction_id;

jsonResponse([
    'success' => true,
    'transaction_id' => $transaction_id,
    'payment_id' => $payment_id,
    'gateway_url' => $gateway_url,
]);
?>