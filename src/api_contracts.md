API Contracts (REST) - Khulna Travels

Authentication
- POST /api/auth/register
  body: { username, email, password, full_name, phone }
  returns: { user, token }

- POST /api/auth/login
  body: { emailOrUsername, password }
  returns: { user, token }

Users
- GET /api/users/:id
- GET /api/users/me
- PUT /api/users/me

Counters
- GET /api/counters
- POST /api/counters (admin)

Buses / Coaches / Seats / Schedules
- GET /api/buses
- GET /api/buses/:id/coaches
- GET /api/coaches/:id/seats
- GET /api/schedules?origin=&destination=&date=
- POST /api/schedules (admin)
- PUT /api/schedules/:id (admin)

Seat locking, booking, payments
- POST /api/seat-locks
  body: { schedule_id, seats: [seat_id,...], user_id (optional), counter_id (optional) }
  returns: { lock_id, expires_at }

- POST /api/bookings
  body: { lock_id, user_id (or guest), counter_id (optional), discounts, payment_method }
  returns: { booking_reference, booking_id, payment_required }

- GET /api/bookings/:id
- GET /api/users/:id/bookings
- GET /api/counters/:id/bookings

Payments
- POST /api/payments/initiate
  body: { booking_id, gateway, amount }
  returns: { payment_url or transaction_id }

- POST /api/payments/confirm
  body: { booking_id, transaction_id, status }

Tickets
- GET /api/bookings/:id/tickets
- POST /api/bookings/:id/tickets/print  (generates ticket PDF)

Discounts
- GET /api/discounts
- POST /api/discounts/apply
  body: { booking_id, discount_code, applied_by }

Cancellations & Refunds
- POST /api/cancellations
  body: { booking_id, reason, requested_by }
  returns: { cancellation_request_id }

- GET /api/cancellations/:id
- POST /api/cancellations/:id/approve
  body: { approved_by, notes }
  (admin or authorized counter manager)

Admin / Audit
- GET /api/admin/bookings?status=&from=&to=
- POST /api/admin/schedule-change
  body: { schedule_id, new_departure, reason }

Notes
- Endpoints must enforce RBAC via tokens/sessions.
- Seat-locks should expire and be cleaned up server-side.
- Booking creation will consume the lock and make seats unavailable.
