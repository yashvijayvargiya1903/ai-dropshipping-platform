# DROP API

Development API for authentication and product management.

Endpoints: GET /api/health, POST /api/auth/register, POST /api/auth/login, GET /api/me, GET /api/products, POST /api/products, PATCH /api/products/:id.

The current server uses in-memory storage for development. Production migration must use durable PostgreSQL/managed storage and secure password hashing, rate limiting, validation, secure cookies or short-lived tokens, restricted CORS, audit logging and secret management.