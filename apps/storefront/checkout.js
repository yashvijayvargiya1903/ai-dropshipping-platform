import { supabase } from "./supabase.js";
let cart=[];try{const saved=JSON.parse(localStorage.getItem("drop-cart")||"[]");cart=Array.isArray(saved)?saved.filter(p=>p&&typeof p.id==="string"&&Number.isFinite(Number(p.p))&&Number(p.p)>=0&&Number.isFinite(Number(p.qty))&&Number(p.qty)>0):[]}catch{cart=[]}
const money=n=>"₹"+Number(n).toLocaleString("en-IN"), el=s=>document.querySelector(s);
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
el("#items").innerHTML=cart.length?cart.map(p=>`<div class="sum"><span>${escapeHTML(p.n)} × ${Number(p.qty)||1}</span><b>${money(Number(p.p)*(Number(p.qty)||1))}</b></div>`).join(""):"<p>Your cart is empty.</p>";
let total=cart.reduce((s,p)=>s+Number(p.p)*(Number(p.qty)||1),0);el("#total").textContent="Total "+money(total);
async function token(){const {data:{session}}=await supabase.auth.getSession();return session?.access_token||null}
async function verifyReturn(){const id=new URLSearchParams(location.search).get("cashfree_order_id");if(!id)return;const t=await token();if(!t)return;const r=await fetch("https://dpiecktmpduhlapnkwvq.supabase.co/functions/v1/cashfree-payments?order_id="+encodeURIComponent(id),{headers:{Authorization:"Bearer "+t}});const d=await r.json();if(d.paid){localStorage.removeItem("drop-cart");el("#done").innerHTML=`<div class="success"><b>Payment successful · ${d.order_number}</b><span>Your payment was verified server-side and your order is confirmed.</span><a href="./index.html">Continue shopping</a></div>`;el("#form").style.display="none"}else el("#done").innerHTML="<div class=\"success\"><b>Payment status: pending</b><span>We are verifying the payment. Please refresh in a few seconds.</span></div>"}
verifyReturn();
el("#form").onsubmit=async e=>{
  e.preventDefault();
  const submit=el('#form button[type="submit"]');
  if(submit.disabled)return;
  submit.disabled=true;const originalLabel=submit.textContent;submit.textContent="Please wait…";
  try{
  if(!cart.length)return alert("Add a product first.");
  const {data:{user}}=await supabase.auth.getUser();if(!user){location.href="./auth.html";return}
  // Re-read product prices and stock from Supabase. Never trust localStorage prices for an order total.
  const ids=[...new Set(cart.map(p=>p.id))];
  const {data:live,error:liveError}=await supabase.from("products").select("id,name,selling_price,inventory_qty,active").in("id",ids);
  if(liveError)return alert(liveError.message);
  const byId=new Map((live||[]).map(p=>[p.id,p]));
  const lines=[];for(const item of cart){const p=byId.get(item.id);if(!p||!p.active)return alert("One of the products is no longer available.");const qty=Math.max(1,Number(item.qty)||1);if(Number(p.inventory_qty||0)<qty)return alert(`${p.name} has only ${Number(p.inventory_qty||0)} available. Please reduce the quantity.`);lines.push({product_id:p.id,quantity:qty,unit_price:Number(p.selling_price)})}
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
  const cashfree=Cashfree({mode:g.environment==="production"?"production":"sandbox"});cashfree.checkout({paymentSessionId:g.payment_session_id,redirectTarget:"_self"})  }catch(error){alert(error?.message||"Something went wrong. Please try again.");}
  finally{if(el("#form").style.display!=="none"){submit.disabled=false;submit.textContent=originalLabel}}
};