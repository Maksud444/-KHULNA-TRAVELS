const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sample data
const buses = [
  { id: 1, name: 'Khulna Express', from: 'Khulna', to: 'Kuakata', seats: 40, price: 1200 },
  { id: 2, name: 'Coastal Cruiser', from: 'Jessore', to: 'Kuakata', seats: 34, price: 1100 },
  { id: 3, name: 'Bay Line', from: 'Khulna', to: 'Patuakhali', seats: 42, price: 1000 }
];

app.get('/api/buses', (req, res) => {
  res.json(buses);
});

// In-memory payments store for mock payment flows
const payments = new Map();

function makeTransactionId() {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 900 + 100);
}

// Helper to build full path that matches the PHP-based frontend default
const API_PREFIX = '/khulna-travels-api/api';

// bKash create-payment (mocks backend PHP)
app.post(`${API_PREFIX}/bkash/create-payment.php`, (req, res) => {
  const input = req.body || {};
  const transaction_id = makeTransactionId();
  const payment = {
    transaction_id,
    amount: input.amount || 0,
    booking_id: input.booking_id || null,
    payment_method: 'bkash',
    status: 'pending',
    created_at: new Date().toISOString(),
    meta: input
  };
  payments.set(transaction_id, payment);

  const bkash_url = `${req.protocol}://${req.get('host')}/bkash/mock-pay.php?transaction_id=${encodeURIComponent(transaction_id)}`;
  res.json({ success: true, transaction_id, payment_id: null, bkash_url });
});

// bKash execute-payment
app.post(`${API_PREFIX}/bkash/execute-payment.php`, (req, res) => {
  const input = req.body || {};
  const transaction_id = input.transaction_id;
  if (!transaction_id || !payments.has(transaction_id)) return res.status(404).json({ success: false, message: 'Payment not found' });
  const p = payments.get(transaction_id);
  p.status = 'completed';
  p.gateway_payment_id = input.payment_id || input.gateway_payment_id || null;
  p.completed_at = new Date().toISOString();
  payments.set(transaction_id, p);
  res.json({ success: true, message: 'Payment executed', transaction_id });
});

// SSLCommerz init-payment
app.post(`${API_PREFIX}/sslcommerz/init-payment.php`, (req, res) => {
  const input = req.body || {};
  const transaction_id = makeTransactionId();
  const payment = {
    transaction_id,
    amount: input.amount || 0,
    booking_id: input.booking_id || null,
    payment_method: 'sslcommerz',
    status: 'pending',
    created_at: new Date().toISOString(),
    meta: input
  };
  payments.set(transaction_id, payment);
  const gateway_url = `${req.protocol}://${req.get('host')}/sslcommerz/mock-pay.php?transaction_id=${encodeURIComponent(transaction_id)}`;
  res.json({ success: true, transaction_id, payment_id: null, gateway_url });
});

// Payment status
app.get(`${API_PREFIX}/payment-status.php`, (req, res) => {
  const transaction_id = req.query.transaction_id;
  if (!transaction_id || !payments.has(transaction_id)) return res.status(404).json({ success: false, message: 'Payment not found' });
  const payment = payments.get(transaction_id);
  res.json({ success: true, payment });
});

// Mock gateway pages (simple HTML) to simulate redirect + execute
app.get('/bkash/mock-pay.php', (req, res) => {
  const transaction_id = req.query.transaction_id || 'unknown';
  const frontend = 'http://localhost:3000';
  const completeUrl = `${frontend}/payment/result?transaction_id=${encodeURIComponent(transaction_id)}&paymentID=MOCKBK_${Math.floor(Math.random() * 9000 + 1000)}`;
  const cancelUrl = `${frontend}/payment/cancelled?transaction_id=${encodeURIComponent(transaction_id)}`;
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>bKash Mock Payment</title></head><body style="font-family:Arial;padding:30px;text-align:center"><h1>bKash Mock</h1><p>Transaction: <strong>${transaction_id}</strong></p><p><button onclick="complete()" style="padding:10px 14px">Complete</button> <button onclick="cancel()" style="padding:10px 14px;margin-left:8px">Cancel</button></p><script>async function complete(){ await fetch('/khulna-travels-api/api/bkash/execute-payment.php', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transaction_id:'${transaction_id}', payment_id:'MOCKBK_'+Math.floor(Math.random()*9000+1000)})}); window.location='${completeUrl}'; } function cancel(){ window.location='${cancelUrl}'; }</script></body></html>`);
});

app.get('/sslcommerz/mock-pay.php', (req, res) => {
  const transaction_id = req.query.transaction_id || 'unknown';
  const frontend = 'http://localhost:3000';
  const completeUrl = `${frontend}/payment/result?transaction_id=${encodeURIComponent(transaction_id)}&paymentID=MOCKSSL_${Math.floor(Math.random() * 9000 + 1000)}`;
  const cancelUrl = `${frontend}/payment/cancelled?transaction_id=${encodeURIComponent(transaction_id)}`;
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>SSLCommerz Mock Payment</title></head><body style="font-family:Arial;padding:30px;text-align:center"><h1>SSLCommerz Mock</h1><p>Transaction: <strong>${transaction_id}</strong></p><p><button onclick="complete()" style="padding:10px 14px">Complete</button> <button onclick="cancel()" style="padding:10px 14px;margin-left:8px">Cancel</button></p><script>async function complete(){ await fetch('/khulna-travels-api/api/bkash/execute-payment.php', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transaction_id:'${transaction_id}', payment_id:'MOCKSSL_'+Math.floor(Math.random()*9000+1000)})}); window.location='${completeUrl}'; } function cancel(){ window.location='${cancelUrl}'; }</script></body></html>`);
});

app.post('/api/book', (req, res) => {
  const booking = req.body;
  // In a real app you'd validate and persist booking
  return res.status(201).json({ success: true, booking });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
