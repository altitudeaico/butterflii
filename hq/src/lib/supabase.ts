import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.',
  )
}

// Butterflii HQ's tables live in a dedicated `hq` Postgres schema, kept
// separate from other apps sharing this Supabase project. `hq` must be added
// to Project Settings > API > Exposed schemas for this client to reach it.
//
// flowType 'pkce' puts the password-recovery redirect's token in a `?code=`
// query param instead of a `#access_token=` URL fragment. That matters
// because the app uses HashRouter (see main.tsx): a fragment-based token
// would collide with HashRouter's own use of the URL hash for routing. PKCE
// sidesteps the collision entirely, and is detected and exchanged for a
// session automatically on load (detectSessionInUrl defaults to true).
export const supabase = createClient<Database, 'hq'>(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'hq' },
  auth: { flowType: 'pkce' },
})
