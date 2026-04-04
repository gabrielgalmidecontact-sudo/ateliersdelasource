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
  level: number
  notes: string | null
  is_validated: boolean
  validated_at: string | null
  validated_by: string | null
  created_at: string
  updated_at: string
  // join
  competency?: Competency
}

// ─── Snapshot de compétence (historique progression) ──────────
export interface CompetencySnapshot {
  id: string
  member_id: string
  competency_id: string
  value: number
  source: 'admin' | 'questionnaire' | 'auto'
  note: string | null
  created_at: string
  // join
  competency?: Competency
}

// ─── Expérience (entité centrale Phase 2) ─────────────────────
export interface Experience {
  id: string
  title: string
  type: 'stage' | 'formation' | 'activite' | 'exercice' | 'validation' | 'accompagnement' | 'autre'
  description: string | null
  start_date: string | null
  end_date: string | null
  trainer: string | null
  max_participants: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Participation d'un membre à une expérience ────────────────
export interface MemberExperience {
  id: string
  member_id: string
  experience_id: string
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  intention_before: string | null
  reflection_after: string | null
  key_insight: string | null
  rating: number | null
  created_at: string
  updated_at: string
  // join
  experience?: Experience
}

// ─── Entrée de timeline unifiée ───────────────────────────────
export interface TimelineEntry {
  id: string
  member_id: string
  type: 'experience' | 'note' | 'questionnaire' | 'competency' | 'guidance' | 'journal'
  title: string
  content: string | null
  metadata: Json | null
  source_id: string | null  // id de l'entité source (stage_log_id, etc.)
  created_at: string
}

// ─── Questionnaire template ───────────────────────────────────
export interface QuestionnaireTemplate {
  id: string
  title: string
  description: string | null
  stage_log_id: string | null
  experience_id: string | null  // Phase 2 — lié à une expérience
  trigger_type: 'before' | 'after' | 'reflection' | 'exercise' | null  // Phase 2
  is_active: boolean
  created_by: string | null
  created_at: string
}

// ─── Question de questionnaire ────────────────────────────────
export interface QuestionnaireQuestion {
  id: string
  template_id: string
  question_text: string
  question_type: 'text' | 'rating' | 'multiple_choice' | 'yes_no'
  options: Json | null
  is_required: boolean
  sort_order: number
  created_at: string
}

// ─── Soumission de questionnaire ─────────────────────────────
export interface QuestionnaireSubmission {
  id: string
  template_id: string
  member_id: string
  stage_log_id: string | null
  member_experience_id: string | null  // Phase 2
  submitted_at: string
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
}

// ─── Entrée de journal (transformation) ──────────────────────
export interface JournalEntry {
  id: string
  member_id: string
  stage_log_id: string | null
  member_experience_id: string | null  // Phase 2
  title: string | null
  content: string
  entry_type: string
  image_url: string | null
  is_private: boolean
  created_at: string
  updated_at: string
}

// ─── Export PDF ───────────────────────────────────────────────
export interface BookExport {
  id: string
  member_id: string
  file_url: string | null
  status: string
  created_at: string
}

// ─── Log d'automatisation ─────────────────────────────────────
export interface AutomationLog {
  id: string
  trigger_type: string
  member_id: string | null
  stage_log_id: string | null
  member_experience_id: string | null  // Phase 2
  payload: Json
  status: string
  created_at: string
}

// ─── Type agrégé — profil avec stats ─────────────────────────
export interface ProfileWithStats extends Profile {
  stages_count?: number
  last_stage_date?: string | null
}

// ─── Database schema (Supabase JS v2) ────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
        Relationships: []
      }
      stage_logs: {
        Row: StageLog
        Insert: Omit<StageLog, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<StageLog, 'id' | 'member_id'>>
        Relationships: []
      }
      member_notes: {
        Row: MemberNote
        Insert: Omit<MemberNote, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<MemberNote, 'id' | 'member_id'>>
        Relationships: []
      }
      trainer_notes: {
        Row: TrainerNote
        Insert: Omit<TrainerNote, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<TrainerNote, 'id' | 'member_id'>>
        Relationships: []
      }
      reservations: {
        Row: Reservation
        Insert: Omit<Reservation, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Reservation, 'id' | 'member_id'>>
        Relationships: []
      }
      member_global_notes: {
        Row: Record<string, unknown> & { id: string; user_id: string; content: string; created_at: string }
        Insert: { user_id: string; content: string; created_at?: string }
        Update: { content?: string }
        Relationships: []
      }
      competencies: {
        Row: Competency
        Insert: Omit<Competency, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Competency, 'id'>>
        Relationships: []
      }
      member_competencies: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          competency_id: string
          level: number
          notes: string | null
          is_validated: boolean
          validated_at: string | null
          validated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          member_id: string
          competency_id: string
          level?: number
          notes?: string | null
          is_validated?: boolean
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          level?: number
          notes?: string | null
          is_validated?: boolean
          validated_at?: string | null
          validated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      competency_snapshots: {
        Row: CompetencySnapshot
        Insert: Omit<CompetencySnapshot, 'id' | 'created_at' | 'competency'> & { id?: string; created_at?: string }
        Update: Partial<Pick<CompetencySnapshot, 'value' | 'note'>>
        Relationships: []
      }
      experiences: {
        Row: Experience
        Insert: Omit<Experience, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<Experience, 'id'>>
        Relationships: []
      }
      member_experiences: {
        Row: MemberExperience
        Insert: Omit<MemberExperience, 'id' | 'created_at' | 'updated_at' | 'experience'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<MemberExperience, 'id' | 'member_id' | 'experience_id' | 'experience'>>
        Relationships: []
      }
      timeline_entries: {
        Row: TimelineEntry
        Insert: Omit<TimelineEntry, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<TimelineEntry, 'id' | 'member_id'>>
        Relationships: []
      }
      questionnaire_templates: {
        Row: Record<string, unknown> & {
          id: string
          title: string
          description: string | null
          stage_log_id: string | null
          experience_id: string | null
          trigger_type: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          title: string
          description?: string | null
          stage_log_id?: string | null
          experience_id?: string | null
          trigger_type?: string | null
          is_active?: boolean
          created_by?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          is_active?: boolean
          experience_id?: string | null
          trigger_type?: string | null
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
          member_experience_id: string | null
          submitted_at: string
        }
        Insert: {
          template_id: string
          member_id: string
          stage_log_id?: string | null
          member_experience_id?: string | null
        }
        Update: {
          stage_log_id?: string | null
          member_experience_id?: string | null
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
          created_at: string
        }
        Insert: {
          submission_id: string
          question_id: string
          answer_text?: string | null
          answer_rating?: number | null
          answer_choice?: string | null
          answer_yesno?: boolean | null
        }
        Update: {
          answer_text?: string | null
          answer_rating?: number | null
          answer_choice?: string | null
          answer_yesno?: boolean | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: Record<string, unknown> & {
          id: string
          member_id: string
          stage_log_id: string | null
          member_experience_id: string | null
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
          member_experience_id?: string | null
          title?: string | null
          content: string
          entry_type?: string
          image_url?: string | null
          is_private?: boolean
        }
        Update: {
          stage_log_id?: string | null
          member_experience_id?: string | null
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
          member_experience_id: string | null
          payload: Json
          status: string
          created_at: string
        }
        Insert: {
          trigger_type: string
          member_id?: string | null
          stage_log_id?: string | null
          member_experience_id?: string | null
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
