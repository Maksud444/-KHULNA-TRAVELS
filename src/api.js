const API_BASE = process.env.REACT_APP_API_URL || '';

export async function getBuses() {
  const res = await fetch(`${API_BASE}/api/buses`);
  if (!res.ok) throw new Error('Failed to fetch buses');
  return res.json();
}

export async function bookTicket(payload) {
  const res = await fetch(`${API_BASE}/api/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Booking failed');
  return res.json();
}
