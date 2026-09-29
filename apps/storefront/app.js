const API_URL="https://dpiecktmpduhlapnkwvq.supabase.co";
const API_KEY="sb_publishable_WCj-w-p_KTzKoO9pDqGbVQ_ye8VdCOd";
async function apiGet(path){const response=await fetch(API_URL+"/rest/v1/"+path,{headers:{apikey:API_KEY,Authorization:"Bearer "+API_KEY}});const body=await response.json().catch(()=>null);if(!response.ok)throw new Error(body?.message||("Database request failed ("+response.status+")"));return body;}

const PAGE_SIZE=10;
let products=[];\nlet siteDiscounts=[];
let cart=[];
try {
  const saved=JSON.parse(localStorage.getItem("drop-cart")||"[]");
  cart=Array.isArray(saved)?saved.reduce((out,p)=>{
    if(!p?.id)return out;
    const qty=Math.max(1,Number(p.qty)||1);
    const found=out.find(x=>x.id===p.id);
    if(found)found.qty+=qty;else out.push({...p,qty});
    return out;
  },[]):[];
} catch { cart=[]; }

let currentCategory="all";
let currentPage=1;
let searchQuery="";
const el=s=>document.querySelector(s);
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function loadProducts(){
  const productsNode=el("#products");
  productsNode.innerHTML='<p class="products-loading">Loading products…</p>';
  try{
    // Fetch products independently of category relationships so a missing PostgREST
    // relationship cannot prevent the entire catalogue from rendering.
    const data=await apiGet("products?select=id,name,selling_price,image_url,inventory_qty,category_id&active=eq.true&order=created_at.desc");
    let categories=[];
    try{categories=await apiGet("categories?select=id,name");}
    catch(categoryError){console.warn("Category labels unavailable; showing products under Other:",categoryError.message);}
    const categoryMap=new Map((categories||[]).map(c=>[c.id,c.name]));\n    try{siteDiscounts=await apiGet("site_discounts?select=discount_type,discount_value,scope,category_id,starts_at,ends_at&active=eq.true");}catch(e){siteDiscounts=[]}
    products=(data||[]).map(p=>({
      id:p.id,n:p.name,p:Number(p.selling_price),e:"🛍️",img:p.image_url||"",
      stock:Math.max(0,Number(p.inventory_qty??0)),categoryId:p.category_id,c:categoryMap.get(p.category_id)||"Other"
    }));
    renderCategories();
    render();
    save();
  }catch(error){
    console.error("Unable to load storefront products:",error);
    productsNode.innerHTML='<div class="products-error"><strong>Products are temporarily unavailable.</strong><p>Please refresh the page in a moment.</p></div>';
  }
}
function saleOff(p){const now=Date.now();const d=siteDiscounts.filter(x=>new Date(x.starts_at)<=now&&new Date(x.ends_at)>=now&&(x.scope==="all"||(x.scope==="category"&&x.category_id===p.categoryId))).slice(-1)[0];return d?Math.min(p.p,d.discount_type==="percent"?p.p*Number(d.discount_value)/100:Number(d.discount_value)):0}\nfunction salePrice(p){return Math.max(0,Math.round((p.p-saleOff(p))*100)/100)}\nfunction filteredProducts(){
  let list=currentCategory==="all"?products:products.filter(p=>p.c===currentCategory);
  if(searchQuery)list=list.filter(p=>p.n.toLowerCase().includes(searchQuery));
  return list;
}
function render(list=filteredProducts()){
  const totalPages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));
  if(currentPage>totalPages)currentPage=totalPages;
  const pageItems=list.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  el("#products").innerHTML=pageItems.map(p=>{
    const qty=cart.find(x=>x.id===p.id)?.qty||0;
    const name=escapeHTML(p.n);
    const sale=salePrice(p);const price=sale<p.p?`<div class="price"><del>${money(p.p)}</del> <strong>${money(sale)}</strong></div>`:`${price}`;\n    const image=p.img?'<img src="'+escapeHTML(p.img)+'" alt="'+name+'" loading="lazy">':p.e;
    const controls=p.stock===0?'<span class="stock-label">Out of stock</span>':
      (qty===0?'<button type="button" class="add" data-add="'+p.id+'">Add to cart</button>':
      '<div class="qty-stepper"><button type="button" data-qty="-1" data-id="'+p.id+'" aria-label="Decrease '+name+'">−</button><span>'+qty+'</span><button type="button" data-qty="1" data-id="'+p.id+'" aria-label="Increase '+name+'" '+(qty>=p.stock?'disabled':'')+'>+</button></div>');
    return '<article class="card"><div class="pic">'+image+'</div><div class="card-body"><h3>'+name+'</h3>'+price+controls+'</div></article>';
  }).join("")||'<p class="empty-products">No products found in this category.</p>';
  renderPagination(totalPages);
}
function renderPagination(totalPages){
  const wrap=el("#pagination");if(!wrap)return;
  if(totalPages<=1){wrap.innerHTML="";return}
  wrap.innerHTML=Array.from({length:totalPages},(_,i)=>'<button type="button" class="'+(i+1===currentPage?'active':'')+'" data-page="'+(i+1)+'" aria-current="'+(i+1===currentPage?'page':'false')+'">'+(i+1)+'</button>').join("");
}
function renderCategories(){
  const wrap=el("#categoryChips");if(!wrap)return;
  const cats=[...new Set(products.map(p=>p.c).filter(Boolean))];
  wrap.innerHTML=cats.map(c=>'<button type="button" data-category="'+escapeHTML(c)+'" class="'+(c===currentCategory?'active':'')+'">'+escapeHTML(c)+'</button>').join("");
  el('#categories [data-category="all"]')?.classList.toggle("active",currentCategory==="all");
}
window.changeQty=(id,delta)=>{
  const p=products.find(x=>x.id===id);if(!p)return;
  const item=cart.find(x=>x.id===id),next=(item?.qty||0)+delta;
  if(next<0||next>p.stock)return;
  if(next===0)cart=cart.filter(x=>x.id!==id);
  else if(item){item.qty=next;item.p=salePrice(p)}
  else cart.push({...p,p:salePrice(p),originalPrice:p.p,qty:next});
  save();render();
};
function save(){
  localStorage.setItem("drop-cart",JSON.stringify(cart));
  el("#cartCount").textContent=cart.reduce((sum,p)=>sum+(Number(p.qty)||1),0);
  el("#cartItems").innerHTML=cart.length?cart.map(p=>{
    const name=escapeHTML(p.n),qty=Number(p.qty)||1;
    return '<div class="item"><div class="mini">'+(p.img?'<img src="'+escapeHTML(p.img)+'" alt="">':p.e)+'</div><div class="item-info"><b>'+name+'</b><div>'+money(p.p)+' each</div><div class="cart-qty"><button type="button" data-qty="-1" data-id="'+p.id+'" aria-label="Decrease '+name+'">−</button><span>'+qty+'</span><button type="button" data-qty="1" data-id="'+p.id+'" aria-label="Increase '+name+'" '+(qty>=p.stock?'disabled':'')+'>+</button></div></div><strong class="item-subtotal">'+money(p.p*qty)+'</strong></div>';
  }).join(""):"<p>Your cart is empty.</p>";
  el("#cartTotal").textContent=money(cart.reduce((sum,p)=>sum+p.p*(Number(p.qty)||1),0));
}
window.openCart=()=>{el("#drawer").classList.add("open");el("#overlay").classList.add("open")};
window.closeCart=()=>{el("#drawer").classList.remove("open");el("#overlay").classList.remove("open")};
window.checkout=()=>{if(!cart.length){alert("Please select at least one product.");return}location.href="./checkout.html"};
window.trackOrder=async()=>{
  const id=el("#orderId").value.trim();if(!id){el("#trackResult").textContent="Please enter an order ID.";return}
  try{const rows=await apiGet("orders?select=order_number,status,shipments(tracking_id,carrier,status)&order_number=eq."+encodeURIComponent(id)+"&limit=1");const data=rows?.[0];el("#trackResult").textContent=data?("Order "+data.order_number+" · "+data.status+(data.shipments?.[0]?.tracking_id?" · Tracking "+data.shipments[0].tracking_id:"")):"Order not found.";}catch(error){el("#trackResult").textContent="Unable to check order: "+error.message;}
};
el("#cartBtn").addEventListener("click",window.openCart);
const searchInput=el("#search");
const clearSearch=el("#clearSearch");
function syncSearch(){
  searchQuery=searchInput.value.trim().toLowerCase();
  clearSearch.hidden=searchInput.value.length===0;
  currentPage=1;
  render();
}
searchInput.addEventListener("input",syncSearch);
clearSearch.addEventListener("click",()=>{
  searchInput.value="";
  searchInput.dispatchEvent(new Event("input",{bubbles:true}));
  searchInput.focus({preventScroll:true});
});
el("#products").addEventListener("click",e=>{
  const add=e.target.closest("button[data-add]");
  if(add){window.changeQty(add.dataset.add,1);return;}
  const button=e.target.closest("button[data-qty]");if(button&&!button.disabled)window.changeQty(button.dataset.id,Number(button.dataset.qty));
});
el("#cartItems").addEventListener("click",e=>{
  const button=e.target.closest("button[data-qty]");if(button&&!button.disabled)window.changeQty(button.dataset.id,Number(button.dataset.qty));
});
el("#pagination").addEventListener("click",e=>{
  const button=e.target.closest("button[data-page]");if(!button)return;
  currentPage=Number(button.dataset.page);render();
  document.querySelector("#shop")?.scrollIntoView({behavior:"smooth",block:"start"});
});
el("#categories").addEventListener("click",e=>{
  const button=e.target.closest("button[data-category]");if(!button)return;
  currentCategory=button.dataset.category;currentPage=1;
  el("#categories").querySelectorAll("button[data-category]").forEach(b=>b.classList.toggle("active",b===button));
  render();
});
loadProducts();
