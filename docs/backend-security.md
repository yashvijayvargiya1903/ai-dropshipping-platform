# Backend Security Checklist

- Never store plaintext passwords in production.
- Replace development memory storage with durable PostgreSQL.
- Keep payment/webhook secrets outside Git.
- Validate request bodies server-side.
- Rate-limit authentication and sensitive endpoints.
- Restrict CORS to deployed origins.
- Use secure HttpOnly cookies or short-lived rotated tokens.
- Verify payment webhook signatures before changing payment state.
- Audit security-sensitive actions.
