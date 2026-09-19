-- Initial commerce schema (PostgreSQL-compatible)
create table if not exists customers(id uuid primary key, name text not null, mobile text, email text, created_at timestamptz default now());
create table if not exists categories(id uuid primary key, name text not null, slug text unique not null);
create table if not exists products(id uuid primary key, name text not null, slug text unique not null, description text, category_id uuid references categories(id), supplier_cost numeric(12,2), selling_price numeric(12,2), price_override numeric(12,2), active boolean default true, created_at timestamptz default now());
create table if not exists orders(id uuid primary key, order_number text unique not null, customer_id uuid references customers(id), status text not null, payment_method text, payment_status text, subtotal numeric(12,2) default 0, shipping numeric(12,2) default 0, total numeric(12,2) default 0, created_at timestamptz default now());
create table if not exists order_items(id uuid primary key, order_id uuid references orders(id), product_id uuid references products(id), quantity integer not null, unit_price numeric(12,2) not null);
create table if not exists payments(id uuid primary key, order_id uuid references orders(id), provider text, provider_reference text, amount numeric(12,2), status text, created_at timestamptz default now());
create table if not exists refunds(id uuid primary key, order_id uuid references orders(id), amount numeric(12,2), status text, reason text, created_at timestamptz default now());
create table if not exists shipments(id uuid primary key, order_id uuid references orders(id), tracking_id text, carrier text, status text, updated_at timestamptz default now());
create table if not exists audit_logs(id uuid primary key, entity_type text, entity_id uuid, action text, actor text, metadata jsonb, created_at timestamptz default now());
