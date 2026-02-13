# E-commerce App Workspace

This workspace contains a working full-stack e-commerce demo.

## Structure

- `client/` React + Vite frontend
- `server/` Node + Express backend

## Prerequisite

Install Node.js LTS first (includes npm): https://nodejs.org

After install, verify:

```powershell
node -v
npm -v
```

## Run Backend

```powershell
cd server
npm install
copy .env.example .env
npm run dev
```

Backend health check:

- `http://localhost:5000/api/health`

## Run Frontend

In a new terminal:

```powershell
cd client
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Implemented APIs

- Health: `GET /api/health`
- Auth:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Products:
  - `GET /api/products`
  - `GET /api/products/:id`
- Cart (auth required):
  - `GET /api/cart`
  - `POST /api/cart/items`
  - `PATCH /api/cart/items/:productId`
  - `DELETE /api/cart/items/:productId`
  - `DELETE /api/cart`
- Orders (auth required):
  - `GET /api/orders`
  - `POST /api/orders/checkout`
  - `GET /api/orders/:id`
- Admin products (admin auth required):
  - `GET /api/admin/products`
  - `POST /api/admin/products`
  - `PATCH /api/admin/products/:id`
  - `DELETE /api/admin/products/:id`

## Demo Admin Account

- Email: `admin@example.com`
- Password: `admin123`
