<?php
require_once __DIR__ . '/../../backend/init.php';

$input = getInputJSON();

if (!$input) {
    jsonResponse(['success' => false, 'message' => 'Invalid request body'], 400);
}

$db = new Database();
$pdo = $db->getConnection();

$transaction_id = 'TXN' . time() . rand(100, 999);

// Insert into payments table (best-effort)
try {
    $sql = "INSERT INTO payments (transaction_id, booking_id, user_id, amount, payment_method, status, customer_name, customer_phone, customer_email, customer_address, payment_initiated_at) VALUES (:transaction_id, :booking_id, :user_id, :amount, :payment_method, 'pending', :customer_name, :customer_phone, :customer_email, :customer_address, NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':transaction_id' => $transaction_id,
        ':booking_id' => $input['booking_id'] ?? '',
        ':user_id' => $input['user_id'] ?? 'GUEST',
        ':amount' => $input['amount'] ?? 0,
        ':payment_method' => 'bkash',
        ':customer_name' => $input['customer_name'] ?? '',
        ':customer_phone' => $input['customer_phone'] ?? '',
        ':customer_email' => $input['customer_email'] ?? null,
        ':customer_address' => $input['customer_address'] ?? null,
    ]);

    $payment_id = $pdo->lastInsertId();
    log_payment($pdo, $payment_id, $transaction_id, 'request', 'create-payment', $input, 'bkash', 'create-payment.php', 200);

} catch (Exception $e) {
    // If DB isn't available, still return a mocked response
    $payment_id = null;
}

// Build a mock bKash payment page URL (served by this PHP backend)
$bkash_url = (isset($_SERVER['REQUEST_SCHEME']) ? $_SERVER['REQUEST_SCHEME'] : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/bkash/mock-pay.php?transaction_id=' . $transaction_id;

jsonResponse([
    'success' => true,
    'transaction_id' => $transaction_id,
    'payment_id' => $payment_id,
    'bkash_url' => $bkash_url,
]);
?>