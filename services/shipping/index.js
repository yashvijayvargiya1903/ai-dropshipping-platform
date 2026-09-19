export const SHIPPING_NOT_SUPPORTED="SHIPPING_NOT_SUPPORTED";

export class ShippingAdapter {
  constructor(provider=null){ this.provider=provider; }
  async createShipment(){ throw new Error(SHIPPING_NOT_SUPPORTED); }
  async getTracking(){ throw new Error(SHIPPING_NOT_SUPPORTED); }
  async cancelShipment(){ throw new Error(SHIPPING_NOT_SUPPORTED); }
  async createReturnShipment(){ throw new Error(SHIPPING_NOT_SUPPORTED); }
}

export function normalizeTracking(provider,payload={}) {
  return {
    provider,
    tracking_id: payload.tracking_id ?? payload.awb ?? payload.awb_number ?? null,
    carrier: payload.carrier ?? provider ?? null,
    status: payload.status ?? "UNKNOWN",
    tracking_url: payload.tracking_url ?? null,
    raw: payload
  };
}
