Running the example backend:

1. cd server
2. npm install
3. npm start

The server listens on port 5000 by default and exposes:
- GET /api/buses
- POST /api/book

In development, set `REACT_APP_API_URL=http://localhost:5000` or add `"proxy": "http://localhost:5000"` to the React app `package.json` for CRA proxying.

Database schema
---------------
A SQL schema for payment integration (bKash + SSLCommerz) is included at `server/payments_schema.sql`.

To apply the schema to a local MySQL server:

1) Create a database and import with the MySQL CLI:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS khulna_travels;"
mysql -u root -p khulna_travels < server/payments_schema.sql
```

2) Alternatively, using Docker (uses `mysql:8` image):

```bash
# run a temporary mysql container and import the SQL
docker run --rm -v %cd%/server:/sql -e MYSQL_ROOT_PASSWORD=secret mysql:8 \
  bash -c "mysql -uroot -p$MYSQL_ROOT_PASSWORD -e 'CREATE DATABASE IF NOT EXISTS khulna_travels; USE khulna_travels; source /sql/payments_schema.sql;'"
```

Note: Adjust credentials and paths for your environment. In production, store gateway credentials securely (not in plaintext SQL).