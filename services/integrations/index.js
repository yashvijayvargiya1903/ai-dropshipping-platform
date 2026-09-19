export function providerStatus(config={}) {
  return {
    supplier: Boolean(config.SUPPLIER_PROVIDER),
    shipping: Boolean(config.SHIPPING_PROVIDER),
    email: Boolean(config.EMAIL_PROVIDER),
    sms: Boolean(config.SMS_PROVIDER),
    whatsapp: Boolean(config.WHATSAPP_PROVIDER),
    ai: Boolean(config.AI_PROVIDER),
    payment: Boolean(config.CASHFREE_ENV && config.CASHFREE_APP_ID && config.CASHFREE_SECRET_KEY)
  };
}

export function requireProvider(config,name) {
  if(!config?.[name]) throw new Error(`Provider ${name} is not configured`);
  return config[name];
}
