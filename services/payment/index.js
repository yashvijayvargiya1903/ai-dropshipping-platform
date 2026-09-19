export const CASHFREE_API_BASE="https://api.cashfree.com/pg";
export class CashfreeGateway{
 constructor({clientId,clientSecret,apiVersion="2025-01-01"}={}){this.clientId=clientId;this.clientSecret=clientSecret;this.apiVersion=apiVersion}
 async createOrder({orderId,amount,currency="INR",customer}){if(!this.clientId||!this.clientSecret)throw new Error("CASHFREE_CREDENTIALS_NOT_CONFIGURED");return {provider:"cashfree",orderId,amount,currency,customer,status:"PENDING",requiresServerRequest:true}}
 async verifyWebhook(){throw new Error("IMPLEMENT_PROVIDER_SIGNATURE_VERIFICATION")}
 async refund({paymentId,refundId,amount}){if(!this.clientId||!this.clientSecret)throw new Error("CASHFREE_CREDENTIALS_NOT_CONFIGURED");return {provider:"cashfree",paymentId,refundId,amount,status:"PENDING",requiresServerRequest:true}}
}
export const supportedMethods=["UPI","CARD","NETBANKING","WALLET","COD"];
