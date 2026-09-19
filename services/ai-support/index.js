const intents=[
  {key:"track",terms:["track","tracking","where","shipped"],reply:"I can help with your order status. Please share your order number."},
  {key:"cancel",terms:["cancel","cancellation"],reply:"I can help with cancellation. Please share your order number; cancellation is subject to the current order status."},
  {key:"return",terms:["return","exchange","replace"],reply:"I can help with a return or exchange. Please share your order number and the reason."},
  {key:"refund",terms:["refund","money back"],reply:"I can check refund status once you share your order number."},
  {key:"shipping",terms:["delivery","deliver","shipping"],reply:"Delivery timing depends on the shipment status and carrier. Share your order number and I can check it."}
];

export function classifyMessage(message=""){
  const text=message.toLowerCase();
  return intents.find(i=>i.terms.some(t=>text.includes(t)))?.key || "unknown";
}

export function answerFromOrderData(message,order){
  if(!order) return {confidence:"low",reply:"I couldn't find that order. Please check the order number and try again.",escalate:true};
  const intent=classifyMessage(message);
  if(intent==="track"||intent==="shipping"){
    return {confidence:"high",reply:`Order ${order.order_number} is currently ${String(order.status).replaceAll("_"," ").toLowerCase()}.`,escalate:false};
  }
  if(intent==="cancel"){
    const allowed=["PLACED","PENDING","PROCESSING"].includes(order.status);
    return {confidence:"high",reply:allowed?"Your order is still in a cancellable stage. I can submit the cancellation request.":"This order is no longer in the normal cancellation window, so it needs manual review.",escalate:!allowed};
  }
  if(intent==="return"){
    const allowed=["DELIVERED","IN_TRANSIT","OUT_FOR_DELIVERY"].includes(order.status);
    return {confidence:"medium",reply:allowed?"A return request can be started for this order.":"This order needs manual review before a return can be started.",escalate:!allowed};
  }
  if(intent==="refund"){
    return {confidence:"medium",reply:`The current order status is ${String(order.status).replaceAll("_"," ").toLowerCase()}. Refund status should be checked against the payment record.`,escalate:true};
  }
  return {confidence:"low",reply:"I want to make sure I give you a correct answer. I'll route this to support.",escalate:true};
}
