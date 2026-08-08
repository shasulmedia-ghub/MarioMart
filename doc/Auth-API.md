# MarioMart — Auth API Documentation

**Base URL:** `http://localhost:5000/api/auth`

All request/response bodies are JSON. Protected routes require a JWT sent as:

```
Authorization: Bearer <token>
```

---

## 1. Register

Create a new user account.

- **Endpoint:** `POST /api/auth/register`
- **Access:** Public

### Request body

| Field    | Type   | Rules                         |
| -------- | ------ | ----------------------------- |
| name     | string | required                      |
| email    | string | required, valid email, unique |
| password | string | required, min 6 characters    |

```json
{
  "name": "Mario Rossi",
  "email": "mario@mariomart.com",
  "password": "password123"
}
```

### Success response — `201 Created`

```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f1a2...",
    "name": "Mario Rossi",
    "email": "mario@mariomart.com",
    "role": "customer",
    "createdAt": "2026-07-22T08:00:00.000Z"
  }
}
```

### Error responses

| Status | Cause                                                       |
| ------ | ----------------------------------------------------------- |
| 400    | Validation failed (bad email, short password, missing name) |
| 409    | Email already registered                                    |
| 500    | Unexpected server error                                     |

---

## 2. Login

Authenticate an existing user and receive a JWT.

- **Endpoint:** `POST /api/auth/login`
- **Access:** Public

### Request body

```json
{
  "email": "mario@mariomart.com",
  "password": "password123"
}
```

### Success response — `200 OK`

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f1a2...",
    "name": "Mario Rossi",
    "email": "mario@mariomart.com",
    "role": "customer",
    "createdAt": "2026-07-22T08:00:00.000Z"
  }
}
```

### Error responses

| Status | Cause                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------- |
| 400    | Validation failed (missing/invalid fields)                                                     |
| 401    | Invalid email or password (generic message on purpose, to avoid leaking which field was wrong) |
| 500    | Unexpected server error                                                                        |

---

## 3. Get current user

Returns the profile of the currently authenticated user. Used by the frontend
on page load to restore a session, and by the Dashboard to display account
details.

- **Endpoint:** `GET /api/auth/me`
- **Access:** Private (JWT required)

### Success response — `200 OK`

```json
{
  "user": {
    "id": "64f1a2...",
    "name": "Mario Rossi",
    "email": "mario@mariomart.com",
    "role": "customer",
    "createdAt": "2026-07-22T08:00:00.000Z"
  }
}
```

### Error responses

| Status | Cause                                                                 |
| ------ | --------------------------------------------------------------------- |
| 401    | Missing token / invalid token / expired token / user no longer exists |

---

## 4. Logout

Invalidates the session on the client. Since JWTs are stateless, the token
itself isn't destroyed server-side; the frontend discards it. This endpoint
exists to keep client logic consistent and as an extension point for future
token-blacklisting.

- **Endpoint:** `POST /api/auth/logout`
- **Access:** Private (JWT required)

### Success response — `200 OK`

```json
{ "message": "Logged out successfully" }
```

---

## Security notes

- Passwords are hashed with **bcrypt** (10 salt rounds) before being stored;
  the plaintext password is never persisted or logged.
- The `password` field has `select: false` in the Mongoose schema, so it is
  excluded from query results by default — it must be explicitly selected
  (only done in the login handler).
- JWTs are signed with `JWT_SECRET` and expire based on `JWT_EXPIRES_IN`
  (default `1d`). Store the secret in `.env`, never commit it.
- Protected routes use the `protect` middleware (`middleware/auth.js`), which
  verifies the token and attaches `req.user`.
- An `authorize(...roles)` middleware is available to restrict routes to
  specific roles (e.g. `admin`) for future use by other modules (Products,
  Orders).

## Error format reference

Validation errors (400) follow `express-validator`'s shape:

```json
{
  "errors": [
    { "msg": "A valid email is required", "param": "email", "location": "body" }
  ]
}
```

All other errors return `{ "message": "..." }`.
