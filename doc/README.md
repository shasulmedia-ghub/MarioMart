# MarioMart

A 3-person team e-commerce project.

| Member | Scope |
|--------|-------|
| **Member 1** (this scaffold) | Frontend: Home, Login, Register, Dashboard, Navbar, Logout · Backend: Register/Login APIs, JWT, password hashing, protected routes · DB: Users · Testing: Auth · Docs: Auth API & User Flow |
| Member 2 | Frontend: Product list/details/search/filter, Admin page · Backend: Product CRUD/Search APIs · DB: Products, Categories · Testing: CRUD · Docs: Product API & ERD |
| Member 3 | Frontend: Cart, Checkout, Order Confirmation · Backend: Cart & Order APIs · DB: Cart, Orders, Order Items · Testing: Cart/Checkout · Docs: Order Flow |

## Structure

```
mariomart/
├── backend/           Express + MongoDB + JWT auth API
│   ├── config/db.js
│   ├── models/User.js
│   ├── middleware/auth.js
│   ├── routes/authRoutes.js
│   ├── tests/auth.test.js
│   └── server.js
├── frontend/          Vite + React
│   └── src/
│       ├── api/axios.js
│       ├── context/AuthContext.jsx
│       ├── components/{Navbar,ProtectedRoute}.jsx
│       └── pages/{Home,Login,Register,Dashboard}.jsx
└── docs/
    ├── Auth-API.md
    └── User-Flow.md
```

## Getting started

### Backend

```bash
cd backend
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev             # starts on http://localhost:5000
```

Requires a running MongoDB instance (local or Atlas) at the URI in `.env`.

### Frontend

```bash
cd frontend
cp .env.example .env    # points VITE_API_URL at the backend
npm install
npm run dev              # starts on http://localhost:5173
```

### Running Auth tests

```bash
cd backend
npm install               # includes mongodb-memory-server for isolated test DB
npm test
```

## Integration notes for Member 2 & Member 3

- The JWT issued by `/api/auth/login` and `/api/auth/register` is the same
  token your modules should require for any authenticated action (e.g.
  placing an order, admin-only product edits). Reuse `middleware/auth.js`'s
  `protect` (and `authorize("admin")` for admin-only routes).
- The `User` model (`backend/models/User.js`) is the single source of truth
  for user identity — reference `User._id` from your `Order`/`Cart` schemas
  rather than duplicating user fields.
- On the frontend, `useAuth()` (from `context/AuthContext.jsx`) exposes
  `user`, `isAuthenticated`, `login`, `register`, and `logout` — pull this
  into your Cart/Checkout/Product components instead of re-implementing auth
  state.
