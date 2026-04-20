create extension if not exists pgcrypto;

create type event_visibility as enum ('public', 'private');
create type age_restriction as enum ('all_ages', 'age_18_plus', 'age_21_plus');
create type order_payment_status as enum ('pending', 'paid', 'failed');
create type ticket_status as enum ('active', 'checked_in', 'cancelled');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  school text,
  organizer_name text not null,
  created_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text not null,
  image_url text,
  date date not null,
  start_time time not null,
  end_time time not null,
  location text not null,
  capacity integer not null check (capacity > 0),
  ticket_price integer not null check (ticket_price >= 0),
  tickets_available integer not null check (tickets_available > 0),
  visibility event_visibility not null default 'public',
  age_restriction age_restriction not null default 'all_ages',
  dress_code text,
  instructions text,
  location_note text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  buyer_name text not null,
  buyer_email text not null,
  quantity integer not null check (quantity > 0),
  total_amount integer not null,
  payment_status order_payment_status not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  ticket_code text not null unique,
  qr_code_url text,
  status ticket_status not null default 'active',
  created_at timestamptz default now()
);

create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references tickets(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  checked_in_at timestamptz default now(),
  checked_in_by uuid references profiles(id)
);

create index if not exists idx_events_host_date on events(host_id, date);
create index if not exists idx_orders_event_created on orders(event_id, created_at desc);
create index if not exists idx_tickets_event_code on tickets(event_id, ticket_code);
create index if not exists idx_events_slug on events(slug);
create index if not exists idx_orders_email on orders(buyer_email);

alter table profiles enable row level security;
alter table events enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;
alter table check_ins enable row level security;

create policy "profile_own_read" on profiles for select using (auth.uid() = id);
create policy "profile_own_write" on profiles for insert with check (auth.uid() = id);
create policy "profile_own_update" on profiles for update using (auth.uid() = id);

create policy "host_event_crud" on events for all using (auth.uid() = host_id) with check (auth.uid() = host_id);
create policy "public_event_read" on events for select using (visibility = 'public' or auth.uid() = host_id);

create policy "host_order_read" on orders for select using (
  exists(select 1 from events e where e.id = orders.event_id and e.host_id = auth.uid())
);
create policy "service_order_write" on orders for insert with check (true);
create policy "service_order_update" on orders for update using (true);

create policy "host_ticket_read" on tickets for select using (
  exists(select 1 from events e where e.id = tickets.event_id and e.host_id = auth.uid())
);
create policy "service_ticket_write" on tickets for insert with check (true);
create policy "service_ticket_update" on tickets for update using (true);

create policy "host_checkin_read_write" on check_ins for all using (
  exists(select 1 from events e where e.id = check_ins.event_id and e.host_id = auth.uid())
) with check (
  exists(select 1 from events e where e.id = check_ins.event_id and e.host_id = auth.uid())
);

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

create policy "event_images_public_read"
on storage.objects for select
using (bucket_id = 'event-images');

create policy "event_images_host_upload"
on storage.objects for insert
with check (
  bucket_id = 'event-images'
  and auth.role() = 'authenticated'
);
