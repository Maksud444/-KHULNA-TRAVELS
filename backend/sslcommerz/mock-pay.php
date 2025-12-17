<?php
$transaction_id = $_GET['transaction_id'] ?? 'unknown';
$frontend = 'http://localhost:3000';
$complete_url = $frontend . '/payment/result?transaction_id=' . urlencode($transaction_id);
$cancel_url = $frontend . '/payment/cancelled?transaction_id=' . urlencode($transaction_id);
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>SSLCommerz Mock Payment</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;padding:40px;text-align:center}button{padding:12px 18px;margin:10px;border-radius:8px;border:0;font-weight:700;cursor:pointer} .complete{background:#667eea;color:#fff} .cancel{background:#f5576c;color:#fff}</style>
</head>
<body>
  <h1>SSLCommerz Mock Payment</h1>
  <p>Transaction: <strong><?php echo htmlspecialchars($transaction_id); ?></strong></p>
  <p>This is a mock gateway page. Click complete to simulate success.</p>
  <button onclick="window.location.href='<?php echo $complete_url; ?>'" class="complete">Complete Payment</button>
  <button onclick="window.location.href='<?php echo $cancel_url; ?>'" class="cancel">Cancel</button>
</body>
</html>