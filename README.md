# DineFlow Backend

DineFlow is an AI-ready restaurant ordering and management backend for QR ordering, kitchen dashboards, admin analytics, inventory alerts, reservations, tables, PayHere payments, JWT auth, and Socket.IO realtime updates.

## Tech Stack

- Node.js
- Express.js
- MongoDB and Mongoose
- JWT authentication
- bcryptjs
- Socket.IO
- dotenv
- cors
- helmet
- morgan

## Setup

```bash
cd server
npm install
```

Create a local `.env` from `.env.example`:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update the required values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/dineflow
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
SERVICE_CHARGE_RATE=0.1
TAX_RATE=0.05
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_CURRENCY=LKR
PAYHERE_RETURN_URL=http://localhost:3000/payment/success
PAYHERE_CANCEL_URL=http://localhost:3000/payment/cancel
PAYHERE_NOTIFY_URL=http://localhost:5000/api/v1/payments/payhere/notify
```

Never commit `.env`.

## Run

Start MongoDB locally, then seed demo data:

```bash
npm run seed
```

Start the API in development mode:

```bash
npm run dev
```

Production start:

```bash
npm start
```

Health check:

```txt
GET http://localhost:5000/health
```

## Demo Users

After seeding:

- Admin: `admin@dineflow.local` / `Admin12345`
- Kitchen: `kitchen@dineflow.local` / `Kitchen12345`
- Customer: `customer@dineflow.local` / `Customer12345`

## Frontend Connection

Use these frontend environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Send authenticated API requests with:

```txt
Authorization: Bearer <jwt-token>
```

## API Endpoints

Base URL:

```txt
http://localhost:5000/api/v1
```

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Menu:

- `GET /menu`
- `GET /menu/:id`
- `POST /menu` admin only
- `PATCH /menu/:id` admin only
- `DELETE /menu/:id` admin only

Menu filters:

```txt
GET /menu?category=Kottu&search=chicken&featured=true&inventoryStatus=in-stock&page=1&limit=12
```

Orders:

- `POST /orders`
- `GET /orders`
- `GET /orders/my`
- `GET /orders/:id`
- `PATCH /orders/:id/status`

Order statuses:

```txt
new, preparing, ready, completed, cancelled
```

Inventory:

- `GET /inventory`
- `GET /inventory/alerts`
- `POST /inventory` admin only
- `PATCH /inventory/:id` admin only

Analytics:

- `GET /analytics?range=7d`
- Supported ranges: `7d`, `30d`, `90d`

Payments:

- `POST /payments/payhere/init`
- `POST /payments/payhere/notify`
- `POST /payments/success`
- `POST /payments/failure`

Recommendations:

- `POST /recommendations`

Reservations:

- `POST /reservations`
- `GET /reservations`
- `PATCH /reservations/:id`

Tables:

- `GET /tables`
- `POST /tables` admin only
- `PATCH /tables/:id` admin only

## Socket.IO

Connect to:

```txt
http://localhost:5000
```

Join rooms:

- `join:admin`
- `join:kitchen`
- `join:customer` with customer id
- `join:order` with order id

Realtime events:

- `new-order`
- `order-updated`
- `kitchen-update`
- `inventory-alert`

Legacy aliases are also emitted for compatibility:

- `order:new`
- `order:update`
- `kitchen:update`
- `inventory:alert`

## Response Shape

Successful responses use:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

For frontend compatibility, important payload keys such as `token`, `user`, `items`, `orders`, or `analytics` are also exposed at the top level.

Errors use:

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Deployment Guide

1. Create a production MongoDB database.
2. Set all environment variables in the hosting platform.
3. Use a strong `JWT_SECRET`.
4. Set `CLIENT_URL` to the deployed frontend origin.
5. Set PayHere production merchant values and callback URLs.
6. Run `npm install --omit=dev`.
7. Start with `npm start`.
8. Ensure the platform supports WebSockets for Socket.IO.

## Useful Scripts

```bash
npm run dev
npm start
npm run seed
npm test
```

## Future Improvements

- Add request schema validation with Joi or Zod.
- Add refresh tokens and token revocation.
- Add rate limiting and request audit logs.
- Add full automated integration tests.
- Add OpenAI-powered recommendation ranking.
- Add Docker and CI/CD deployment workflows.
