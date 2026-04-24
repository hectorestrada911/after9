# After9 Frontend

Next.js web app for hosts and guests.

## Setup
1. Copy `.env.example` to `.env.local` and fill keys.
2. Run `npm install`.
3. Start app: `npm run dev`.
4. Apply backend SQL from `../backend/supabase/migrations/` in order (including `005_profiles_welcome_email_sent_at.sql` for welcome email tracking), then `../backend/supabase/seed.sql` if you use it.

## Main routes
- `/contact` — support form (Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, optional `RESEND_SUPPORT_INBOX`)
- Transactional Resend mail: ticket receipt + QR after Stripe payment (webhook); one-time host welcome after `/onboarding` (requires migration `005_…`). Supabase Auth emails (verify / reset) use Supabase unless you add Resend SMTP under Supabase → Authentication → SMTP.
- `/` landing page
- `/signup` and `/login`
- `/onboarding`
- `/dashboard`
- `/dashboard/events/new`
- `/events/[slug]`
- `/dashboard/events/[id]/check-in`
