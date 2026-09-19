# Database setup

Set DATABASE_URL to a managed PostgreSQL connection string, then run npm install and npm run db:init from apps/api.

Never commit DATABASE_URL or database credentials. Production should use a secret manager and a restricted database role.

The repository now contains the PostgreSQL connection layer and schema. A hosted database itself cannot be provisioned until provider credentials/access are supplied.
