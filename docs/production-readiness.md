# Production Readiness

Cashfree is intentionally excluded from this phase and remains the final payment activation step.

## Completed foundation
- Customer storefront and cart
- Authentication and Supabase data layer
- COD checkout and order lifecycle
- Admin operations foundation
- 101-product demo catalogue
- 45 demo customers and 120 demo orders
- Action Center, order events, returns/RTO and notifications data models
- Scheduled stale-order monitoring
- Supplier adapter boundary
- Provider-neutral shipping adapter
- Grounded AI-support service boundary with escalation
- GitHub Pages deployment workflow

## Final non-payment work
1. Connect an authorized supplier API or user-assisted fulfillment workflow.
2. Connect a shipment/tracking provider.
3. Connect one or more transactional messaging providers.
4. Wire the AI support service to an approved model provider and the order database.
5. Publish legal pages and configure the production domain.
6. Run end-to-end QA, security review, mobile QA and load checks.
7. Activate Cashfree last: sandbox, webhook, refunds, production credentials and smoke test.

No supplier integration should bypass CAPTCHA, anti-bot controls, authentication controls or marketplace terms.
