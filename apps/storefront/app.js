import { supabase } from "./supabase.js";
let products=[]; const oldCart=JSON.parse(localStorage.getItem("drop-cart")||"[]"); let cart=oldCart.reduce((a,p)=>{const q=a.find(x=>x.id===p.id);if(q)q.qty+=(Number(p.qty)||1);else a.push({...p,qty:Math.max(1,Number(p.qty)||1)});return a},[]);
const PAGE_SIZE=10;
let currentCategory="all";
let currentPage=1;
let searchQuery="";
const el=s=>document.querySelector(s);
const money=n=>"₹"+Number(n).toLocaleString("en-IN");

async function loadProducts(){
  const {data,error}=await supabase.from("products")
    .select("id,name,selling_price,image_url,inventory_qty,category:categories(name)")
    .eq("active",true).order("created_at",{ascending:false});
  if(error){console.error(error);products=[];el("#products").innerHTML="<p>Unable to load products right now.</p>";return;}
  products=(data||[]).map(p=>({id:p.id,n:p.name,p:Number(p.selling_price),e:"🛍️",img:p.image_url||"",stock:Number(p.inventory_qty??0),c:p.category?.name||"Other"}));
  renderCategories();
  render();
  save();
}

function filteredProducts(){
  let list=currentCategory==="all"?products:products.filter(p=>p.c===currentCategory);
  if(searchQuery) list=list.filter(p=>p.n.toLowerCase().includes(searchQuery));
  return list;
}

function render(list=filteredProducts()){
  const totalPages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));
  if(currentPage>totalPages)currentPage=totalPages;
  const pageItems=list.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  el("#products").innerHTML=pageItems.map(p=>{
    const qty=cart.find(x=>x.id===p.id)?.qty||0;
    const controls=p.stock===0?'<span class="stock-label">Out of stock</span>':'<div class="qty-stepper"><button type="button" aria-label="Decrease quantity" onclick="changeQty(\\''+p.id+'\\',-1)" '+(qty===0?'disabled':'')+'>−</button><span>'+qty+'</span><button type="button" aria-label="Increase quantity" onclick="changeQty(\\''+p.id+'\\',1)" '+(qty>=p.stock?'disabled':'')+'>+</button></div>';
    return '<article class="card"><div class="pic">'+(p.img?'<img src="'+p.img+'" alt="'+p.n+'" loading="lazy">':p.e)+'</div><div class="card-body"><h3>'+p.n+'</h3><div class="price">'+money(p.p)+'</div>'+controls+'</div></article>';
  }).join("")||"<p>No products found.</p>";
  renderPagination(totalPages);
}
function renderPagination(totalPages){
  const wrap=el("#pagination");
  if(!wrap)return;
  if(totalPages<=1){wrap.innerHTML="";return}
  let html="";
  for(let i=1;i<=totalPages;i++){
    html+='<button class="'+(i===currentPage?'active':'')+'" data-page="'+i+'">'+i+'</button>';
  }
  wrap.innerHTML=html;
  wrap.querySelectorAll("button").forEach(b=>b.onclick=()=>{
    currentPage=Number(b.dataset.page);
    render();
    document.querySelector("#shop")?.scrollIntoView({behavior:"smooth",block:"start"});
  });
}

function renderCategories(){
  const wrap=el("#categoryChips"); if(!wrap)return;
  const cats=[...new Set(products.map(p=>p.c).filter(Boolean))];
  wrap.innerHTML=cats.map(c=>'<button data-category="'+c+'">'+c+'</button>').join("");
  document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".chips button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    currentCategory=b.dataset.category||"all";
    currentPage=1;
    render();
  });
}

window.changeQty=(id,delta)=>{
  const p=products.find(x=>x.id===id);if(!p)return;
  const item=cart.find(x=>x.id===id),next=(item?.qty||0)+delta;
  if(next<0||next>p.stock)return;
  if(next===0)cart=cart.filter(x=>x.id!==id);
  else if(item)item.qty=next;
  else cart.push({...p,qty:next});
  save();render();
};
function save(){
  localStorage.setItem("drop-cart",JSON.stringify(cart));
  el("#cartCount").textContent=cart.reduce((sum,p)=>sum+(Number(p.qty)||1),0);
  el("#cartItems").innerHTML=cart.length?cart.map(p=>'<div class="item"><div class="mini">'+(p.img?'<img src="'+p.img+'" alt="">':p.e)+'</div><div class="item-info"><b>'+p.n+'</b><div>'+money(p.p)+' each</div><div class="cart-qty"><button type="button" aria-label="Decrease quantity" onclick="changeQty(\\''+p.id+'\\',-1)">−</button><span>'+p.qty+'</span><button type="button" aria-label="Increase quantity" onclick="changeQty(\\''+p.id+'\\',1)" '+(p.qty>=p.stock?'disabled':'')+'>+</button></div></div><strong class="item-subtotal">'+money(p.p*p.qty)+'</strong></div>').join(""):"<p>Your cart is empty.</p>";
  el("#cartTotal").textContent=money(cart.reduce((sum,p)=>sum+p.p*p.qty,0));
}
window.openCart=()=>{el("#drawer").classList.add("open");el("#overlay").classList.add("open")};
window.closeCart=()=>{el("#drawer").classList.remove("open");el("#overlay").classList.remove("open")};
window.checkout=()=>location.href="./checkout.html";
window.trackOrder=async()=>{
  const id=el("#orderId").value.trim(); if(!id){el("#trackResult").textContent="Please enter an order ID.";return}
  const {data,error}=await supabase.from("orders").select("order_number,status,shipments(tracking_id,carrier,status)").eq("order_number",id).maybeSingle();
  el("#trackResult").textContent=error?"Unable to check order.":data?("Order "+data.order_number+" · "+data.status+(data.shipments?.[0]?.tracking_id?" · Tracking "+data.shipments[0].tracking_id:"")):"Order not found.";
};
el("#cartBtn").onclick=openCart;
el("#search").oninput=e=>{searchQuery=e.target.value.trim().toLowerCase();currentPage=1;render()};
loadProducts();
