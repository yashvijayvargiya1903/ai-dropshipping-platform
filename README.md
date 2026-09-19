# AI Dropshipping Platform

India-first automated ecommerce platform with a premium customer storefront, owner dashboard and provider-neutral fulfillment automation.

## Current build rule
**Cashfree is deliberately the final phase.** All non-payment commerce, operations, automation, AI-support and launch-readiness work is built and tested before payment credentials are introduced.

## Built
- Customer storefront, cart, checkout and account/order history
- Supabase Auth + RLS data layer
- COD order flow and order lifecycle
- 101-product demo catalogue
- 45 demo customers and 120 demo orders
- Owner dashboard with Orders, Products, Customers, Returns/RTO, Analytics, Automation, Settings and Action Center
- Supplier adapter with authorized-provider boundary and manual fallback
- Provider-neutral shipping/tracking adapter
- Notification queue architecture
- Grounded support assistant with escalation
- Scheduled operations monitor every 10 minutes
- Customer policy pages
- GitHub Pages deployment workflow
- Security/RLS foundations

## Non-payment production integrations
The remaining external integrations use provider-neutral adapters so an authorized supplier, courier, messaging or AI provider can be connected without redesigning the core commerce system.

## Final payment phase
Cashfree will be activated only after non-payment QA is complete:
1. Merchant activation/credentials
2. Sandbox checkout
3. Signed webhook verification
4. Refund test
5. Production credentials
6. Production payment smoke test

Never expose secret keys in browser code or Git. Supplier automation must use only an authorized API or user-assisted workflow; no CAPTCHA bypass, anti-bot evasion, credential/session extraction or unauthorized scraping.
