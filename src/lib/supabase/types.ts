// src/lib/supabase/types.ts
// Types TypeScript générés depuis le schéma Supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      stage_logs: {
        Row: StageLog
        Insert: Omit<StageLog, 'id' | 'created_at'>
        Update: Partial<Omit<StageLog, 'id' | 'created_at'>>
      }
      member_notes: {
        Row: MemberNote
        Insert: Omit<MemberNote, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MemberNote, 'id' | 'created_at'>>
      }
      trainer_notes: {
        Row: TrainerNote
        Insert: Omit<TrainerNote, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TrainerNote, 'id' | 'created_at'>>
      }
      reservations: {
        Row: Reservation
        Insert: Omit<Reservation, 'id' | 'created_at'>
        Update: Partial<Omit<Reservation, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

// ─── Profil membre ───────────────────────────────────────────
export interface Profile {
  id: string                    // = auth.users.id (UUID)
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  city: string | null
  bio: string | null            // présentation personnelle
  motivation: string | null     // pourquoi je suis là
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
  member_id: string             // → profiles.id
  stage_slug: string            // ex: theatre-doubles-karmiques
  stage_title: string
  stage_date: string            // date de début du stage
  trainer: string               // 'Gabriel' | 'Amélie'
  status: 'upcoming' | 'completed' | 'cancelled'
  // Avant le stage
  intention_before: string | null   // intention du membre avant le stage
  // Après le stage
  reflection_after: string | null   // réflexion du membre après le stage
  key_insight: string | null        // prise de conscience principale
  integration_notes: string | null  // comment j'intègre cela dans ma vie
  // Évaluation
  rating: number | null             // 1-5
  would_recommend: boolean | null
  created_at: string
}

// ─── Notes personnelles du membre ─────────────────────────────
export interface MemberNote {
  id: string
  member_id: string
  stage_log_id: string | null   // liée à un stage ou libre
  title: string
  content: string
  is_private: boolean           // true = visible seulement par le membre
  created_at: string
  updated_at: string
}

// ─── Notes du formateur (Gabriel / Amélie) ────────────────────
export interface TrainerNote {
  id: string
  member_id: string             // le membre concerné
  stage_log_id: string | null   // liée à un stage ou générale
  trainer_name: string          // 'Gabriel' | 'Amélie'
  content: string               // observation, suivi, recommandation
  category: 'observation' | 'encouragement' | 'recommendation' | 'general'
  is_visible_to_member: boolean // le membre peut-il voir cette note ?
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
  notes: string | null          // note d'inscription (questions, besoins)
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────
export type ProfileWithStats = Profile & {
  stages_count: number
  last_stage_date: string | null
  reservations_count: number
}
