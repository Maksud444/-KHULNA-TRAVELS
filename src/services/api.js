const BASE = process.env.REACT_APP_API_BASE || '/api';

function handleResp(res) {
  if (!res.ok) return res.json().then((e) => Promise.reject(e));
  return res.json();
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  auth: {
    register: (data) => fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResp),

    login: (data) => fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResp),

    me: () => fetch(`${BASE}/users/me`, { headers: { ...authHeaders() } }).then(handleResp),
  },

  buses: {
    list: () => fetch(`${BASE}/buses`).then(handleResp),
    coaches: (busId) => fetch(`${BASE}/buses/${busId}/coaches`).then(handleResp),
  },

  schedules: {
    search: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return fetch(`${BASE}/schedules?${qs}`).then(handleResp);
    },
    update: (id, body) => fetch(`${BASE}/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handleResp),
  },

  seatLocks: {
    create: (body) => fetch(`${BASE}/seat-locks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handleResp),
    release: (lockId) => fetch(`${BASE}/seat-locks/${lockId}/release`, { method: 'POST', headers: { ...authHeaders() } }).then(handleResp),
  },

  bookings: {
    create: (body) => fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handleResp),
    get: (id) => fetch(`${BASE}/bookings/${id}`, { headers: { ...authHeaders() } }).then(handleResp),
    listForUser: (userId) => fetch(`${BASE}/users/${userId}/bookings`, { headers: { ...authHeaders() } }).then(handleResp),
    listForCounter: (counterId) => fetch(`${BASE}/counters/${counterId}/bookings`, { headers: { ...authHeaders() } }).then(handleResp),
  },

  payments: {
    initiate: (body) => fetch(`${BASE}/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handleResp),
    confirm: (body) => fetch(`${BASE}/payments/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    }).then(handleResp),
  },

  tickets: {
    listForBooking: (bookingId) => fetch(`${BASE}/bookings/${bookingId}/tickets`, { headers: { ...authHeaders() } }).then(handleResp),
    print: (bookingId) => fetch(`${BASE}/bookings/${bookingId}/tickets/print`, { method: 'POST', headers: { ...authHeaders() } }).then(handleResp),
  },

  discounts: {
    list: () => fetch(`${BASE}/discounts`, { headers: { ...authHeaders() } }).then(handleResp),
    apply: (body) => fetch(`${BASE}/discounts/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) }).then(handleResp),
  },

  cancellations: {
    request: (body) => fetch(`${BASE}/cancellations`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) }).then(handleResp),
    approve: (id, body) => fetch(`${BASE}/cancellations/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) }).then(handleResp),
  },

  counters: {
    list: () => fetch(`${BASE}/counters`, { headers: { ...authHeaders() } }).then(handleResp),
  },

  users: {
    get: (id) => fetch(`${BASE}/users/${id}`, { headers: { ...authHeaders() } }).then(handleResp),
  }
};

export default api;