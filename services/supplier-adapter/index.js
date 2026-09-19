export const NOT_SUPPORTED="NOT_SUPPORTED";

export class SupplierAdapter {
  constructor(provider="manual"){ this.provider=provider; }
  async searchProduct(){ return []; }
  async getProduct(){ throw new Error(NOT_SUPPORTED); }
  async createFulfillmentOrder(input){
    throw Object.assign(new Error("Supplier fulfillment provider is not configured"),{code:NOT_SUPPORTED,action:"SUPPLIER_FULFILLMENT_REQUIRED",input});
  }
  async getOrderStatus(){ throw new Error(NOT_SUPPORTED); }
  async cancelOrder(){ throw new Error(NOT_SUPPORTED); }
  async createReturn(){ throw new Error(NOT_SUPPORTED); }
  async createExchange(){ throw new Error(NOT_SUPPORTED); }
  async getTracking(){ throw new Error(NOT_SUPPORTED); }
}

export async function executeWithFallback(adapter,operation,input,{onManualRequired}={}) {
  try { return await adapter[operation](input); }
  catch(error) {
    if(error?.code!==NOT_SUPPORTED && error?.message!==NOT_SUPPORTED) throw error;
    if(onManualRequired) await onManualRequired({operation,input,error});
    return {status:"MANUAL_ACTION_REQUIRED",operation,provider:adapter.provider||"manual"};
  }
}

export function validateAuthorizedProvider(provider) {
  if(!provider || typeof provider.createFulfillmentOrder!=="function")
    throw new Error("Only an authorized supplier adapter may be activated.");
  return provider;
}
