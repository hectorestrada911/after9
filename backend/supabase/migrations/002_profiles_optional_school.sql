-- School is optional for host profiles; onboarding no longer collects it.
alter table public.profiles
  alter column school drop not null;
