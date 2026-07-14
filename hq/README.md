# Butterflii HQ

Mobile-first PWA for managing event prep for The Butterflii Art Studio. Three
role-based lenses (super admin, ops admin, artist) over one shared data model,
backed by Supabase. See the product/spec docs shared with this project for the
full picture; this README covers running and deploying what exists so far
(Phase 0: skeleton).

## Local development

```
npm install
cp .env.example .env.local   # fill in VITE_SUPABASE_ANON_KEY
npm run dev
```

Serves at `http://localhost:5173/hq/` (the app always runs under the `/hq/`
base path, matching where it's hosted in production alongside the marketing
site).

## Where things live

- Supabase project: `ypyxshljancxlvtjlpyo` ("altitudeaico's Project", free
  plan). This project also hosts an unrelated app's tables in `public`; HQ's
  tables live in their own dedicated `hq` Postgres schema, kept fully separate.
- `scripts/seed-profiles.sql`: the `hq` schema, `profiles` table, RLS policies,
  and the seed data. Already applied to the live project; kept here as the
  source of truth and for reproducing on a different project.
- `scripts/verify-rls.mjs`: proves the RLS policies actually deny what they
  should, directly against Supabase (not just a hidden UI element). Run with:
  ```
  VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
  TEST_EMAIL=... TEST_PASSWORD=... node scripts/verify-rls.mjs
  ```
  `TEST_EMAIL`/`TEST_PASSWORD` must belong to a non-super-admin profile
  (ops_admin or artist). Never hardcode real credentials in this file.

## Manual setup steps (one-time, not automatable from here)

1. **Expose the `hq` schema to the API.** Supabase Dashboard > Project
   Settings > API > Exposed schemas, add `hq` alongside `public`. Without
   this, the app can't reach any of its own tables (PostgREST only exposes
   `public` by default).
2. **Create the artist's login.** Supabase Dashboard > Authentication > Users
   > Add user: email `elsieolatoye@gmail.com`, password = her 6-digit PIN,
   "Auto Confirm User" checked. Then insert her `hq.profiles` row (see the
   commented-out line at the bottom of `scripts/seed-profiles.sql`) using her
   new auth UID.
3. **Switch GitHub Pages source to "GitHub Actions."** Repo Settings > Pages >
   Build and deployment > Source. Needed for `.github/workflows/deploy-pages.yml`
   to publish the combined artifact (marketing site + `/hq/`).
4. **Add repo Actions variables.** Repo Settings > Secrets and variables >
   Actions > Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the
   anon/publishable key is safe here; RLS is the real guard, not secrecy of
   this key).

## Login

Two adults sign in with real email + password
(`hello@altitudeai.co` / `funmiolatoye@gmail.com`). The artist signs in by
tapping her avatar and entering her PIN, never seeing an email field
(`src/auth/artistLogins.ts` holds the avatar-to-account mapping).
