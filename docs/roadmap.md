# Build Roadmap

## Phase A — Commerce foundation
- [x] Storefront foundation
- [x] Product catalogue/search/filter foundation
- [x] Cart
- [x] COD checkout
- [x] Supabase Auth/data layer
- [x] Owner dashboard foundation
- [x] Customer account/auth surface
- [x] Customer policy surface

## Phase B — Operations foundation
- [x] Supplier adapter boundary
- [x] Supplier manual fallback/action boundary
- [x] Supplier-order data model
- [x] Order event timeline
- [x] Action Center data model
- [x] Return/RTO workflow data model
- [x] Customer notification data model
- [x] Product/inventory sync run model
- [x] Automated stale-order monitoring
- [x] Scheduled operations monitor
- [x] Provider-neutral shipping/tracking adapter
- [x] Admin Orders, Products, Customers, Returns, Analytics, Automation and Settings surfaces
- [x] Demo catalogue: 101 products, 45 customers, 120 orders

## Phase C — Production integrations and launch readiness
- [ ] Connect an authorized supplier fulfillment API/workflow
- [ ] Connect a live shipment/tracking provider
- [ ] Connect transactional email/WhatsApp/SMS providers
- [ ] Connect an approved AI model provider to the grounded support service
- [ ] Configure production domain + Supabase Auth redirects
- [x] Legal/policy foundation pages
- [ ] Final security/performance cleanup
- [ ] End-to-end QA, mobile QA and load testing

## Phase D — FINAL PAYMENT PHASE
**Do not start this phase until Phase C is complete.**
- [ ] Cashfree merchant account/activation
- [ ] Cashfree sandbox credentials
- [ ] Sandbox payment test
- [ ] Signed webhook test
- [ ] Refund test
- [ ] Production credentials
- [ ] Production payment smoke test
- [ ] Final launch verification

## Operating rule
The build should proceed through every non-payment item without repeatedly waiting for user confirmation. External credentials/accounts are only introduced when the platform reaches the relevant integration phase.

Supplier automation must use only an authorized integration or user-assisted workflow. No CAPTCHA bypass, anti-bot evasion, credential/session extraction, or unauthorized scraping.
