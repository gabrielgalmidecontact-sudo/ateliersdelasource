'use client'
// src/features/admin/AdminMemberDetailPage.tsx
// Espace accompagnant — fiche complète d'un membre (parcours, guidances, compétences, questionnaires)
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, User, FileText, Calendar, BookOpen, Plus, Save,
  Eye, EyeOff, Star, Lightbulb, CheckCircle, Circle, Award
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { AdminBeginnerMode } from '@/features/admin/AdminBeginnerMode'
import type {
  Profile, StageLog, TrainerNote, Reservation, MemberNote,
  MemberCompetency, Competency, QuestionnaireSubmission
} from '@/lib/supabase/types'

type FullMemberData = {
  profile: Profile
  stages: (StageLog & { member_notes: MemberNote[] })[]
  trainerNotes: TrainerNote[]
  reservations: Reservation[]
  competencies: MemberCompetency[]
  submissions: (QuestionnaireSubmission & { template?: { title: string } })[]
}

const CATEGORY_OPTIONS = [
  { value: 'observation',    label: 'Observation' },
  { value: 'encouragement',  label: 'Encouragement' },
  { value: 'piste',          label: 'Piste à explorer' },
  { value: 'recommendation', label: 'Recommandation' },
  { value: 'general',        label: 'Note générale' },
]

const STATUS_COLORS: Record<string, string> = {
  upcoming:  'bg-[#FFF8E8] text-[#C8912A] border border-[#E0B060]',
  completed: 'bg-[#F0F5EC] text-[#4A5E3A] border border-[#B8D4A8]',
  cancelled: 'bg-[#F5F5F5] text-[#7A6355] border border-[#D4C4A8]',
}

const STATUS_LABELS: Record<string, string> = {
  upcoming:  'À venir',
  completed: 'Effectué',
  cancelled: 'Annulé',
}

