import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function SeatSelection({ scheduleId, onBooked }) {
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [lockId, setLockId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSeats() {
      try {
        const res = await api.schedules.search({ schedule_id: scheduleId });
        // expected: res.seats or res.schedule.seats depending on API
        setSeats(res.seats || []);
      } catch (err) {
        console.error('Failed load seats', err);
      }
    }
    if (scheduleId) loadSeats();
  }, [scheduleId]);

  const toggle = (seat) => {
    setSelected((s) => (s.includes(seat.id) ? s.filter((x) => x !== seat.id) : [...s, seat.id]));
  };

  const lockSeats = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      const res = await api.seatLocks.create({ schedule_id: scheduleId, seats: selected });
      setLockId(res.lock_id);
    } catch (err) {
      console.error('Lock failed', err);
    } finally {
      setLoading(false);
    }
  };

  const book = async () => {
    if (!lockId) {
      await lockSeats();
    }
    setLoading(true);
    try {
      const res = await api.bookings.create({ lock_id: lockId, schedule_id: scheduleId, seats: selected });
      if (onBooked) onBooked(res);
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Seat Selection</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {seats.map((seat) => (
          <button key={seat.id} onClick={() => toggle(seat)} style={{ background: selected.includes(seat.id) ? '#4caf50' : '#eee' }}>
            {seat.seat_number}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={lockSeats} disabled={!selected.length || loading}>Lock Seats</button>
        <button onClick={book} disabled={!selected.length || loading}>Book</button>
      </div>
    </div>
  );
}
