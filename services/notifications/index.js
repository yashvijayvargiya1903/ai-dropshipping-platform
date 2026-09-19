export const CHANNELS=["email","sms","whatsapp","in_app"];

export function buildOrderNotification({channel,type,orderNumber,status}) {
  const messages={
    ORDER_PLACED:["Order received",`We've received order ${orderNumber}.`],
    ORDER_CONFIRMED:["Order confirmed",`Your order ${orderNumber} is confirmed.`],
    SHIPPED:["Order shipped",`Your order ${orderNumber} has shipped.`],
    OUT_FOR_DELIVERY:["Out for delivery",`Your order ${orderNumber} is out for delivery.`],
    DELIVERED:["Order delivered",`Your order ${orderNumber} has been delivered.`],
    RETURN_REQUESTED:["Return request received",`We've received the return request for ${orderNumber}.`],
    REFUNDED:["Refund processed",`Your refund for ${orderNumber} has been processed.`]
  };
  const [title,body]=messages[type]||["Order update",`Order ${orderNumber} is now ${status||"updated"}.`];
  return {channel,type,title,body};
}

export function queueNotification(dbRow){
  if(!dbRow?.channel || !CHANNELS.includes(dbRow.channel)) throw new Error("Unsupported notification channel");
  return {...dbRow,status:"QUEUED"};
}
