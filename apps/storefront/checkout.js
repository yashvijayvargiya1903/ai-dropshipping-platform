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
  const {data:live,error:liveError}=await supabase.from("products").select("id,name,selling_price,inventory_qty,active,category_id").in("id",ids);
  if(liveError)return alert(liveError.message);
  const byId=new Map((live||[]).map(p=>[p.id,p]));
  let sales=[];try{const sr=await supabase.from("site_discounts").select("discount_type,discount_value,scope,category_id,starts_at,ends_at").eq("active",true);if(!sr.error)sales=sr.data||[]}catch{}\n  const lines=[];for(const item of cart){const p=byId.get(item.id);if(!p||!p.active)return alert("One of the products is no longer available.");const qty=Math.max(1,Number(item.qty)||1);if(Number(p.inventory_qty||0)<qty)return alert(`${p.name} has only ${Number(p.inventory_qty||0)} available. Please reduce the quantity.`);const now=Date.now(),sale=sales.filter(d=>new Date(d.starts_at).getTime()<=now&&new Date(d.ends_at).getTime()>=now&&(d.scope==="all"||(d.scope==="category"&&d.category_id===p.category_id))).slice(-1)[0];const base=Number(p.selling_price),off=sale?Math.min(base,sale.discount_type==="percent"?base*Number(sale.discount_value)/100:Number(sale.discount_value)):0;lines.push({product_id:p.id,quantity:qty,unit_price:Math.round((base-off)*100)/100})}
  const subtotal=lines.reduce((s,x)=>s+x.unit_price*x.quantity,0);let discount=0,couponCode=(el("#coupon")?.value||"").trim().toUpperCase();if(couponCode){const cr=await supabase.from("coupons").select("code,discount_type,discount_value,scope,category_id,min_order_value,max_discount,expires_at,active").eq("code",couponCode).eq("active",true).maybeSingle();if(cr.error)return alert("Unable to verify coupon: "+cr.error.message);const c=cr.data;if(!c)return alert("Invalid or inactive coupon code.");if(c.expires_at&&c.expires_at<new Date().toISOString().slice(0,10))return alert("This coupon has expired.");if(c.scope==="minimum"&&subtotal<Number(c.min_order_value||0))return alert("Minimum order value for this coupon is ₹"+Number(c.min_order_value||0));let eligible=subtotal;if(c.scope==="category"){const catLines=lines.filter(x=>byId.get(x.product_id)?.category_id===c.category_id);eligible=catLines.reduce((s,x)=>s+x.unit_price*x.quantity,0);if(!eligible)return alert("This coupon does not apply to products in your cart.");}discount=c.discount_type==="percent"?eligible*Number(c.discount_value)/100:Math.min(eligible,Number(c.discount_value));if(c.max_discount!=null)discount=Math.min(discount,Number(c.max_discount));discount=Math.min(subtotal,Math.round(discount*100)/100);}total=Math.max(0,subtotal-discount);el("#total").textContent="Total "+money(total)+(discount?" (you save "+money(discount)+")":"");
  const f=new FormData(e.target),payment=f.get("payment");
  const cp={user_id:user.id,name:f.get("name"),mobile:f.get("mobile"),email:user.email};
  let {data:customer,error}=await supabase.from("customers").select("id").eq("user_id",user.id).maybeSingle();
  if(error)return alert(error.message);
  if(!customer){const r=await supabase.from("customers").insert(cp).select("id").single();if(r.error)return alert(r.error.message);customer=r.data}
  else {await supabase.from("customers").update({name:cp.name,mobile:cp.mobile,email:cp.email}).eq("id",customer.id)}
  const order={order_number:"DRP-"+Date.now().toString().slice(-8),customer_id:customer.id,status:payment==="COD"?"COD_CONFIRMED":"PENDING_PAYMENT",payment_method:payment,payment_status:"PENDING",subtotal,discount,coupon_code:couponCode||null,shipping:0,total,shipping_address:{name:f.get("name"),mobile:f.get("mobile"),address:f.get("address"),city:f.get("city"),state:f.get("state"),pincode:f.get("pincode")}};
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