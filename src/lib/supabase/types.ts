// src/lib/supabase/types.ts
// Types TypeScript pour Supabase — Les Ateliers de la Source

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── Profil membre ───────────────────────────────────────────
export interface Profile {
  id: string                    // = auth.users.id (UUID)
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  city: string | null
  bio: string | null
  motivation: string | null
  avatar_url: string | null
  role: 'member' | 'admin'
  newsletter_global: boolean
  newsletter_stages: boolean
  newsletter_spectacles: boolean
  newsletter_blog: boolean
  newsletter_amelie: boolean
  created_at: string
  updated_at: string
}

// ─── Journal de stage (fiche de suivi) ───────────────────────
export interface StageLog {
  id: string
  member_id: string
  stage_slug: string
  stage_title: string
  stage_date: string
  trainer: string
  status: 'upcoming' | 'completed' | 'cancelled'
  intention_before: string | null
  reflection_after: string | null
  key_insight: string | null
  integration_notes: string | null
  rating: number | null
  would_recommend: boolean | null
  created_at: string
}

// ─── Notes personnelles du membre ─────────────────────────────
export interface MemberNote {
  id: string
  member_id: string
  stage_log_id: string | null
  title: string
  content: string
  is_private: boolean
  created_at: string
  updated_at: string
}

// ─── Notes du formateur (Gabriel / Amélie) ────────────────────
export interface TrainerNote {
  id: string
  member_id: string
  stage_log_id: string | null
  trainer_name: string
  content: string
  category: 'observation' | 'encouragement' | 'recommendation' | 'general'
  is_visible_to_member: boolean
  created_at: string
  updated_at: string
}

// ─── Réservations ─────────────────────────────────────────────
export interface Reservation {
  id: string
  member_id: string
  event_slug: string
  event_title: string
  event_date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'free' | 'pending' | 'paid' | 'refunded'
  amount_cents: number | null
  stripe_session_id: string | null
  notes: string | null
  created_at: string
}

// ─── Journal libre (hors stage) ───────────────────────────────
export interface GlobalNote {
  id: string
  user_id: string
  content: string
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────
export type ProfileWithStats = Profile & {
  stages_count: number
  last_stage_date: string | null
  reservations_count: number
}

// ─── Database Schema — format compatible Supabase JS v2 ───────
// Note: Tables use Record<string, unknown> based Row types so that
// the Supabase generic type system resolves correctly (avoids 'never' type errors).
// Runtime type safety is enforced at the interface level (Profile, StageLog, etc.)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Record<string, unknown> & {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          city: string | null
          bio: string | null
          motivation: string | null
          avatar_url: string | null
          role: string
          newsletter_global: boolean
          newsletter_stages: boolean
          newsletter_spectacles: boolean
          newsletter_blog: boolean
          newsletter_amelie: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          city?: string | null
          bio?: string | null
          motivation?: string | null
          avatar_url?: string | null
          role?: string
          newsletter_global?: boolean
          newsletter_stages?: boolean
          newsletter_spectacles?: boolean
          newsletter_blog?: boolean
          newsletter_amelie?: boolean
        }
        Update: {
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          city?: string | null
          bio?: string | null
          motivation?: string | null
          avatar_url?: string | null
          role?: string
          newsletter_global?: boolean
          newsletter_stages?: boolean
          newsletter_spectacles?: boolean
          newsletter_blog?: boolean
          newsletter_amelie?: boolean
        }
        Relationships: []
      }
      stage_logs: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          stage_slug: string
          stage_title: string
          stage_date: string
          trainer: string
          status: string
          intention_before: string | null
          reflection_after: string | null
          key_insight: string | null
          integration_notes: string | null
          rating: number | null
          would_recommend: boolean | null
          created_at: string
        }
        Insert: {
          member_id: string
          stage_slug: string
          stage_title: string
          stage_date: string
          trainer: string
          status?: string
          intention_before?: string | null
          reflection_after?: string | null
          key_insight?: string | null
          integration_notes?: string | null
          rating?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          stage_slug?: string
          stage_title?: string
          stage_date?: string
          trainer?: string
          status?: string
          intention_before?: string | null
          reflection_after?: string | null
          key_insight?: string | null
          integration_notes?: string | null
          rating?: number | null
          would_recommend?: boolean | null
        }
        Relationships: []
      }
      member_notes: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          stage_log_id: string | null
          title: string
          content: string
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          member_id: string
          stage_log_id?: string | null
          title: string
          content: string
          is_private?: boolean
        }
        Update: {
          stage_log_id?: string | null
          title?: string
          content?: string
          is_private?: boolean
        }
        Relationships: []
      }
      trainer_notes: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          stage_log_id: string | null
          trainer_name: string
          content: string
          category: string
          is_visible_to_member: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          member_id: string
          stage_log_id?: string | null
          trainer_name: string
          content: string
          category?: string
          is_visible_to_member?: boolean
        }
        Update: {
          stage_log_id?: string | null
          trainer_name?: string
          content?: string
          category?: string
          is_visible_to_member?: boolean
        }
        Relationships: []
      }
      reservations: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          event_slug: string
          event_title: string
          event_date: string
          status: string
          payment_status: string
          amount_cents: number | null
          stripe_session_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          member_id: string
          event_slug: string
          event_title: string
          event_date: string
          status?: string
          payment_status?: string
          amount_cents?: number | null
          stripe_session_id?: string | null
          notes?: string | null
        }
        Update: {
          event_slug?: string
          event_title?: string
          event_date?: string
          status?: string
          payment_status?: string
          amount_cents?: number | null
          stripe_session_id?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      member_global_notes: {
        Row: Record<string, unknown> & {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          user_id: string
          content: string
        }
        Update: {
          content?: string
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
