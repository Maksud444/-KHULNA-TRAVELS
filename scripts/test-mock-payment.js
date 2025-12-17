// Simple test runner for mock payment endpoints
// Usage: node scripts/test-mock-payment.js

(async function main(){
  try {
    const base = 'http://localhost:5000/khulna-travels-api/api';

    console.log('1) Creating bKash payment...');
    const createRes = await fetch(base + '/bkash/create-payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1200, booking_id: 'B100', customer_name: 'Test User' })
    });
    const createText = await createRes.text();
    console.log('CREATE raw:', createText);
    const createJson = JSON.parse(createText);
    if (!createJson || !createJson.transaction_id) throw new Error('Create did not return transaction_id');

    const tx = createJson.transaction_id;
    console.log('→ transaction_id:', tx);

    console.log('\n2) Executing payment (simulate gateway callback)...');
    const execRes = await fetch(base + '/bkash/execute-payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: tx, payment_id: 'MOCKBK_1234' })
    });
    const execText = await execRes.text();
    console.log('EXECUTE raw:', execText);

    console.log('\n3) Checking payment status...');
    const statusRes = await fetch(base + '/payment-status.php?transaction_id=' + encodeURIComponent(tx));
    const statusText = await statusRes.text();
    console.log('STATUS raw:', statusText);

    console.log('\nTest completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(2);
  }
})();