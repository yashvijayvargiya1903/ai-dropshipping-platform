# Architecture

## Core flow
Customer → Storefront → Cart → Checkout → Payment/COD → Order Engine → Supplier Adapter → Tracking Sync → Customer Timeline.

Owner → Admin Dashboard → Orders, Products, Customers, Analytics, Refunds, Automation and Settings.

## Principles
- Modular services with clear interfaces.
- Human approval for money movement, irreversible actions, and unsupported supplier operations.
- Supplier integrations are adapters; the commerce core does not depend on one marketplace.
- No secrets or credentials in source control.
