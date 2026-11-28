// Hand-written for the `hq` schema, matching the shape
// `mcp__Supabase__generate_typescript_types` would produce once `hq` is added
// to Project Settings > API > Exposed schemas (that tool currently only sees
// `public`, which belongs to an unrelated app sharing this Supabase project).
// Regenerate/replace this once `hq` is exposed; keep the same shape.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Role = 'super_admin' | 'ops_admin' | 'artist'
export type EventMode = 'prep' | 'event' | 'wrapped'
export type TaskStatus = 'todo' | 'doing' | 'done' | 'blocked'
export type TaskOrigin = 'adult' | 'artist_idea'

export type ArtworkRow = {
  id: string
  artist_id: string
  title: string
  description: string
  proposed_price_pence: number
  status: 'pending' | 'approved' | 'changes_requested'
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  created_at: string
}

export type Database = {
  hq: {
    Tables: {
      artwork_submissions: {
        Row: ArtworkRow
        Insert: { title: string; description?: string; proposed_price_pence: number }
        Update: never
        Relationships: []
      }
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
      events: {
        Row: {
          id: string
          name: string
          event_date: string
          location: string | null
          mode: EventMode
          sales_target: number | null
          names_target: number | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          event_date: string
          location?: string | null
          mode?: EventMode
          sales_target?: number | null
          names_target?: number | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          event_date?: string
          location?: string | null
          mode?: EventMode
          sales_target?: number | null
          names_target?: number | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      objectives: {
        Row: {
          id: string
          event_id: string
          title: string
          why: string | null
          target: number | null
          sort_order: number
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          why?: string | null
          target?: number | null
          sort_order?: number
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          why?: string | null
          target?: number | null
          sort_order?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          objective_id: string
          title: string
          owner_id: string | null
          deadline: string | null
          status: TaskStatus
          is_critical: boolean
          weight: number
          blocked_by: string | null
          origin: TaskOrigin
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          objective_id: string
          title: string
          owner_id?: string | null
          deadline?: string | null
          status?: TaskStatus
          is_critical?: boolean
          weight?: number
          blocked_by?: string | null
          origin?: TaskOrigin
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          objective_id?: string
          title?: string
          owner_id?: string | null
          deadline?: string | null
          status?: TaskStatus
          is_critical?: boolean
          weight?: number
          blocked_by?: string | null
          origin?: TaskOrigin
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      resubmit_artwork: {
        Args: { p_id: string; p_title: string; p_description: string; p_price: number }
        Returns: ArtworkRow[]
      }
      review_artwork: {
        Args: { p_id: string; p_status: 'approved' | 'changes_requested'; p_note: string }
        Returns: ArtworkRow[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
