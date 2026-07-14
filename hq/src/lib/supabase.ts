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
export const supabase = createClient<Database, 'hq'>(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'hq' },
})
