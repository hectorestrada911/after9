# After9 Monorepo

This repository is organized by concern:

- `frontend/` - Next.js app (UI + API routes for checkout/webhooks)
- `backend/` - Supabase schema, RLS policies, and seed data

## Quick start

### 1) Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2) Backend (Supabase)
Apply SQL files in order:

1. `backend/supabase/migrations/001_init.sql`
2. `backend/supabase/seed.sql`

The frontend expects Supabase/Stripe variables in `frontend/.env.local`.
