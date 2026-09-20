# Trendskartco — Automated Ecommerce Platform

India-first automated ecommerce platform with a premium customer storefront, owner dashboard and provider-neutral operations automation.

## Build rule
**Cashfree is deliberately the final phase.** All non-payment application work is completed before payment credentials are introduced.

## Completed
- Premium Trendskartco customer storefront, cart, account and checkout
- Supabase Auth + RLS data layer
- COD order flow and order lifecycle
- Authoritative checkout price/stock validation
- 101-product catalogue
- 45 demo customers and 120 demo orders
- Owner dashboard with Orders, Products, Customers, Returns/RTO, Analytics, Automation, Settings and Action Center
- Owner/admin route guard with authenticated redirect and live Supabase order management
- Admin product creation, price editing, inventory editing and activation controls
- Supplier adapter with authorized-provider boundary and safe manual fallback
- Provider-neutral shipping/tracking adapter
- Notification queue architecture for email, SMS, WhatsApp and in-app delivery
- Grounded support assistant with escalation
- Scheduled operations monitor every 10 minutes
- Shipping/returns/refund, privacy and terms foundation pages
- GitHub Pages deployment workflow with custom-domain artifact
- Smoke QA workflow and production-readiness documentation
- Security/RLS foundations and payment-event idempotency model

## External activation boundaries
The application is structured so authorized supplier, courier, messaging and AI providers can be added without redesigning the core system. Provider credentials are intentionally not hardcoded into the repository.

Supplier automation must use only an authorized API or user-assisted workflow. No CAPTCHA bypass, anti-bot evasion, credential/session extraction or unauthorized scraping.

## Final payment phase — Cashfree
Only after the non-payment build is ready:
1. Merchant activation and credentials
2. Sandbox checkout
3. Signed webhook verification
4. Refund test
5. Production credentials
6. Production payment smoke test

Never expose secret keys in browser code or Git.
