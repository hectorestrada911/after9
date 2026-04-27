-- Soft-archive host events (hide from guest checkout and active host lists).
alter table public.events
  add column if not exists archived_at timestamptz;
