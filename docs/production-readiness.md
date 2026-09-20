# Production Readiness

Cashfree is intentionally excluded from this phase and remains the final payment activation step.

## Completed application work
- Customer storefront, cart and responsive navigation
- Supabase Auth/data layer with RLS
- COD checkout and order lifecycle
- Authoritative checkout price/stock validation against the database
- Owner dashboard, orders, products, customers, returns, analytics, automation and settings surfaces
- 101-product catalogue
- 45 demo customers and 120 demo orders
- Action Center, order events, returns/RTO and notifications data models
- Scheduled stale-order monitoring
- Supplier adapter boundary with manual fallback
- Provider-neutral shipping/tracking adapter
- Notification provider queue contract
- Grounded AI-support service boundary with escalation
- Legal/policy foundation pages
- GitHub Pages deployment workflow and custom-domain artifact
- Smoke-test workflow

## External integration readiness
The codebase is intentionally provider-neutral so credentials can be added without rewriting the application:
1. Supplier: activate only an authorized supplier API/workflow. Until then, supplier actions remain visible in the Action Center for user-assisted fulfillment.
2. Shipping: activate an approved tracking/shipping provider through the shipping adapter.
3. Messaging: activate approved email/SMS/WhatsApp providers against the notification queue.
4. AI support: connect an approved model provider to the grounded order-data service; unknown/high-risk questions must escalate.
5. Domain: GitHub Pages is configured with the trendskartco.in custom-domain artifact; DNS remains controlled by the domain provider.

## Final payment phase
Cashfree stays last:
- merchant activation
- sandbox credentials
- sandbox checkout
- signed webhook verification
- refund flow
- production credentials
- production payment smoke test

No supplier integration should bypass CAPTCHA, anti-bot controls, authentication controls or marketplace terms. No payment secret belongs in source control or the browser.
