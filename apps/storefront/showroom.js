import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/controls/OrbitControls.js";

const API_URL="https://dpiecktmpduhlapnkwvq.supabase.co";
const API_KEY="sb_publishable_WCj-w_p_KTzKoO9pDqGbVQ_ye8VdCOd";
const featured=document.querySelector("#featured-products");
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function get(path){const r=await fetch(API_URL+"/rest/v1/"+path,{headers:{apikey:API_KEY,Authorization:"Bearer "+API_KEY}});if(!r.ok)throw new Error("Products unavailable");return r.json();}
function addToCart(p){let cart=[];try{cart=JSON.parse(localStorage.getItem("drop-cart")||"[]");if(!Array.isArray(cart))cart=[];}catch{}const found=cart.find(x=>String(x.id)===String(p.id));if(found)found.qty=Math.max(1,Number(found.qty)||1)+1;else cart.push({id:p.id,n:p.name,p:Number(p.selling_price),img:p.image_url||"",e:"🛍️",qty:1});localStorage.setItem("drop-cart",JSON.stringify(cart));const b=document.querySelector('[data-add="'+CSS.escape(String(p.id))+'"]');if(b){b.textContent="Added ✓";b.disabled=true;setTimeout(()=>{b.textContent="Add to cart +";b.disabled=false},1300)}}

