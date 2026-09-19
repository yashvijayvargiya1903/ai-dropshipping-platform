import { supabase } from "./supabase.js";
const cart=JSON.parse(localStorage.getItem("drop-cart")||"[]");
const money=n=>"₹"+Number(n).toLocaleString("en-IN");
document.querySelector("#items").innerHTML=cart.length?cart.map(p=>`<div class="sum"><span>${p.n}</span><b>${money(p.p)}</b></div>`).join(""):"<p>Your cart is empty.</p>";
const total=cart.reduce((s,p)=>s+p.p,0);document.querySelector("#total").textContent="Total "+money(total);
document.querySelector("#form").onsubmit=async e=>{
 e.preventDefault();if(!cart.length)return alert("Add a product first.");
 const {data:{user}}=await supabase.auth.getUser();
 if(!user){location.href="./auth.html";return}
 const f=new FormData(e.target), payment=f.get("payment");
 const customerPayload={user_id:user.id,name:f.get("name"),mobile:f.get("mobile"),email:user.email};
 let {data:customer,error}=await supabase.from("customers").select("id").eq("user_id",user.id).maybeSingle();
 if(error)return alert(error.message);
 if(!customer){const r=await supabase.from("customers").insert(customerPayload).select("id").single();if(r.error)return alert(r.error.message);customer=r.data;}
 const orderNumber="DRP-"+Date.now().toString().slice(-8);
 const order={order_number:orderNumber,customer_id:customer.id,status:payment==="COD"?"COD_CONFIRMED":"PENDING_PAYMENT",payment_method:payment,payment_status:"PENDING",subtotal:total,shipping:0,total,shipping_address:{name:f.get("name"),mobile:f.get("mobile"),address:f.get("address"),city:f.get("city"),state:f.get("state"),pincode:f.get("pincode")}};
 const o=await supabase.from("orders").insert(order).select("id,order_number").single();
 if(o.error)return alert(o.error.message);
 const items=cart.map(p=>({order_id:o.data.id,product_id:p.id,quantity:1,unit_price:p.p}));
 const oi=await supabase.from("order_items").insert(items);
 if(oi.error)return alert(oi.error.message);
 localStorage.removeItem("drop-cart");
 document.querySelector("#done").innerHTML=`<div class="success"><b>Order created · ${o.data.order_number}</b><span>Your order is saved securely. Payment processing will be connected before accepting live prepaid orders.</span><a href="./index.html">Continue shopping</a></div>`;
 e.target.style.display="none";
};