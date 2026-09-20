import { supabase } from "./supabase.js";
const cart=JSON.parse(localStorage.getItem("drop-cart")||"[]");
const money=n=>"₹"+Number(n).toLocaleString("en-IN"), el=s=>document.querySelector(s);
el("#items").innerHTML=cart.length?cart.map(p=>`<div class="sum"><span>${p.n}</span><b>${money(p.p)}</b></div>`).join(""):"<p>Your cart is empty.</p>";
let total=cart.reduce((s,p)=>s+Number(p.p),0);el("#total").textContent="Total "+money(total);
async function token(){const {data:{session}}=await supabase.auth.getSession();return session?.access_token||null}
async function verifyReturn(){const id=new URLSearchParams(location.search).get("cashfree_order_id");if(!id)return;const t=await token();if(!t)return;const r=await fetch("https://dpiecktmpduhlapnkwvq.supabase.co/functions/v1/cashfree-payments?order_id="+encodeURIComponent(id),{headers:{Authorization:"Bearer "+t}});const d=await r.json();if(d.paid){localStorage.removeItem("drop-cart");el("#done").innerHTML=`<div class="success"><b>Payment successful · ${d.order_number}</b><span>Your payment was verified server-side and your order is confirmed.</span><a href="./index.html">Continue shopping</a></div>`;el("#form").style.display="none"}else el("#done").innerHTML="<div class=\"success\"><b>Payment status: pending</b><span>We are verifying the payment. Please refresh in a few seconds.</span></div>"}
verifyReturn();
el("#form").onsubmit=async e=>{
  e.preventDefault();
  if(!cart.length)return alert("Add a product first.");
  const {data:{user}}=await supabase.auth.getUser();if(!user){location.href="./auth.html";return}
  // Re-read product prices and stock from Supabase. Never trust localStorage prices for an order total.
  const ids=[...new Set(cart.map(p=>p.id))];
  const {data:live,error:liveError}=await supabase.from("products").select("id,name,selling_price,inventory_qty,active").in("id",ids);
  if(liveError)return alert(liveError.message);
  const byId=new Map((live||[]).map(p=>[p.id,p]));
  const lines=[];for(const item of cart){const p=byId.get(item.id);if(!p||!p.active)return alert("One of the products is no longer available.");if(Number(p.inventory_qty||0)<1)return alert(`${p.name} is currently out of stock.`);lines.push({product_id:p.id,quantity:1,unit_price:Number(p.selling_price)})}
  total=lines.reduce((s,x)=>s+x.unit_price*x.quantity,0);el("#total").textContent="Total "+money(total);
  const f=new FormData(e.target),payment=f.get("payment");
  const cp={user_id:user.id,name:f.get("name"),mobile:f.get("mobile"),email:user.email};
  let {data:customer,error}=await supabase.from("customers").select("id").eq("user_id",user.id).maybeSingle();
  if(error)return alert(error.message);
  if(!customer){const r=await supabase.from("customers").insert(cp).select("id").single();if(r.error)return alert(r.error.message);customer=r.data}
  else {await supabase.from("customers").update({name:cp.name,mobile:cp.mobile,email:cp.email}).eq("id",customer.id)}
  const order={order_number:"DRP-"+Date.now().toString().slice(-8),customer_id:customer.id,status:payment==="COD"?"COD_CONFIRMED":"PENDING_PAYMENT",payment_method:payment,payment_status:"PENDING",subtotal:total,shipping:0,total,shipping_address:{name:f.get("name"),mobile:f.get("mobile"),address:f.get("address"),city:f.get("city"),state:f.get("state"),pincode:f.get("pincode")}};
  const o=await supabase.from("orders").insert(order).select("id,order_number").single();if(o.error)return alert(o.error.message);
  const oi=await supabase.from("order_items").insert(lines.map(x=>({order_id:o.data.id,...x})));if(oi.error)return alert(oi.error.message);
  if(payment==="COD"){localStorage.removeItem("drop-cart");el("#done").innerHTML=`<div class="success"><b>Order placed · ${o.data.order_number}</b><span>Cash on Delivery selected. We’ll confirm the order shortly.</span><a href="./index.html">Continue shopping</a></div>`;e.target.style.display="none";return}
  const t=await token();if(!t)return location.href="./auth.html";
  const r=await fetch("https://dpiecktmpduhlapnkwvq.supabase.co/functions/v1/cashfree-payments",{method:"POST",headers:{Authorization:"Bearer "+t,"Content-Type":"application/json"},body:JSON.stringify({order_id:o.data.id,origin:location.origin})});
  const g=await r.json();if(!r.ok)return alert(g.error||"Unable to start payment. Please try again.");
  if(!g.payment_session_id)return alert("Cashfree did not return a payment session.");
  const cashfree=Cashfree({mode:g.environment==="production"?"production":"sandbox"});cashfree.checkout({paymentSessionId:g.payment_session_id,redirectTarget:"_self"})
};