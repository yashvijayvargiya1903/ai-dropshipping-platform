# Build Roadmap

## Phase A — Commerce foundation
- [x] Storefront foundation
- [x] Product catalogue/search/filter foundation
- [x] Cart
- [x] COD checkout
- [x] Supabase Auth/data layer
- [x] Owner dashboard foundation

## Phase B — Operations foundation
- [x] Supplier adapter boundary
- [x] Supplier-order data model
- [x] Order event timeline
- [x] Action Center data model
- [x] Return/RTO workflow data model
- [x] Customer notification data model
- [x] Product/inventory sync run model
- [x] Automated stale-order monitoring
- [x] Scheduled operations monitor (10-minute cadence)
- [x] Demo catalogue: 101 products, 45 customers, 120 orders

## Phase C — Remaining production integrations
- [ ] Connect an authorized supplier fulfillment API/workflow
- [ ] Live shipment/tracking provider
- [ ] Transactional email/WhatsApp/SMS provider
- [ ] AI support provider + grounded knowledge layer
- [ ] Production domain and deployment
- [ ] Final legal/policy pages
- [ ] End-to-end QA and load testing

## Phase D — FINAL PAYMENT PHASE
- [ ] Cashfree merchant credentials
- [ ] Sandbox payment test
- [ ] Signed webhook test
- [ ] Refund test
- [ ] Production credentials
- [ ] Production payment smoke test

## Important
Payment remains deliberately disabled/deferred until the rest of the platform is tested. Supplier automation must use only an authorized integration; no CAPTCHA bypass, anti-bot evasion, credential/session extraction, or unauthorized scraping.