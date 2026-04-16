# After9 Frontend

Next.js web app for hosts and guests.

## Setup
1. Copy `.env.example` to `.env.local` and fill keys.
2. Run `npm install`.
3. Start app: `npm run dev`.
4. Apply backend SQL from `../backend/supabase/migrations/001_init.sql` then `../backend/supabase/seed.sql`.

## Main routes
- `/` landing page
- `/signup` and `/login`
- `/onboarding`
- `/dashboard`
- `/dashboard/events/new`
- `/events/[slug]`
- `/dashboard/events/[id]/check-in`
