-- Tracks one-time “Welcome to RAGE” host email (sent from app via Resend after onboarding).
alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;
