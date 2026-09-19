import { canTransition, transition } from "../order-engine/order-engine.js";
import { classifyMessage, answerFromOrderData } from "../ai-support/index.js";
import { normalizeTracking } from "../shipping/index.js";

export function runSmokeTests(){
  const order={status:"PAID",order_number:"TEST-001",audit:[]};
  const next=transition(order,"FULFILLMENT_PENDING","test");
  if(next.status!=="FULFILLMENT_PENDING") throw new Error("Order transition failed");
  if(!canTransition("SHIPPED","IN_TRANSIT")) throw new Error("Transition map failed");
  if(classifyMessage("where is my order")!=="track") throw new Error("AI intent classification failed");
  const answer=answerFromOrderData("track",next);
  if(!answer.reply || answer.escalate!==false) throw new Error("Grounded support failed");
  const tracking=normalizeTracking("test",{awb:"AWB-1",status:"SHIPPED"});
  if(tracking.tracking_id!=="AWB-1") throw new Error("Tracking normalization failed");
  return {ok:true};
}
