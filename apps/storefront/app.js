import { supabase } from "./supabase.js";
let products=[]; let cart=JSON.parse(localStorage.getItem("drop-cart")||"[]");
const el=s=>document.querySelector(s);
const money=n=>"₹"+Number(n).toLocaleString("en-IN");

async function loadProducts(){
  const {data,error}=await supabase.from("products")
    .select("id,name,selling_price,image_url,inventory_qty,category:categories(name)")
    .eq("active",true).order("created_at",{ascending:false});
  if(error){console.error(error);products=[];el("#products").innerHTML="<p>Unable to load products right now.</p>";return;}
  products=(data||[]).map(p=>({id:p.id,n:p.name,p:Number(p.selling_price),e:"🛍️",img:p.image_url||"",stock:Number(p.inventory_qty??0),c:p.category?.name||"Other"}));
  render();
  renderCategories();
  save();
}
function render(list=products){
  el("#products").innerHTML=list.map(p=>'<article class="card"><div class="pic">'+(p.img?'<img src="'+p.img+'" alt="'+p.n+'" loading="lazy">':p.e)+'</div><div class="card-body"><h3>'+p.n+'</h3><div class="price">'+money(p.p)+'</div><button class="add" '+(p.stock===0?'disabled':'')+' onclick="add(\''+p.id+'\')">'+(p.stock===0?'Out of stock':'Add to cart')+'</button></div></article>').join("")||"<p>No products found.</p>";
}
function renderCategories(){
  const wrap=el("#categoryChips"); if(!wrap)return;
  const cats=[...new Set(products.map(p=>p.c).filter(Boolean))].slice(0,8);
  wrap.innerHTML=cats.map(c=>'<button data-category="'+c+'">'+c+'</button>').join("");
  document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".chips button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    const cat=b.dataset.category;
    render(cat==="all"?products:products.filter(p=>p.c===cat));
  });
}
window.add=id=>{const p=products.find(x=>x.id===id);if(p&&p.stock!==0){cart.push(p);save();openCart()}};
function save(){
  localStorage.setItem("drop-cart",JSON.stringify(cart));
  el("#cartCount").textContent=cart.length;
  el("#cartItems").innerHTML=cart.length?cart.map((p,i)=>'<div class="item"><div class="mini">'+(p.img?'<img src="'+p.img+'" alt="">':p.e)+'</div><div><b>'+p.n+'</b><div>'+money(p.p)+'</div></div><button onclick="removeItem('+i+')">×</button></div>').join(""):"<p>Your cart is empty.</p>";
  el("#cartTotal").textContent=money(cart.reduce((s,p)=>s+p.p,0));
}
window.removeItem=i=>{cart.splice(i,1);save()};
window.openCart=()=>{el("#drawer").classList.add("open");el("#overlay").classList.add("open")};
window.closeCart=()=>{el("#drawer").classList.remove("open");el("#overlay").classList.remove("open")};
window.checkout=()=>location.href="./checkout.html";
window.trackOrder=async()=>{
  const id=el("#orderId").value.trim(); if(!id){el("#trackResult").textContent="Please enter an order ID.";return}
  const {data,error}=await supabase.from("orders").select("order_number,status,shipments(tracking_id,carrier,status)").eq("order_number",id).maybeSingle();
  el("#trackResult").textContent=error?"Unable to check order.":data?("Order "+data.order_number+" · "+data.status+(data.shipments?.[0]?.tracking_id?" · Tracking "+data.shipments[0].tracking_id:"")):"Order not found.";
};
el("#cartBtn").onclick=openCart;
el("#search").oninput=e=>{const q=e.target.value.toLowerCase();render(products.filter(p=>p.n.toLowerCase().includes(q)))};
loadProducts();