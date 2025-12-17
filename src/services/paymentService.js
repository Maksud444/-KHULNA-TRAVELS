const API_BASE_URL = process.env.REACT_APP_API_URL || '/khulna-travels-api/api';
const RELATIVE_BASE = '/khulna-travels-api/api';

async function safeFetch(url, opts) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }

    if (!res.ok) {
      const message = data && (data.message || data.error || data.msg) ? (data.message || data.error || data.msg) : `Request failed with status ${res.status}`;
      return { success: false, status: res.status, message, data };
    }

    // If server returns an object with success flag we preserve it, else normalize
    if (typeof data === 'object' && ('success' in data || 'payment' in data)) {
      return data;
    }

    return { success: true, data };
  } catch (err) {
    // Network error (CORS, connection refused, etc.)
    console.error('Network error:', err);
    return { success: false, message: err.message };
  }
}

// Try a path using configured API_BASE_URL, then fallback to the CRA proxy relative path if the first attempt fails
async function requestWithFallback(path, opts = {}) {
  const tryUrls = [];
  // Primary: configured API base
  tryUrls.push(`${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`);
  // Fallback: relative proxy
  tryUrls.push(`${RELATIVE_BASE.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`);

  let lastErr = null;
  for (const url of tryUrls) {
    const res = await safeFetch(url, opts);
    if (res && res.success) {
      // annotate which URL succeeded
      res._url = url;
      return res;
    }
    // annotate the attempted url on the error
    if (res) res._tried = res._tried ? res._tried.concat(url) : [url];
    lastErr = res;
  }

  // return the last error (from fallback attempt), include the full list of tried urls
  return Object.assign(lastErr || { success: false, message: 'Unknown error contacting API' }, { _tried: tryUrls });
}

const paymentService = {
  getApiBaseUrl: () => API_BASE_URL,

  // bKash Payment Methods
  createBkashPayment: async (paymentData) => {
    const res = await requestWithFallback('/bkash/create-payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    return res;
  },

  executeBkashPayment: async (paymentId, transactionId) => {
    const res = await requestWithFallback('/bkash/execute-payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, transaction_id: transactionId })
    });
    return res;
  },

  // SSLCommerz Payment Methods
  initSSLCommerzPayment: async (paymentData) => {
    const res = await requestWithFallback('/sslcommerz/init-payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    return res;
  },

  // Payment Status Check
  checkPaymentStatus: async (transactionId) => {
    const res = await requestWithFallback(`/payment-status.php?transaction_id=${encodeURIComponent(transactionId)}`, { method: 'GET' });
    return res;
  },

  // Helper: Get pending payment from localStorage
  getPendingPayment: () => {
    return localStorage.getItem('pending_payment');
  },

  // Helper: Set pending payment
  setPendingPayment: (transactionId) => {
    localStorage.setItem('pending_payment', transactionId);
  },

  // Helper: Clear pending payment
  clearPendingPayment: () => {
    localStorage.removeItem('pending_payment');
  }
};

export default paymentService;