function StarDisplay({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={14}
          className={n <= value ? 'text-[#C8912A]' : 'text-[#D4C4A8]'}
          fill={n <= value ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function formatDietType(value: string | null | undefined) {
  switch (value) {
    case 'omnivore':
      return 'Omnivore'
    case 'vegetarian':
      return 'Végétarien'
    case 'vegan':
      return 'Végan'
    case 'pescatarian':
      return 'Pescétarien'
    case 'no_preference':
      return 'Sans préférence'
    case 'other':
      return 'Autre'
    default:
      return '—'
  }
}

function formatAccommodation(value: string | null | undefined) {
  switch (value) {
    case 'shared':
      return 'Chambre partagée'
    case 'private':
      return 'Chambre individuelle'
    case 'external':
      return 'Hébergement externe'
    default:
      return '—'
  }
}

function CompetencyBar({ mc }: { mc: MemberCompetency & { competency?: Competency } }) {
  const comp = mc.competency
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {comp?.icon && <span className="text-sm">{comp.icon}</span>}
          <span className="text-xs font-sans font-medium text-[#5C3D2E]">{comp?.name || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-[#7A6355]">{mc.level}%</span>
          {mc.is_validated ? (
            <CheckCircle size={13} className="text-[#4A5E3A]" aria-label={`Validé par ${mc.validated_by}`} />
          ) : (
            <Circle size={13} className="text-[#D4C4A8]" aria-label="Non validé" />
          )}
        </div>
      </div>
      <div className="w-full bg-[#F0E8DA] rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${mc.level}%`, backgroundColor: mc.is_validated ? '#4A5E3A' : '#C8912A' }}
        />
      </div>
      {mc.notes && (
        <p className="text-[10px] font-sans text-[#7A6355] mt-0.5 italic">{mc.notes}</p>
      )}
    </div>
  )
}

export function AdminMemberDetailPage({ memberId }: { memberId: string }) {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<FullMemberData | null>(null)
  const [allCompetencies, setAllCompetencies] = useState<Competency[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'suivi' | 'guidances' | 'competences' | 'questionnaires' | 'reservations' | 'profil'>('suivi')
  const [newNote, setNewNote] = useState({ content: '', category: 'general', visible: true, stageLogId: '' })
  const [addingNote, setAddingNote] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [visiblePage, setVisiblePage] = useState(true)

  // Modal stage
  const [stageModal, setStageModal] = useState(false)
  const [stageForm, setStageForm] = useState({
    stage_title: '',
    stage_date: new Date().toISOString().split('T')[0],
    trainer: 'Gabriel',
    status: 'upcoming' as 'upcoming' | 'completed' | 'cancelled',
  })
  const [savingStage, setSavingStage] = useState(false)

  // Modal compétence
  const [compModal, setCompModal] = useState(false)
  const [compForm, setCompForm] = useState({
    competency_id: '',
    level: 50,
    is_validated: false,
    notes: '',
  })
  const [savingComp, setSavingComp] = useState(false)

  useEffect(() => { setVisiblePage(true) }, [])

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const loadMember = useCallback(async () => {
    if (!user) return
    try {
      // Refresh session pour avoir un token valide
      const { supabase: sbClient } = await import('@/lib/supabase/client').then(m => ({ supabase: m.supabase }))
      const { data: { session } } = await sbClient.auth.getSession()
      const token = session?.access_token || user.accessToken

      const res = await fetch(`/api/admin/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const d = await res.json()
        setData(d)
      } else {
        const errData = await res.json().catch(() => ({}))
        console.error('[AdminMemberDetail] Erreur API:', res.status, errData)
        // 403 = token expiré ou non admin — on retente avec la session fraîche
        if (res.status === 403 || res.status === 401) {
          console.warn('[AdminMemberDetail] Token potentiellement expiré, retenter dans 1s')
        }
      }
    } catch (e) {
      console.error('[AdminMemberDetail] Erreur réseau:', e)
    }
    setLoading(false)
  }, [user, memberId])

  const loadCompetencies = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/admin/competencies', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setAllCompetencies(d.competencies || [])
    }
  }, [user])

  useEffect(() => {
    if (user && isAdmin) {
      loadMember()
      loadCompetencies()
    }
  }, [user, isAdmin, loadMember, loadCompetencies])

  async function addTrainerNote() {
    if (!newNote.content || !user) return
    setSavingNote(true)
    const res = await fetch('/api/admin/trainer-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({
        member_id: memberId,
        stage_log_id: newNote.stageLogId || null,
        content: newNote.content,
        category: newNote.category,
        is_visible_to_member: newNote.visible,
      }),
    })
    setSavingNote(false)
    if (res.ok) {
      setAddingNote(false)
      setNewNote({ content: '', category: 'general', visible: true, stageLogId: '' })
      loadMember()
    }
  }

  async function createStageLog() {
    if (!user || !stageForm.stage_title || !stageForm.stage_date) return
    setSavingStage(true)
    const res = await fetch(`/api/admin/members/${memberId}/add-stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({
        member_id: memberId,
        stage_title: stageForm.stage_title,
        stage_date: stageForm.stage_date,
        stage_slug: stageForm.stage_title.toLowerCase().normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        trainer: stageForm.trainer,
        status: stageForm.status,
      }),
    })
    setSavingStage(false)
    if (res.ok) {
      setStageModal(false)
      setStageForm({ stage_title: '', stage_date: new Date().toISOString().split('T')[0], trainer: 'Gabriel', status: 'upcoming' })
      loadMember()
    }
  }

  async function saveCompetency() {
    if (!user || !compForm.competency_id) return
    setSavingComp(true)
    const res = await fetch(`/api/admin/members/${memberId}/competencies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify(compForm),
    })
    setSavingComp(false)
    if (res.ok) {
      setCompModal(false)
      setCompForm({ competency_id: '', level: 50, is_validated: false, notes: '' })
      loadMember()
    }
  }

  if (isLoading || !user || loading) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="text-center">
        <p className="font-sans text-[#7A6355] mb-4">Membre introuvable.</p>
        <Link href="/admin/membres" className="text-sm font-sans text-[#C8912A] hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    </div>
  )

  const { profile, stages, trainerNotes, reservations, competencies, submissions } = data
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email
  const initials = [(profile.first_name || '?')[0], (profile.last_name || '')[0]].filter(Boolean).join('').toUpperCase()

  // Compétences déjà assignées
  const assignedCompIds = new Set(competencies.map(c => c.competency_id))
  const availableComps = allCompetencies.filter(c => !assignedCompIds.has(c.id))
  // Permettre aussi de re-modifier une compétence déjà assignée
  const allCompsForSelect = allCompetencies

  const TABS = [
    { id: 'suivi',         label: 'Parcours',       count: stages.length },
    { id: 'guidances',     label: 'Guidances',      count: trainerNotes.length },
    { id: 'competences',   label: 'Compétences',    count: competencies.length },
    { id: 'questionnaires',label: 'Questionnaires', count: submissions.length },
    { id: 'reservations',  label: 'Réservations',   count: reservations.length },
    { id: 'profil',        label: 'Profil',         count: null },
  ] as const

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header admin */}
      <div className="bg-[#3B2315] border-b border-[#5C3D2E]">
        <Container>
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/admin/membres" className="text-[#C8A888] hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <Link href="/" className="font-serif text-base text-[#F5EDD8] hover:text-[#C8912A] transition-colors">
                Les Ateliers de la Source
              </Link>
              <span className="text-[#7A6355]">/</span>
              <Link href="/admin" className="text-sm font-sans text-[#C8A888] hover:text-white transition-colors">Admin</Link>
              <span className="text-[#7A6355]">/</span>
              <Link href="/admin/membres" className="text-sm font-sans text-[#C8A888] hover:text-white transition-colors">Membres</Link>
              <span className="text-[#7A6355]">/</span>
              <span className="text-sm font-sans text-white">{name}</span>
            </div>
            <AdminBeginnerMode />
          </div>
        </Container>
      </div>

      <div className="py-8">
        <Container>
          <div style={{ opacity: visiblePage ? 1 : 0, transform: visiblePage ? 'none' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>

            {/* Profil header */}
            <div className="bg-white rounded-sm border border-[#D4C4A8] mb-6 overflow-hidden">
              <div className="bg-[#3B2315] px-6 py-3">
                <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A]">Espace accompagnant</p>
              </div>
              <div className="p-6 flex items-start gap-5 flex-wrap">
                <div className="w-16 h-16 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white font-serif text-2xl flex-shrink-0">
                  {initials || <User size={28} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-serif text-2xl text-[#5C3D2E]">{name}</h1>
                  <p className="text-sm font-sans text-[#7A6355]">{profile.email}</p>
                  {profile.phone && <p className="text-sm font-sans text-[#7A6355]">{profile.phone}</p>}
                  {profile.city && <p className="text-xs font-sans text-[#7A6355] mt-0.5">📍 {profile.city}</p>}
                  <p className="text-xs font-sans text-[#C8A888] mt-1">
                    Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { v: stages.length, l: 'Expériences' },
                    { v: trainerNotes.length, l: 'Guidances' },
                    { v: competencies.filter(c => c.is_validated).length, l: 'Compétences validées' },
                    { v: stages.filter(s => s.status === 'completed').length, l: 'Effectués' },
                  ].map(s => (
                    <div key={s.l} className="text-center px-4 py-3 bg-[#F5EDD8] rounded-sm border border-[#E8D8B8]">
                      <div className="font-serif text-2xl text-[#5C3D2E]">{s.v}</div>
                      <div className="text-xs font-sans text-[#7A6355]">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Motivation / Bio */}
            {(profile.motivation || profile.bio) && (
              <div className="bg-[#F5EDD8] rounded-sm border border-[#D4C4A8] p-5 mb-6">
                {profile.motivation && (
                  <div className="mb-3">
                    <p className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mb-1">Motivation</p>
                    <p className="text-sm font-sans text-[#5C3D2E] italic">&ldquo;{profile.motivation}&rdquo;</p>
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <p className="text-xs font-sans uppercase tracking-widest text-[#7A6355] mb-1">Bio</p>
                    <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-[#D4C4A8] overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-sans whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'text-[#C8912A] border-[#C8912A]'
                      : 'text-[#7A6355] border-transparent hover:text-[#5C3D2E]'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="text-xs bg-[#F5EDD8] text-[#7A6355] px-1.5 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab Parcours ── */}
            {activeTab === 'suivi' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-xl text-[#5C3D2E]">Parcours de {profile.first_name || 'ce membre'}</h2>
                  <Button size="sm" variant="primary" onClick={() => setStageModal(true)}>
                    <Plus size={14} /> Ajouter une expérience
                  </Button>
                </div>

                {stages.length === 0 ? (
                  <div className="bg-white rounded-sm border border-[#D4C4A8] p-10 text-center">
                    <FileText size={32} className="text-[#D4C4A8] mx-auto mb-3" />
                    <p className="font-serif text-lg text-[#7A6355]">Aucune fiche de suivi</p>
                    <p className="text-sm font-sans text-[#7A6355] mt-1">Ajoutez une expérience pour commencer le suivi.</p>
                  </div>
                ) : stages.map(stage => (
                  <div key={stage.id} className="bg-white rounded-sm border border-[#D4C4A8] p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif text-lg text-[#5C3D2E]">{stage.stage_title}</h3>
                          <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${STATUS_COLORS[stage.status]}`}>
                            {STATUS_LABELS[stage.status] || stage.status}
                          </span>
                        </div>
                        <p className="text-xs font-sans text-[#7A6355]">
                          {new Date(stage.stage_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' · Avec '}{stage.trainer}
                        </p>
                        {stage.rating && <StarDisplay value={stage.rating} />}
                      </div>
                    </div>

                    {stage.intention_before && (
                      <div className="mb-3 p-3 bg-[#FAF6EF] rounded-sm">
                        <p className="text-xs font-sans uppercase tracking-wider text-[#C8912A] mb-1">Intention avant</p>
                        <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{stage.intention_before}</p>
                      </div>
                    )}
                    {stage.reflection_after && (
                      <div className="mb-3 p-3 bg-[#F0F5EC] rounded-sm">
                        <p className="text-xs font-sans uppercase tracking-wider text-[#4A5E3A] mb-1">Réflexion après</p>
                        <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{stage.reflection_after}</p>
                      </div>
                    )}
                    {stage.key_insight && (
                      <div className="mb-3 p-3 bg-[#FFF8E8] rounded-sm border border-[#E0B060] flex items-start gap-3">
                        <Lightbulb size={15} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-sans uppercase tracking-wider text-[#C8912A] mb-1">Insight clé</p>
                          <p className="text-sm font-sans italic text-[#5C3D2E]">« {stage.key_insight} »</p>
                        </div>
                      </div>
                    )}

                    {stage.member_notes && stage.member_notes.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-2">
                          Notes du membre ({stage.member_notes.length})
                        </p>
                        {stage.member_notes.map(note => (
                          <div key={note.id} className="mb-2 p-3 bg-[#FAF6EF] border border-[#D4C4A8]/50 rounded-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-[#5C3D2E]">{note.title}</span>
                              {note.is_private
                                ? <EyeOff size={11} className="text-[#7A6355]" />
                                : <Eye size={11} className="text-[#4A5E3A]" />}
                            </div>
                            <p className="text-xs font-sans text-[#7A6355] leading-relaxed">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab Guidances ── */}
            {activeTab === 'guidances' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-xl text-[#5C3D2E]">Mes guidances</h2>
                  <Button size="sm" variant="primary" onClick={() => setAddingNote(v => !v)}>
                    <Plus size={14} /> Ajouter une guidance
                  </Button>
                </div>

                {addingNote && (
                  <div className="bg-white rounded-sm border border-[#C8912A]/30 p-5 space-y-3">
                    <h3 className="font-serif text-lg text-[#5C3D2E]">Nouvelle guidance</h3>
                    <textarea
                      className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[100px] focus:outline-none focus:border-[#C8912A]"
                      placeholder="Observation, encouragement, piste à explorer…"
                      value={newNote.content}
                      onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))}
                    />
                    <div className="flex gap-3 flex-wrap items-center">
                      <select
                        value={newNote.category}
                        onChange={e => setNewNote(p => ({ ...p, category: e.target.value }))}
                        className="text-sm font-sans border border-[#D4C4A8] rounded-sm px-3 py-2 focus:outline-none focus:border-[#C8912A]"
                      >
                        {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>

                      {stages.length > 0 && (
                        <select
                          value={newNote.stageLogId}
                          onChange={e => setNewNote(p => ({ ...p, stageLogId: e.target.value }))}
                          className="text-sm font-sans border border-[#D4C4A8] rounded-sm px-3 py-2 focus:outline-none focus:border-[#C8912A]"
                        >
                          <option value="">Note générale</option>
                          {stages.map(s => <option key={s.id} value={s.id}>{s.stage_title}</option>)}
                        </select>
                      )}

                      <label className="flex items-center gap-2 text-sm font-sans text-[#7A6355] cursor-pointer">
                        <input type="checkbox" checked={newNote.visible}
                          onChange={e => setNewNote(p => ({ ...p, visible: e.target.checked }))}
                          className="accent-[#C8912A]"
                        />
                        Visible par le membre
                      </label>

                      <Button size="sm" variant="primary" onClick={addTrainerNote} disabled={savingNote}>
                        <Save size={13} /> {savingNote ? 'Enregistrement…' : 'Enregistrer'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingNote(false)}>Annuler</Button>
                    </div>
                  </div>
                )}

                {trainerNotes.length === 0 && !addingNote ? (
                  <div className="bg-white rounded-sm border border-[#D4C4A8] p-10 text-center">
                    <BookOpen size={32} className="text-[#D4C4A8] mx-auto mb-3" />
                    <p className="font-serif text-lg text-[#7A6355]">Aucune guidance pour le moment</p>
                  </div>
                ) : trainerNotes.map(note => (
                  <div key={note.id} className="bg-white rounded-sm border border-[#D4C4A8] p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-sans font-medium text-[#5C3D2E]">{note.trainer_name}</span>
                        <span className="text-xs font-sans bg-[#F5EDD8] text-[#7A6355] px-2 py-0.5 rounded-full">
                          {CATEGORY_OPTIONS.find(o => o.value === note.category)?.label || note.category}
                        </span>
                        {note.is_visible_to_member
                          ? <span className="text-xs font-sans text-[#4A5E3A] flex items-center gap-1"><Eye size={11} /> Visible</span>
                          : <span className="text-xs font-sans text-[#7A6355] flex items-center gap-1"><EyeOff size={11} /> Privée</span>}
                      </div>
                      <span className="text-xs font-sans text-[#7A6355] flex-shrink-0">
                        {new Date(note.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab Compétences ── */}
            {activeTab === 'competences' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-xl text-[#5C3D2E]">Compétences de {profile.first_name || 'ce membre'}</h2>
                  <Button size="sm" variant="primary" onClick={() => {
                    setCompForm({ competency_id: allCompsForSelect[0]?.id || '', level: 50, is_validated: false, notes: '' })
                    setCompModal(true)
                  }}>
                    <Award size={14} /> Attribuer une compétence
                  </Button>
                </div>

                {competencies.length === 0 ? (
                  <div className="bg-white rounded-sm border border-[#D4C4A8] p-10 text-center">
                    <Award size={32} className="text-[#D4C4A8] mx-auto mb-3" />
                    <p className="font-serif text-lg text-[#7A6355]">Aucune compétence enregistrée</p>
                    <p className="text-sm font-sans text-[#7A6355] mt-1">
                      Attribuez des compétences après une expérience.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {competencies.map(mc => (
                      <div key={mc.id} className="bg-white rounded-sm border border-[#D4C4A8] p-4">
                        <CompetencyBar mc={mc as MemberCompetency & { competency?: Competency }} />
                        {mc.is_validated && mc.validated_at && (
                          <p className="text-[10px] font-sans text-[#4A5E3A] mt-2">
                            ✓ Validé par {mc.validated_by} — {new Date(mc.validated_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setCompForm({
                              competency_id: mc.competency_id,
                              level: mc.level,
                              is_validated: mc.is_validated,
                              notes: mc.notes || '',
                            })
                            setCompModal(true)
                          }}
                          className="mt-2 text-[11px] font-sans text-[#C8912A] hover:underline"
                        >
                          Modifier
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Compétences disponibles à attribuer */}
                {availableComps.length > 0 && (
                  <div className="mt-6 p-4 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
                    <p className="text-xs font-sans uppercase tracking-widest text-[#7A6355] mb-3">
                      Compétences du référentiel non encore attribuées
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableComps.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCompForm({ competency_id: c.id, level: 0, is_validated: false, notes: '' })
                            setCompModal(true)
                          }}
                          className="flex items-center gap-1.5 text-xs font-sans text-[#5C3D2E] bg-white border border-[#D4C4A8] hover:border-[#C8912A] px-3 py-1.5 rounded-sm transition-colors"
                        >
                          {c.icon && <span>{c.icon}</span>}
                          {c.name}
                          <Plus size={11} className="text-[#C8912A]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab Questionnaires ── */}
            {activeTab === 'questionnaires' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-xl text-[#5C3D2E]">Questionnaires soumis</h2>
                  <Link
                    href="/admin/questionnaires"
                    className="text-xs font-sans text-[#C8912A] hover:underline flex items-center gap-1"
                  >
                    Gérer les questionnaires →
                  </Link>
                </div>

                {submissions.length === 0 ? (
                  <div className="bg-white rounded-sm border border-[#D4C4A8] p-10 text-center">
                    <FileText size={32} className="text-[#D4C4A8] mx-auto mb-3" />
                    <p className="font-serif text-lg text-[#7A6355]">Aucun questionnaire rempli</p>
                    <p className="text-sm font-sans text-[#7A6355] mt-1">
                      Créez un questionnaire et envoyez-le au membre.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map(sub => (
                      <div key={sub.id} className="bg-white rounded-sm border border-[#D4C4A8] p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-sans font-medium text-[#5C3D2E]">
                            {sub.template?.title || 'Questionnaire'}
                          </p>
                          <p className="text-xs font-sans text-[#7A6355]">
                            Soumis le {new Date(sub.submitted_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <CheckCircle size={16} className="text-[#4A5E3A]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab Réservations ── */}
            {activeTab === 'reservations' && (
              <div>
                <h2 className="font-serif text-xl text-[#5C3D2E] mb-4">Réservations</h2>
                {reservations.length === 0 ? (
                  <div className="bg-white rounded-sm border border-[#D4C4A8] p-10 text-center">
                    <Calendar size={32} className="text-[#D4C4A8] mx-auto mb-3" />
                    <p className="font-serif text-lg text-[#7A6355]">Aucune réservation</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reservations.map(res => (
                      <div key={res.id} className="bg-white rounded-sm border border-[#D4C4A8] p-5 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#5C3D2E] rounded-sm flex flex-col items-center justify-center text-white flex-shrink-0">
                            <span className="font-serif text-lg font-bold leading-none">
                              {new Date(res.event_date).getDate()}
                            </span>
                            <span className="text-[10px] text-[#C8912A]">
                              {new Date(res.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-base text-[#5C3D2E]">{res.event_title}</h3>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${STATUS_COLORS[res.status] || 'bg-[#F5F5F5] text-[#7A6355]'}`}>
                                {res.status}
                              </span>
                              <span className="text-xs font-sans text-[#7A6355]">
                                {res.payment_status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#FAF6EF] p-4 rounded-sm border border-[#D4C4A8]/50 space-y-2">
                          <p className="text-xs uppercase tracking-wider text-[#7A6355]">
                            Logistique & accueil
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                            <div>
                              <span className="text-[#7A6355]">Régime :</span>{' '}
                              <span className="text-[#2D1F14]">{formatDietType(res.diet_type)}</span>
                            </div>

                            <div>
                              <span className="text-[#7A6355]">Allergies :</span>{' '}
                              <span className="text-[#2D1F14]">{res.food_allergies || '—'}</span>
                            </div>

                            <div>
                              <span className="text-[#7A6355]">Intolérances :</span>{' '}
                              <span className="text-[#2D1F14]">{res.food_intolerances || '—'}</span>
                            </div>

                            <div>
                              <span className="text-[#7A6355]">Hébergement :</span>{' '}
                              <span className="text-[#2D1F14]">{formatAccommodation(res.accommodation_type)}</span>
                            </div>

                            <div>
                              <span className="text-[#7A6355]">Arrivée :</span>{' '}
                              <span className="text-[#2D1F14]">{res.arrival_time || '—'}</span>
                            </div>

                            <div>
                              <span className="text-[#7A6355]">Départ :</span>{' '}
                              <span className="text-[#2D1F14]">{res.departure_time || '—'}</span>
                            </div>
                          </div>

                          {res.diet_notes && (
                            <p className="text-xs text-[#5C3D2E] italic">“{res.diet_notes}”</p>
                          )}

                          {res.logistics_notes && (
                            <p className="text-xs text-[#5C3D2E] italic">“{res.logistics_notes}”</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab Profil ── */}
            {activeTab === 'profil' && (
              <div className="space-y-4">
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                  <h2 className="font-serif text-xl text-[#5C3D2E] mb-5">Informations du membre</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm font-sans">
                    {[
                      { label: 'Prénom', value: profile.first_name },
                      { label: 'Nom', value: profile.last_name },
                      { label: 'Email', value: profile.email },
                      { label: 'Téléphone', value: profile.phone },
                      { label: 'Ville', value: profile.city },
                      { label: 'Rôle', value: profile.role },
                      { label: 'Inscrit le', value: new Date(profile.created_at).toLocaleDateString('fr-FR') },
                      { label: 'Newsletter', value: profile.newsletter_global ? 'Abonné·e' : 'Non abonné·e' },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-0.5">{item.label}</p>
                        <p className="text-[#2D1F14]">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                  {profile.motivation && (
                    <div className="mt-6 pt-5 border-t border-[#D4C4A8]">
                      <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-2">Motivation</p>
                      <p className="text-sm italic text-[#5C3D2E]">&ldquo;{profile.motivation}&rdquo;</p>
                    </div>
                  )}
                  {profile.bio && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-2">Bio</p>
                      <p className="text-sm text-[#2D1F14] leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                  <div className="mb-5">
                    <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">Logistique & accueil</h2>
                    <p className="text-sm font-sans text-[#7A6355] leading-relaxed">
                      Informations utiles pour préparer l’accueil, les repas et l’organisation des stages ou séjours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm font-sans">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-0.5">Régime alimentaire</p>
                      <p className="text-[#2D1F14]">{formatDietType(profile.diet_type)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-0.5">Allergies alimentaires</p>
                      <p className="text-[#2D1F14]">{profile.food_allergies || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-0.5">Intolérances ou sensibilités</p>
                      <p className="text-[#2D1F14]">{profile.food_intolerances || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-0.5">Précisions alimentaires</p>
                      <p className="text-[#2D1F14]">{profile.diet_notes || '—'}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-[#D4C4A8]">
                    <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-2">Remarques logistiques utiles</p>
                    <p className="text-sm text-[#2D1F14] leading-relaxed">{profile.logistics_notes || '—'}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </Container>
      </div>

      {/* Modal : Ajouter une expérience */}
      <Modal isOpen={stageModal} onClose={() => setStageModal(false)} title="Ajouter une fiche de suivi" size="md">
        <div className="space-y-4">
          <Input
            label="Titre de l'expérience *"
            name="stage_title"
            value={stageForm.stage_title}
            onChange={e => setStageForm(p => ({ ...p, stage_title: e.target.value }))}
            placeholder="Ex : Théâtre des Doubles Karmiques"
            required
          />
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5" htmlFor="stage_date">Date *</label>
            <input id="stage_date" type="date" value={stageForm.stage_date}
              onChange={e => setStageForm(p => ({ ...p, stage_date: e.target.value }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5" htmlFor="trainer">Formateur</label>
            <select id="trainer" value={stageForm.trainer}
              onChange={e => setStageForm(p => ({ ...p, trainer: e.target.value }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
            >
              <option value="Gabriel">Gabriel</option>
              <option value="Amélie">Amélie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5" htmlFor="status">Statut</label>
            <select id="status" value={stageForm.status}
              onChange={e => setStageForm(p => ({ ...p, status: e.target.value as 'upcoming' | 'completed' | 'cancelled' }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
            >
              <option value="upcoming">À venir</option>
              <option value="completed">Effectué</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" onClick={createStageLog}
              disabled={savingStage || !stageForm.stage_title || !stageForm.stage_date}
            >
              {savingStage ? 'Enregistrement…' : 'Créer la fiche'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setStageModal(false)}>Annuler</Button>
          </div>
        </div>
      </Modal>

      {/* Modal : Attribuer une compétence */}
      <Modal isOpen={compModal} onClose={() => setCompModal(false)} title="Attribuer une compétence" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Compétence</label>
            <select
              value={compForm.competency_id}
              onChange={e => setCompForm(p => ({ ...p, competency_id: e.target.value }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
            >
              <option value="">— Choisir —</option>
              {allCompsForSelect.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">
              Niveau : {compForm.level}%
            </label>
            <input
              type="range" min={0} max={100} step={5}
              value={compForm.level}
              onChange={e => setCompForm(p => ({ ...p, level: Number(e.target.value) }))}
              className="w-full accent-[#C8912A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Notes (optionnel)</label>
            <textarea
              value={compForm.notes}
              onChange={e => setCompForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[70px] focus:outline-none focus:border-[#C8912A]"
              placeholder="Observation sur cette compétence…"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-sans text-[#5C3D2E] cursor-pointer">
            <input
              type="checkbox"
              checked={compForm.is_validated}
              onChange={e => setCompForm(p => ({ ...p, is_validated: e.target.checked }))}
              className="accent-[#4A5E3A]"
            />
            Marquer comme validée
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" onClick={saveCompetency}
              disabled={savingComp || !compForm.competency_id}
            >
              {savingComp ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setCompModal(false)}>Annuler</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
