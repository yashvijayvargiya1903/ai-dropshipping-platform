import express from "express";import cors from "cors";import crypto from "node:crypto";
const app=express();app.use(cors());app.use(express.json());
const users=new Map(),sessions=new Map(),products=new Map();
const margin=c=>c<=0?100:Math.ceil(c/300)*100,token=()=>crypto.randomBytes(24).toString("hex");
app.get("/api/health",(q,r)=>r.json({ok:true,service:"drop-api",time:new Date().toISOString()}));
app.post("/api/auth/register",(q,r)=>{const{email,password,name}=q.body||{};if(!email||!password)return r.status(400).json({error:"email and password required"});if(users.has(email))return r.status(409).json({error:"account already exists"});const u={id:crypto.randomUUID(),email,password,name:name||"",role:"owner"};users.set(email,u);const t=token();sessions.set(t,email);r.status(201).json({token:t,user:{id:u.id,email:u.email,name:u.name,role:u.role}})});
app.post("/api/auth/login",(q,r)=>{const{email,password}=q.body||{},u=users.get(email);if(!u||u.password!==password)return r.status(401).json({error:"invalid credentials"});const t=token();sessions.set(t,email);r.json({token:t,user:{id:u.id,email:u.email,name:u.name,role:u.role}})});
function auth(q,r,n){const h=q.headers.authorization||"",t=h.startsWith("Bearer ")?h.slice(7):null,e=t&&sessions.get(t);if(!e)return r.status(401).json({error:"authentication required"});q.user=users.get(e);n()}
app.get("/api/me",auth,(q,r)=>r.json({id:q.user.id,email:q.user.email,name:q.user.name,role:q.user.role}));
app.get("/api/products",(q,r)=>r.json([...products.values()]));
app.post("/api/products",auth,(q,r)=>{const{name,cost,price,category="Uncategorized"}=q.body||{};if(!name||cost==null)return r.status(400).json({error:"name and cost required"});const c=Number(cost),p={id:crypto.randomUUID(),name,category,cost:c,autoMargin:margin(c),price:price==null?c+margin(c):Number(price),active:true};products.set(p.id,p);r.status(201).json(p)});
app.patch("/api/products/:id",auth,(q,r)=>{const p=products.get(q.params.id);if(!p)return r.status(404).json({error:"product not found"});Object.assign(p,q.body);if("cost"in q.body)p.autoMargin=margin(Number(p.cost));r.json(p)});
app.listen(process.env.PORT||3000,()=>console.log("DROP API running"));
