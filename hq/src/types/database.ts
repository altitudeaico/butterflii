// Hand-written for the `hq` schema, matching the shape
// `mcp__Supabase__generate_typescript_types` would produce once `hq` is added
// to Project Settings > API > Exposed schemas (that tool currently only sees
// `public`, which belongs to an unrelated app sharing this Supabase project).
// Regenerate/replace this once `hq` is exposed; keep the same shape.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Role = 'super_admin' | 'ops_admin' | 'artist'

export type Database = {
  hq: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          role: Role
          avatar: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string
          role: Role
          avatar?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          role?: Role
          avatar?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
