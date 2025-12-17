PHP Backend (mock) for payment integration

Run a lightweight PHP dev server to test endpoints and mock gateway pages:

Option A — If you have PHP installed locally:

```bash
# from repository root
php -S localhost:8000 -t backend/
```

Option B — Use Docker (no PHP install required):

```powershell
# Windows PowerShell (from repo root)
.\backend\serve-php.ps1
```

```bash
# macOS / Linux (from repo root)
./backend/serve-php.sh
```

Option C — (one-command) via npm script:

```bash
# from repo root
npm run serve:php
```

This runs the Docker helper and serves `backend/` on http://localhost:8000.

VS Code Run panel
-----------------
You can also start the server from the VS Code Run panel (Run and Debug) by selecting the "Serve PHP (Docker)" configuration. It runs the same `serve:php` npm script and shows logs in the integrated terminal.

Available endpoints (JSON APIs):
- POST /bkash/create-payment.php
  - body: { amount, booking_id, user_id, customer_name, customer_phone, customer_email, customer_address }
  - response: { success, transaction_id, payment_id, bkash_url }

- POST /bkash/execute-payment.php
  - body: { payment_id, transaction_id, gateway_payment_id }
  - response: { success, message }

- POST /sslcommerz/init-payment.php
  - body: { amount, booking_id, user_id, customer_name, customer_phone, ... }
  - response: { success, transaction_id, payment_id, gateway_url }

- GET /payment-status.php?transaction_id=TXN...
  - response: { success, payment }

Mock gateway pages (interactive):
- /bkash/mock-pay.php?transaction_id=TXN...
- /sslcommerz/mock-pay.php?transaction_id=TXN...

Database:
- See `server/payments_schema.sql` for the MySQL schema.
- Update `backend/config/Database.php` with credentials for your environment.

Gateway Configuration:
- A sample `backend/config/PaymentConfig.php` is included with sandbox credentials for bKash and SSLCommerz. Edit or replace with secure credentials in production.

Notes:
- These endpoints are minimal for local testing. They do not perform real payment processing.
- For production, implement proper validation, secrets storage, and secure callbacks/webhooks.

Frontend configuration:
- In your React app, set `REACT_APP_API_URL` to point to this PHP backend (for example `http://localhost:8000`).
- Example (Windows PowerShell): `setx REACT_APP_API_URL "http://localhost:8000"` and restart your dev server.