const canvas=document.querySelector("#showroom-canvas");
const loading=document.querySelector("#scene-loading");
const stage=document.querySelector(".real-3d-stage");
let renderer,scene,camera,controls,raf,activeZone="all";
const zoneGroups={};
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const clickable=[];
const mats={};
function mat(color,roughness=.75,metalness=0){const key=color+"-"+roughness+"-"+metalness;return mats[key]||(mats[key]=new THREE.MeshStandardMaterial({color,roughness,metalness}));}
function mesh(geometry,material,x,y,z,parent=scene){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,color,x,y,z,parent=scene,rough=.75){return mesh(new THREE.BoxGeometry(w,h,d),mat(color,rough),x,y,z,parent);}
function cylinder(rt,rb,h,color,x,y,z,parent=scene,segments=32){return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat(color),x,y,z,parent);}
function sphere(r,color,x,y,z,parent=scene){return mesh(new THREE.SphereGeometry(r,28,20),mat(color,.45),x,y,z,parent);}
function makeLabel(text,color="#5f584c"){
 const c=document.createElement("canvas");c.width=512;c.height=128;const ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle="#fffaf0";ctx.beginPath();ctx.roundRect(4,4,504,120,30);ctx.fill();ctx.strokeStyle="#d8cdbb";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=color;ctx.font="700 35px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text.toUpperCase(),256,64);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(1.65,.42,1);return sprite;
}
function zone(name,x,z,color){
 const g=new THREE.Group();g.position.set(x,0,z);g.userData.zone=name;scene.add(g);zoneGroups[name]=g;
 // pedestal and illuminated plinth
 cylinder(.83,.9,.16,"#bba88f",0,.12,0,g);
 cylinder(.68,.74,.9,"#e5d8c5",0,.62,0,g);
 cylinder(.72,.72,.06,color,0,1.1,0,g);
 const label=makeLabel(({decor:"HOME & DECOR",kitchen:"KITCHEN & LIVING",gadgets:"GADGETS",fashion:"STYLE & MORE"})[name]);label.position.set(0,2.12,0);g.add(label);
 const ring=mesh(new THREE.TorusGeometry(.94,.018,8,60),mat(color,.45,.15),0,.23,0,g);ring.rotation.x=Math.PI/2;
 return g;
}
function buildDecor(g){
 const vase=cylinder(.18,.25,.65,"#b77957",-.22,1.48,.04,g);vase.rotation.z=-.08;cylinder(.095,.12,.12,"#d3a17d",-.22,1.84,.04,g);
 const vase2=sphere(.23,"#c9b89f",.32,1.36,-.08,g);vase2.scale.set(.9,.72,.9);
 cylinder(.2,.26,.32,"#8b9a7a",.33,1.28,-.08,g);
 for(let i=0;i<5;i++){const leaf=sphere(.11,"#7f916f",.33+Math.cos(i*1.2)*.16,1.62+Math.sin(i*1.4)*.18,-.08+Math.sin(i)*.07,g);leaf.scale.set(.7,1.8,.5);leaf.rotation.z=(i-2)*.25;}
}
function buildKitchen(g){
 cylinder(.34,.34,.07,"#f5eee2",-.2,1.23,0,g,48);cylinder(.25,.25,.04,"#c4ad8f",-.2,1.28,0,g,48);
 cylinder(.15,.17,.33,"#a9b49b",.28,1.4,.02,g);cylinder(.12,.12,.08,"#ded5c6",.28,1.6,.02,g);
 const handle=mesh(new THREE.TorusGeometry(.12,.025,10,24,Math.PI),mat("#a9b49b"),.28,1.65,.02,g);handle.rotation.z=Math.PI;
 box(.28,.43,.22,"#d7b49a",.15,1.45,-.32,g);
}
function buildGadgets(g){
 const speaker=cylinder(.25,.25,.62,"#424741",-.15,1.47,0,g,48);speaker.rotation.z=Math.PI/2;speaker.rotation.x=Math.PI/2;
 const rim=mesh(new THREE.TorusGeometry(.22,.025,10,40),mat("#a7b79b",.3,.25),-.15,1.47,.23,g);rim.rotation.y=0;
 for(let i=0;i<5;i++)sphere(.018,"#b9c4b2",-.27+i*.06,1.48,.255,g);
 box(.28,.42,.08,"#2b302c",.28,1.42,-.13,g,.3);box(.23,.35,.015,"#9fb7a3",.28,1.42,-.082,g,.3);
 sphere(.09,"#d5a17c",.27,1.76,-.14,g);
}
function buildFashion(g){
 // folded fabric stack + mini tote silhouette
 box(.48,.11,.36,"#d8a5a0",-.18,1.23,0,g);box(.44,.1,.34,"#e6d8bf",-.15,1.33,.01,g);box(.4,.1,.32,"#a9b9c4",-.12,1.43,.02,g);
 const bag=box(.38,.42,.16,"#b7a27d",.28,1.42,0,g);bag.rotation.z=-.06;
 const handle=mesh(new THREE.TorusGeometry(.12,.025,10,32,Math.PI),mat("#6c6250"),.28,1.68,.01,g);handle.rotation.z=Math.PI;
}
function init3D(){
 try{
  if(!canvas||!window.WebGLRenderingContext)throw new Error("WebGL is not available on this device");
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.setSize(stage.clientWidth,stage.clientHeight,false);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  scene=new THREE.Scene();scene.background=new THREE.Color("#e9dfcf");scene.fog=new THREE.Fog("#e9dfcf",12,25);
  camera=new THREE.PerspectiveCamera(38,stage.clientWidth/stage.clientHeight,.1,60);camera.position.set(4.6,5.8,10.5);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.1,0);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=6.5;controls.maxDistance=15;controls.minPolarAngle=.5;controls.maxPolarAngle=1.42;controls.maxAzimuthAngle=1.2;controls.minAzimuthAngle=-1.2;controls.update();
  scene.add(new THREE.HemisphereLight("#fff7e8","#b0a18a",2.2));
  const key=new THREE.DirectionalLight("#fff2dc",3.1);key.position.set(4,9,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
  const fill=new THREE.DirectionalLight("#c8d6d0",1.1);fill.position.set(-6,5,-4);scene.add(fill);
  // A real walk-in showroom: floor, back/side walls, arch and timber rails.
  box(16,.18,14,"#d9cdbb",0,-.13,0,scene);
  box(16,5,.16,"#eee6d8",0,2.35,-4.8,scene);
  box(.16,5,9.6,"#d8d0c1",-5.8,2.35,0,scene);
  box(.16,5,9.6,"#d8d0c1",5.8,2.35,0,scene);
  box(11,.08,.2,"#ad9678",0,3.9,-4.65,scene);
  // Back wall arch with real curved geometry.
  const arch=mesh(new THREE.TorusGeometry(1.3,.09,12,64,Math.PI),mat("#c4a98a"),0,2.3,-4.55);arch.scale.set(1.35,1.35,1);arch.rotation.z=Math.PI;
  box(.24,1.55,.2,"#c4a98a",-1.75,1.42,-4.55);box(.24,1.55,.2,"#c4a98a",1.75,1.42,-4.55);
  // overhead warm light strips
  box(3.8,.035,.08,"#f6dfb5",0,4.3,-3.8,scene,.2);
  // Four separate product islands
  const specs=[["decor",-3.5,-1.5,"#d6a17d"],["kitchen",-1.25,-.15,"#a9b49b"],["gadgets",1.15,-.15,"#a8b9c7"],["fashion",3.4,-1.5,"#d8a5a0"]];
  for(const [n,x,z,c] of specs){const g=zone(n,x,z,c);({decor:buildDecor,kitchen:buildKitchen,gadgets:buildGadgets,fashion:buildFashion})[n](g);g.traverse(o=>{if(o.isMesh){o.userData.zone=n;clickable.push(o);}});}
  // floor inlays give the room depth and scale
  for(let i=-4;i<=4;i++)box(.012,.008,8,"#c9baa4",i*1.1,-.025,.2,scene);
  for(let z=-3;z<=3;z++)box(10,.008,.012,"#c9baa4",0,-.022,z*.8,scene);
  const resize=()=>{if(!renderer||!camera)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  if("ResizeObserver"in window)new ResizeObserver(resize).observe(stage);else window.addEventListener("resize",resize);
  canvas.addEventListener("pointerdown",()=>{document.querySelector("#scene-hint").textContent="Keep dragging to explore the showroom";},{passive:true});
  canvas.addEventListener("pointerup",onSceneClick);
  document.querySelector("#reset-scene")?.addEventListener("click",()=>focusZone("all"));
  document.querySelectorAll(".scene-zone").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".scene-zone").forEach(b=>b.classList.toggle("active",b===btn));focusZone(btn.dataset.zone);}));
  const animate=()=>{raf=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};animate();
  setTimeout(()=>loading?.classList.add("is-hidden"),350);
 }catch(err){console.error("3D showroom could not initialize",err);if(loading)loading.innerHTML='<b>3D view could not start</b><span>Try opening this page in Safari with WebGL enabled.</span><a href="./index.html#shop" style="color:#6d5944;text-decoration:underline">Browse the shop instead ↗</a>'; }
}
function focusZone(name){
 activeZone=name;
 if(!camera||!controls)return;
 const target=name==="all"?new THREE.Vector3(0,1,0):new THREE.Vector3(...({decor:[-3.5,1.1,-1.5],kitchen:[-1.25,1.1,-.15],gadgets:[1.15,1.1,-.15],fashion:[3.4,1.1,-1.5]})[name]);
 const offset=name==="all"?new THREE.Vector3(4.6,5.5,10.5):new THREE.Vector3(3.8,2.8,5.2);
 const startTarget=controls.target.clone(),startPos=camera.position.clone(),endPos=target.clone().add(offset);let t0=performance.now();
 function move(now){const t=Math.min(1,(now-t0)/650),e=t*t*(3-2*t);controls.target.copy(startTarget.clone().lerp(target,e));camera.position.copy(startPos.clone().lerp(endPos,e));if(t<1)requestAnimationFrame(move);}
 requestAnimationFrame(move);
 Object.entries(zoneGroups).forEach(([n,g])=>g.traverse(o=>{if(o.material&&o.material.emissive)o.material.emissive.set(n===name||name==="all"?"#000000":"#000000");}));
 document.querySelector("#scene-hint").textContent=name==="all"?"Drag anywhere in the scene to look around":"Exploring "+({decor:"Home & Decor",kitchen:"Kitchen & Living",gadgets:"Gadgets",fashion:"Style & More"})[name];
}
function onSceneClick(event){
 if(!renderer||!camera)return;const rect=canvas.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickable,false);if(!hits.length)return;const zone=hits[0].object.userData.zone;if(zone){const btn=document.querySelector('.scene-zone[data-zone="'+zone+'"]');btn?.click();}
}
async function loadFeatured(){try{const products=await get("products?select=id,name,selling_price,image_url,category_id&active=eq.true&order=created_at.desc&limit=4");let categories=[];try{categories=await get("categories?select=id,name")}catch{}const cats=new Map(categories.map(c=>[c.id,c.name]));if(!products.length){featured.innerHTML='<p class="empty-state">New finds are on their way. <a href="./index.html#shop">Browse the shop ↗</a></p>';return;}featured.innerHTML=products.map(p=>'<article class="product-card"><a href="./index.html#shop" class="product-image" aria-label="View '+esc(p.name)+'">'+(p.image_url?'<img src="'+esc(p.image_url)+'" alt="'+esc(p.name)+'" loading="lazy">':'<span class="product-placeholder">✳</span>')+'</a><div class="product-info"><h3>'+esc(p.name)+'</h3><div class="product-price">'+money(p.selling_price)+'</div><div class="product-category">'+esc(cats.get(p.category_id)||"A good find")+'</div><button class="add-button" data-add="'+esc(p.id)+'">Add to cart +</button></div></article>').join("");featured.querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>{const p=products.find(x=>String(x.id)===btn.dataset.add);if(p)addToCart(p)}));}catch(e){console.warn("Could not load showroom products",e);featured.innerHTML='<p class="empty-state">Our picks are taking a little break. <a href="./index.html#shop">Browse all products ↗</a></p>';}}
document.querySelectorAll("[data-category-link]").forEach(a=>a.addEventListener("click",()=>{try{sessionStorage.setItem("storefront-view",JSON.stringify({category:a.dataset.categoryLink,page:1,search:""}))}catch{}}));
init3D();loadFeatured();
