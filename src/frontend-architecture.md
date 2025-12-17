Frontend architecture for Khulna Travels

Goal: Provide a clean, componentized frontend structure compatible with a MySQL backend and REST API.

Recommended folder structure (inside `src/`):

- components/
  - Auth/             -> Login, Register, Password reset
  - Booking/          -> Booking flow, Seat map, Payment steps
  - Dashboard/        -> `UserDashboard`, `CounterDashboard`, `AdminDashboard`
  - Tickets/          -> Ticket viewer/printer, bulk download logic
  - Counter/          -> Counter-specific UI (select counter, apply discount)
  - Admin/            -> Manage buses, coaches, schedules, users, refunds
  - Common/           -> Buttons, Modals, Forms, DatePicker, Table
- pages/
  - HomePage.js
  - BookingPage.js
  - SeatSelectionPage.js
  - PaymentPage.js
  - UserDashboard.js
  - CounterStaffDashboard.js
  - AdminDashboard.js
  - PaymentResult.js

State & data flow:

- Use React Context or a lightweight state manager (Zustand/Redux) for auth state, current booking draft, and global app settings.
- Fetch data via a single `src/services/api.js` which wraps `fetch`/`axios`. Keep API contracts consistent with the provided `src/api_contracts.md`.
- Optimistic UI: when counter staff assigns seats or applies discount, update local state then persist via API.

Key feature mappings to DB:

- Supervisor tip / seat assignment:
  - UI: When staff selects seats, allow `supervisor tip` input per seat.
  - DB: Stored in `booking_seats.supervisor_tip` and `assigned_by`.

- Online ticket booking:
  - Flow: search schedule -> choose seats -> payment -> generate tickets (persist `tickets` rows) -> show in `UserDashboard`.
  - DB: `bookings`, `booking_seats`, `payments`, `tickets`.

- Counter staff view (who sold and which counter):
  - UI: Counter staff dashboard lists bookings filtered by `counter_id`.
  - DB: `bookings.counter_id`, `tickets.issued_by`.

- Discount option for counter staff:
  - UI: apply discount during booking
  - DB: `discounts` & `bookings.discount_id`, `bookings.discount_amount`.

- Cancellation with authority approval:
  - UI: user or staff creates cancel request; admin or authorized staff approves.
  - DB: `cancellation_requests` with `status` and `processed_by`.

- Schedule change option:
  - UI: admin changes `schedules.status` to `rescheduled`; staff/users notified.
  - DB: `schedules.status`.

- Ticket printing and bulk download:
  - UI: individual ticket print (open new window with printable HTML/PDF) and counter bulk-download (generate ZIP/PDF server-side).
  - DB: `tickets.file_path` optional to store generated ticket file, `tickets` table contains seat/coaches mapping.

Security & roles:

- Protect routes: only `admin` can manage buses/schedules; `counter_staff` can create bookings and process refunds with proper scopes; `user` sees only own bookings.
- Use JWT or session cookies for auth. Backend should validate role-based access.

API considerations:

- Keep payloads minimal and predictable.
- Use pagination for booking lists.
- Provide endpoints for seat availability that lock seats for a short TTL during seat selection.

Integration tips:

- Use an endpoint to request a temporary seat lock: `POST /api/seat-locks` (lock expires in 2-3 minutes).
- For ticket printing, return a pre-signed URL or generate PDF server-side and return `file_path`.

Next steps to implement:

- Implement API endpoints (see `src/api_contracts.md`).
- Replace skeleton components in `src/components/*` with full UI and integrate `src/services/api.js`.
- Add tests for booking flows and seat locking.
