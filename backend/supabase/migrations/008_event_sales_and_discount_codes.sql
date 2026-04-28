alter table events
add column if not exists sales_enabled boolean;

update events
set sales_enabled = true
where sales_enabled is null;

alter table events
alter column sales_enabled set not null;

alter table events
alter column sales_enabled set default false;

alter table orders
add column if not exists discount_code text,
add column if not exists discount_percent integer not null default 0,
add column if not exists discount_amount integer not null default 0;

create table if not exists event_discount_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  code text not null,
  percent_off integer not null check (percent_off >= 1 and percent_off <= 100),
  active boolean not null default true,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemption_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, code)
);

create index if not exists idx_event_discount_codes_event_active
on event_discount_codes(event_id, active);

create or replace function set_event_discount_codes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_event_discount_codes_updated_at on event_discount_codes;
create trigger trg_event_discount_codes_updated_at
before update on event_discount_codes
for each row
execute function set_event_discount_codes_updated_at();

create or replace function increment_event_discount_redemption(p_event_id uuid, p_code text)
returns void as $$
begin
  update event_discount_codes
  set redemption_count = redemption_count + 1
  where event_id = p_event_id
    and code = p_code;
end;
$$ language plpgsql security definer;

alter table event_discount_codes enable row level security;

drop policy if exists "host_discount_codes_crud" on event_discount_codes;
create policy "host_discount_codes_crud"
on event_discount_codes
for all
using (
  exists (
    select 1
    from events e
    where e.id = event_discount_codes.event_id
      and e.host_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from events e
    where e.id = event_discount_codes.event_id
      and e.host_id = auth.uid()
  )
);
