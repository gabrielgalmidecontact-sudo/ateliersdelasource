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
  diet_type: string | null
  food_allergies: string | null
  food_intolerances: string | null
  diet_notes: string | null
  logistics_notes: string | null
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
  category: 'observation' | 'encouragement' | 'piste' | 'recommendation' | 'general'
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
  diet_type: string | null
  food_allergies: string | null
  food_intolerances: string | null
  diet_notes: string | null
  logistics_notes: string | null
  accommodation_type: string | null
  transport_mode: 'train' | 'avion' | 'voiture' | 'bus' | null
  arrival_location: string | null
  needs_transfer: boolean
  arrival_time: string | null
  departure_time: string | null
  created_at: string
}


export interface Review {
  id: string
  content_type: 'event' | 'activity'
  content_slug: string
  content_title: string
  member_id: string | null
  reservation_id: string | null
  first_name: string
  email: string
  rating: number
  comment: string
  is_published: boolean
  is_verified_participant: boolean
  published_at: string | null
  created_at: string
}

// ─── Journal libre (hors stage) ───────────────────────────────
export interface GlobalNote {
  id: string
  user_id: string
  content: string
  created_at: string
}

// ─── Compétences définies par Gabriel ─────────────────────────
export interface Competency {
  id: string
  name: string
  description: string | null
  category: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

// ─── Compétences d'un membre ──────────────────────────────────
export interface MemberCompetency {
  id: string
  member_id: string
  competency_id: string
  level: number           // 0-100
  is_validated: boolean
  validated_at: string | null
  validated_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joins
  competency?: Competency
}

// ─── Templates de questionnaire ───────────────────────────────
export interface QuestionnaireTemplate {
  id: string
  title: string
  description: string | null
  stage_log_id: string | null   // legacy typing
  stage_slug?: string | null
  experience_id?: string | null
  trigger_type?: string | null
  audience_type?: 'all' | 'selected_members' | 'groups'
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MemberGroup {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MemberGroupMember {
  id: string
  group_id: string
  member_id: string
  created_at: string
}

export interface QuestionnaireAssignment {
  id: string
  template_id: string
  member_id: string | null
  group_id: string | null
  created_by: string | null
  created_at: string
}

// ─── Questions d'un questionnaire ─────────────────────────────
export interface QuestionnaireQuestion {
  id: string
  template_id: string
  question_text: string
  question_type: 'text' | 'rating' | 'choice' | 'yesno'
  options: string[] | null      // for choice type
  is_required: boolean
  sort_order: number
  created_at: string
}

// ─── Soumission d'un questionnaire par un membre ──────────────
export interface QuestionnaireSubmission {
  id: string
  template_id: string
  member_id: string
  stage_log_id: string | null
  submitted_at: string
  // Joins
  template?: QuestionnaireTemplate
  answers?: QuestionnaireAnswer[]
}

// ─── Réponse à une question ───────────────────────────────────
export interface QuestionnaireAnswer {
  id: string
  submission_id: string
  question_id: string
  answer_text: string | null
  answer_rating: number | null
  answer_choice: string | null
  answer_yesno: boolean | null
  created_at: string
  // Joins
  question?: QuestionnaireQuestion
}

// ─── Entrée de journal de transformation ──────────────────────
export interface JournalEntry {
  id: string
  member_id: string
  stage_log_id: string | null
  title: string | null
  content: string
  entry_type: 'reflection' | 'free' | 'before' | 'after'
  image_url: string | null
  is_private: boolean
  created_at: string
  updated_at: string
}

// ─── Export PDF du livre de bord ──────────────────────────────
export interface BookExport {
  id: string
  member_id: string
  file_url: string | null
  status: 'pending' | 'ready' | 'error'
  created_at: string
}

// ─── Log des automations ──────────────────────────────────────
export interface AutomationLog {
  id: string
  trigger_type: string
  member_id: string | null
  stage_log_id: string | null
  payload: Json
  status: 'success' | 'error'
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────
export type ProfileWithStats = Profile & {
  stages_count: number
  last_stage_date: string | null
  reservations_count: number
}

// ─── Database Schema — format compatible Supabase JS v2 ───────
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
          diet_type: string | null
          food_allergies: string | null
          food_intolerances: string | null
          diet_notes: string | null
          logistics_notes: string | null
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
          diet_type?: string | null
          food_allergies?: string | null
          food_intolerances?: string | null
          diet_notes?: string | null
          logistics_notes?: string | null
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
          diet_type?: string | null
          food_allergies?: string | null
          food_intolerances?: string | null
          diet_notes?: string | null
          logistics_notes?: string | null
          role?: string
          newsletter_global?: boolean
          newsletter_stages?: boolean
          newsletter_spectacles?: boolean
          newsletter_blog?: boolean
          newsletter_amelie?: boolean
          updated_at?: string
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

          diet_type: string | null
          food_allergies: string | null
          food_intolerances: string | null
          diet_notes: string | null
          logistics_notes: string | null
          accommodation_type: string | null
          arrival_time: string | null
          departure_time: string | null

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

          diet_type?: string | null
          food_allergies?: string | null
          food_intolerances?: string | null
          diet_notes?: string | null
          logistics_notes?: string | null
          accommodation_type?: string | null
          arrival_time?: string | null
          departure_time?: string | null
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

          diet_type?: string | null
          food_allergies?: string | null
          food_intolerances?: string | null
          diet_notes?: string | null
          logistics_notes?: string | null
          accommodation_type?: string | null
          arrival_time?: string | null
          departure_time?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: Record<string, unknown> & {
          id: string
          content_type: string
          content_slug: string
          content_title: string
          member_id: string | null
          reservation_id: string | null
          first_name: string
          email: string
          rating: number
          comment: string
          is_published: boolean
          is_verified_participant: boolean
          published_at: string | null
          created_at: string
        }
        Insert: {
          content_type: string
          content_slug: string
          content_title: string
          member_id?: string | null
          reservation_id?: string | null
          first_name: string
          email: string
          rating: number
          comment: string
          is_published?: boolean
          is_verified_participant?: boolean
          published_at?: string | null
        }
        Update: {
          content_type?: string
          content_slug?: string
          content_title?: string
          member_id?: string | null
          reservation_id?: string | null
          first_name?: string
          email?: string
          rating?: number
          comment?: string
          is_published?: boolean
          is_verified_participant?: boolean
          published_at?: string | null
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
      competencies: {
        Row: Record<string, unknown> & {
          id: string
          name: string
          description: string | null
          category: string | null
          icon: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          name: string
          description?: string | null
          category?: string | null
          icon?: string | null
          sort_order?: number
        }
        Update: {
          name?: string
          description?: string | null
          category?: string | null
          icon?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      member_competencies: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          competency_id: string
          level: number
          is_validated: boolean
          validated_at: string | null
          validated_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          member_id: string
          competency_id: string
          level?: number
          is_validated?: boolean
          validated_at?: string | null
          validated_by?: string | null
          notes?: string | null
        }
        Update: {
          level?: number
          is_validated?: boolean
          validated_at?: string | null
          validated_by?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_templates: {
        Row: Record<string, unknown> & {
          id: string
          title: string
          description: string | null
          stage_log_id: string | null
          stage_slug: string | null
          experience_id: string | null
          trigger_type: string | null
          audience_type: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          stage_log_id?: string | null
          stage_slug?: string | null
          experience_id?: string | null
          trigger_type?: string | null
          audience_type?: string | null
          is_active?: boolean
          created_by?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          stage_log_id?: string | null
          stage_slug?: string | null
          experience_id?: string | null
          trigger_type?: string | null
          audience_type?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_questions: {
        Row: Record<string, unknown> & {
          id: string
          template_id: string
          question_text: string
          question_type: string
          options: Json | null
          is_required: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          template_id: string
          question_text: string
          question_type?: string
          options?: Json | null
          is_required?: boolean
          sort_order?: number
        }
        Update: {
          question_text?: string
          question_type?: string
          options?: Json | null
          is_required?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      questionnaire_submissions: {
        Row: Record<string, unknown> & {
          id: string
          template_id: string
          member_id: string
          stage_log_id: string | null
          submitted_at: string
        }
        Insert: {
          template_id: string
          member_id: string
          stage_log_id?: string | null
        }
        Update: {
          stage_log_id?: string | null
        }
        Relationships: []
      }
      questionnaire_answers: {
        Row: Record<string, unknown> & {
          id: string
          submission_id: string
          question_id: string
          answer_text: string | null
          answer_rating: number | null
          answer_choice: string | null
          answer_yesno: boolean | null
          selected_option_ids: string[] | null
          created_at: string
        }
        Insert: {
          submission_id: string
          question_id: string
          answer_text?: string | null
          answer_rating?: number | null
          answer_choice?: string | null
          answer_yesno?: boolean | null
          selected_option_ids?: string[] | null
        }
        Update: {
          answer_text?: string | null
          answer_rating?: number | null
          answer_choice?: string | null
          answer_yesno?: boolean | null
          selected_option_ids?: string[] | null
        }
        Relationships: []
      }
      member_groups: {
        Row: Record<string, unknown> & {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          is_active?: boolean
          created_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      member_group_members: {
        Row: Record<string, unknown> & {
          id: string
          group_id: string
          member_id: string
          created_at: string
        }
        Insert: {
          group_id: string
          member_id: string
        }
        Update: {
          group_id?: string
          member_id?: string
        }
        Relationships: []
      }
      questionnaire_assignments: {
        Row: Record<string, unknown> & {
          id: string
          template_id: string
          member_id: string | null
          group_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          template_id: string
          member_id?: string | null
          group_id?: string | null
          created_by?: string | null
        }
        Update: {
          member_id?: string | null
          group_id?: string | null
        }
        Relationships: []
      }
      question_options: {
        Row: Record<string, unknown> & {
          id: string
          question_id: string
          label: string | null
          value: string | null
          is_correct: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          question_id: string
          label?: string | null
          value?: string | null
          is_correct?: boolean
          sort_order?: number
        }
        Update: {
          label?: string | null
          value?: string | null
          is_correct?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      questionnaire_results: {
        Row: Record<string, unknown> & {
          id: string
          submission_id: string
          score: number
          max_score: number
          percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          submission_id: string
          score?: number
          max_score?: number
          percentage?: number
        }
        Update: {
          score?: number
          max_score?: number
          percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          stage_log_id: string | null
          title: string | null
          content: string
          entry_type: string
          image_url: string | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          member_id: string
          stage_log_id?: string | null
          title?: string | null
          content: string
          entry_type?: string
          image_url?: string | null
          is_private?: boolean
        }
        Update: {
          stage_log_id?: string | null
          title?: string | null
          content?: string
          entry_type?: string
          image_url?: string | null
          is_private?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      book_exports: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          file_url: string | null
          status: string
          created_at: string
        }
        Insert: {
          member_id: string
          file_url?: string | null
          status?: string
        }
        Update: {
          file_url?: string | null
          status?: string
        }
        Relationships: []
      }
      automation_logs: {
        Row: Record<string, unknown> & {
          id: string
          trigger_type: string
          member_id: string | null
          stage_log_id: string | null
          payload: Json
          status: string
          created_at: string
        }
        Insert: {
          trigger_type: string
          member_id?: string | null
          stage_log_id?: string | null
          payload?: Json
          status?: string
        }
        Update: {
          status?: string
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
