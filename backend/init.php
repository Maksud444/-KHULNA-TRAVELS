<?php
// Basic headers (including CORS for local dev)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Respond to OPTIONS preflight and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config/Database.php';
// Optional payment gateway config
if (file_exists(__DIR__ . '/config/PaymentConfig.php')) {
    require_once __DIR__ . '/config/PaymentConfig.php';
}

function getInputJSON() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function log_payment($pdo, $payment_id, $transaction_id, $log_type, $message = null, $data = null, $gateway = null, $endpoint = null, $http_status = null) {
    $sql = "INSERT INTO payment_logs (payment_id, transaction_id, log_type, log_message, log_data, gateway, endpoint, http_status) VALUES (:payment_id, :transaction_id, :log_type, :log_message, :log_data, :gateway, :endpoint, :http_status)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':payment_id' => $payment_id,
        ':transaction_id' => $transaction_id,
        ':log_type' => $log_type,
        ':log_message' => $message,
        ':log_data' => $data ? json_encode($data) : null,
        ':gateway' => $gateway,
        ':endpoint' => $endpoint,
        ':http_status' => $http_status
    ]);
}
?>