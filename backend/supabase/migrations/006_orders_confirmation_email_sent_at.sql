-- Ensures ticket confirmation emails (with QR codes) are sent once per paid order.
alter table public.orders
  add column if not exists confirmation_email_sent_at timestamptz;
