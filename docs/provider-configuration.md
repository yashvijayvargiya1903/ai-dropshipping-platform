# Provider Configuration

Cashfree remains the final phase and is intentionally not configured here.

## Non-payment providers

The application is designed to accept these provider classes without changing commerce logic:
- Supplier fulfillment: authorized supplier API or user-assisted workflow
- Shipping: courier/aggregator tracking API
- Email: transactional email provider
- SMS: transactional SMS provider
- WhatsApp: WhatsApp Business provider
- AI: approved model/API provider

Credentials must be stored only in backend/Edge Function secrets. Never place secret keys in storefront JavaScript or commit them to Git.

## Fallback behavior

If a provider is unavailable:
- Supplier actions become owner Action Center tasks.
- Tracking remains order-based until an AWB/tracking ID exists.
- Notifications remain queued in the database.
- AI support escalates uncertain requests rather than inventing order facts.
- COD remains available while prepaid payment is deferred.

## Final phase

Only after all non-payment QA is complete should Cashfree credentials be added and the payment, webhook, refund and production smoke tests be run.
