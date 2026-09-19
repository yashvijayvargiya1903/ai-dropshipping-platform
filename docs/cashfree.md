# Cashfree Payment Gateway

The project uses Cashfree hosted web checkout with a server-side order creation and verification flow.

## Architecture

1. Storefront creates the order and order items in Supabase.
2. For prepaid orders, the browser calls the Supabase Edge Function `cashfree-payments`.
3. The function authenticates the customer, reads the authoritative order total from Supabase, and creates the Cashfree order server-side.
4. Cashfree returns a payment session ID; the browser opens Cashfree Checkout using the official JS SDK.
5. Cashfree sends signed webhooks to the same Edge Function.
6. The webhook signature is verified using HMAC-SHA256 over timestamp + raw request body, then payment/order state is updated idempotently.
7. On return, the storefront can also ask the server to fetch Cashfree payment status before treating the order as paid.

Cashfree's current web integration uses a server-created payment session and the JS SDK checkout flow. Cashfree also documents signed webhook verification and server-side payment-status checks. See the official developer material: https://www.cashfree.com/devstudio/preview/pg/web/checkout and https://www.cashfree.com/devstudio/preview/pg/tools/webhookVerification

## Supabase Edge Function secrets

Set these secrets in the Supabase Edge Function environment:

- `CASHFREE_APP_ID` — Cashfree App ID / Client ID.
- `CASHFREE_SECRET_KEY` — Cashfree secret key.
- `CASHFREE_ENV` — `sandbox` for testing or `production` for live payments.
- `CASHFREE_WEBHOOK_URL` — optional override. By default the function uses its own public URL.

Never commit Cashfree credentials to GitHub or expose them in storefront JavaScript.

The Edge Function already receives the normal Supabase runtime secrets needed to access the database. The function uses the service-role client only server-side.

## Going live

Start with Cashfree sandbox credentials and `CASHFREE_ENV=sandbox`. Run a complete test order, verify the payment webhook and return flow, then switch to production credentials and `CASHFREE_ENV=production`.

Cashfree's official docs currently show API version `2025-01-01` for the current create-order flow. The checkout SDK is loaded from Cashfree's official JS SDK URL.

## Important

A successful browser redirect is not treated as proof of payment. The application verifies payment status server-side and processes signed webhooks before marking an order paid.
