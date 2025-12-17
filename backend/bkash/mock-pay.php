<?php
$transaction_id = $_GET['transaction_id'] ?? 'unknown';
$host = (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost:8000');
$frontend = 'http://localhost:3000';
$complete_url = $frontend . '/payment/result?transaction_id=' . urlencode($transaction_id) . '&paymentID=MOCKBK_' . rand(1000,9999);
$cancel_url = $frontend . '/payment/cancelled?transaction_id=' . urlencode($transaction_id);
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>bKash Mock Payment</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;padding:40px;text-align:center}button{padding:12px 18px;margin:10px;border-radius:8px;border:0;font-weight:700;cursor:pointer} .complete{background:#2cb67d;color:#fff} .cancel{background:#f5576c;color:#fff}</style>
</head>
<body>
  <h1>bKash Mock Payment</h1>
  <p>Transaction: <strong><?php echo htmlspecialchars($transaction_id); ?></strong></p>
  <p>This is a mock payment page for testing. Click complete to simulate success.</p>
  <form method="post" action="/bkash/execute-payment.php" id="execForm">
    <input type="hidden" name="transaction_id" value="<?php echo htmlspecialchars($transaction_id); ?>" />
    <input type="hidden" name="payment_id" value="MOCKBK_<?php echo rand(1000,9999); ?>" />
    <button type="submit" class="complete">Complete Payment</button>
  </form>
  <button onclick="window.location.href='<?php echo $cancel_url; ?>'" class="cancel">Cancel</button>
  <script>
    // If form is submitted via regular POST we'll send JSON and show redirect
    document.getElementById('execForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const form = e.target;
      const data = { transaction_id: form.transaction_id.value, payment_id: form.payment_id.value };
      try {
        const res = await fetch('/bkash/execute-payment.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        const json = await res.json();
        // redirect to frontend result page with paymentID
        window.location.href = '<?php echo $frontend; ?>' + '/payment/result?transaction_id=' + encodeURIComponent(data.transaction_id) + '&paymentID=' + encodeURIComponent(data.payment_id);
      } catch (err) {
        alert('Error executing mock payment');
      }
    })
  </script>
</body>
</html>