# Supplier Adapter

The commerce system uses a provider-neutral supplier interface.

Suggested operations:
- searchProduct
- getProduct
- createFulfillmentOrder
- getOrderStatus
- cancelOrder
- createReturn
- createExchange
- getTracking

Unsupported operations return NOT_SUPPORTED and route to an owner action queue.

Only official APIs, authorized partner integrations, or explicitly permitted user-assisted workflows may be automated.
