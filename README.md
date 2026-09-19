# AI Dropshipping Platform

India-first automated ecommerce platform with a premium customer storefront, owner dashboard and provider-neutral fulfillment automation.

## Current strategy
**Payment gateway is intentionally deferred until the final phase.** COD is the active checkout mode while commerce, operations, supplier and automation layers are completed.

## Architecture
- `apps/storefront` — customer shopping experience
- `apps/admin` — owner operations dashboard
- `services/supplier-adapter` — authorized supplier integration boundary
- `services/payment` — reserved for final Cashfree integration
- `docs/` — automation and launch plan

## Launch sequence
1. Commerce UX and order lifecycle
2. Supplier/fulfillment automation
3. Tracking, returns, RTO and notifications
4. Admin analytics and AI support
5. Security + end-to-end QA
6. Cashfree payment integration and production launch

Cashfree's current web flow uses server-side order creation, JS checkout, server-side payment verification and signed webhooks; we will activate it only in the final phase.