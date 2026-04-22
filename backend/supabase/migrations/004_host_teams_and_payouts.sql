alter table if exists profiles
  add column if not exists stripe_connect_account_id text,
  add column if not exists stripe_connect_onboarded boolean not null default false;

create table if not exists event_team_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'scanner')),
  invited_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists event_team_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  invited_email text not null,
  role text not null check (role in ('manager', 'scanner')),
  token text not null unique,
  invited_by uuid not null references profiles(id),
  accepted_by uuid references profiles(id),
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_team_members_event on event_team_members(event_id);
create index if not exists idx_event_team_members_user on event_team_members(user_id);
create index if not exists idx_event_team_invites_event on event_team_invites(event_id);
create index if not exists idx_event_team_invites_email on event_team_invites(invited_email);

alter table event_team_members enable row level security;
alter table event_team_invites enable row level security;

create policy "team_member_self_read" on event_team_members
for select using (auth.uid() = user_id);

create policy "event_owner_manage_team_members" on event_team_members
for all using (
  exists(select 1 from events e where e.id = event_team_members.event_id and e.host_id = auth.uid())
) with check (
  exists(select 1 from events e where e.id = event_team_members.event_id and e.host_id = auth.uid())
);

create policy "event_owner_manage_team_invites" on event_team_invites
for all using (
  exists(select 1 from events e where e.id = event_team_invites.event_id and e.host_id = auth.uid())
) with check (
  exists(select 1 from events e where e.id = event_team_invites.event_id and e.host_id = auth.uid())
);
