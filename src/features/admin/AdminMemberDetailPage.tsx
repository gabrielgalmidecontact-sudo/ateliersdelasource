'use client'
// src/features/admin/AdminMemberDetailPage.tsx
// Fiche complète d'un membre — visible par Gabriel/Amélie
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, FileText, Calendar, BookOpen, Plus, Save, Eye, EyeOff, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import type { Profile, StageLog, TrainerNote, Reservation, MemberNote } from '@/lib/supabase/types'

type FullMemberData = {
  profile: Profile
  stages: (StageLog & { member_notes: MemberNote[] })[]
  trainerNotes: TrainerNote[]
  reservations: Reservation[]
}

const CATEGORY_OPTIONS = [
  { value: 'observation',   label: 'Observation' },
  { value: 'encouragement', label: 'Encouragement' },
  { value: 'piste',         label: 'Piste à explorer' },
  { value: 'recommendation',label: 'Recommandation' },
  { value: 'general',       label: 'Note générale' },
]

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-50 text-gray-500',
}

function StarDisplay({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={14} className={n <= value ? 'text-[#C8912A]' : 'text-[#D4C4A8]'} fill={n <= value ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}

export function AdminMemberDetailPage({ memberId }: { memberId: string }) {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<FullMemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'suivi' | 'notes' | 'reservations' | 'profil'>('suivi')
  const [newNote, setNewNote] = useState({ content: '', category: 'general', visible: true, stageLogId: '' })
  const [addingNote, setAddingNote] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [visiblePage, setVisiblePage] = useState(true)
  // Modal pour ajouter un stage
  const [stageModal, setStageModal] = useState(false)
  const [stageForm, setStageForm] = useState<{
    stage_title: string
    stage_date: string
    trainer: string
    status: 'upcoming' | 'completed' | 'cancelled'
  }>({
    stage_title: '',
    stage_date: new Date().toISOString().split('T')[0],
    trainer: 'Gabriel',
    status: 'upcoming',
  })
  const [savingStage, setSavingStage] = useState(false)

  useEffect(() => { setVisiblePage(true) }, [])
  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const loadMember = useCallback(async () => {
    if (!user) return
    const res = await fetch(`/api/admin/members/${memberId}`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setData(d)
    }
    setLoading(false)
  }, [user, memberId])

  useEffect(() => { if (user && isAdmin) loadMember() }, [user, isAdmin, loadMember])

  async function addTrainerNote() {
    if (!newNote.content || !user) return
    setSavingNote(true)
    await fetch('/api/admin/trainer-notes', {
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
    setAddingNote(false)
    setNewNote({ content: '', category: 'general', visible: true, stageLogId: '' })
    loadMember()
  }

  async function createStageLog() {
    if (!user || !stageForm.stage_title || !stageForm.stage_date) return
    setSavingStage(true)
    await fetch('/api/admin/members/' + memberId + '/add-stage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({
        member_id: memberId,
        stage_title: stageForm.stage_title,
        stage_date: stageForm.stage_date,
        stage_slug: stageForm.stage_title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        trainer: stageForm.trainer,
        status: stageForm.status,
      }),
    })
    setSavingStage(false)
    setStageModal(false)
    setStageForm({ stage_title: '', stage_date: new Date().toISOString().split('T')[0], trainer: 'Gabriel', status: 'upcoming' })
    loadMember()
  }

  if (isLoading || !user || loading) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <p className="font-sans text-[#7A6355]">Membre introuvable.</p>
    </div>
  )

  const { profile, stages, trainerNotes, reservations } = data
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email
  const initials = [(profile.first_name || '?')[0], (profile.last_name || '')[0]].filter(Boolean).join('').toUpperCase()

  const TABS = [
    { id: 'suivi',        label: 'Parcours',            count: stages.length },
    { id: 'notes',        label: 'Mes guidances',        count: trainerNotes.length },
    { id: 'reservations', label: 'Réservations',         count: reservations.length },
    { id: 'profil',       label: 'Profil',               count: null },
  ] as const

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header admin */}
      <div className="bg-[#3B2315] border-b border-[#5C3D2E]">
        <Container>
          <div className="flex items-center gap-3 py-4 flex-wrap">
            <Link href="/admin/membres" className="text-[#C8A888] hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <Link href="/" className="font-serif text-lg text-[#F5EDD8] hover:text-[#C8912A] transition-colors">
              Les Ateliers de la Source
            </Link>
            <span className="text-[#7A6355]">/</span>
            <Link href="/admin" className="text-sm font-sans text-[#C8A888] hover:text-white transition-colors">Admin</Link>
            <span className="text-[#7A6355]">/</span>
            <Link href="/admin/membres" className="text-sm font-sans text-[#C8A888] hover:text-white transition-colors">Membres</Link>
            <span className="text-[#7A6355]">/</span>
            <span className="text-sm font-sans text-white">{name}</span>
          </div>
        </Container>
      </div>

      <div className="py-8">
        <Container>
          <div style={{ opacity: visiblePage ? 1 : 0, transform: visiblePage ? 'none' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>

            {/* Profil header */}
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-6 mb-6 flex items-center gap-5 flex-wrap">
              <div className="w-16 h-16 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white font-serif text-2xl flex-shrink-0">
                {initials || <User size={28} />}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-2xl text-[#5C3D2E]">{name}</h1>
                <p className="text-sm font-sans text-[#7A6355]">{profile.email}</p>
                {profile.phone && <p className="text-sm font-sans text-[#7A6355]">{profile.phone}</p>}
                {profile.city && <p className="text-xs font-sans text-[#7A6355] mt-0.5">📍 {profile.city}</p>}
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="text-center px-4 py-2 bg-[#F5EDD8] rounded-sm">
                  <div className="font-serif text-2xl text-[#5C3D2E]">{stages.length}</div>
                  <div className="text-xs font-sans text-[#7A6355]">Stages</div>
                </div>
                <div className="text-center px-4 py-2 bg-[#F5EDD8] rounded-sm">
                  <div className="font-serif text-2xl text-[#5C3D2E]">{trainerNotes.length}</div>
                  <div className="text-xs font-sans text-[#7A6355]">Mes notes</div>
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

            {/* Tab : Suivi stages */}
            {activeTab === 'suivi' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-xl text-[#5C3D2E]">Parcours de {profile.first_name || 'ce membre'}</h2>
                  <Button size="sm" variant="primary" onClick={() => setStageModal(true)}>
                    <Plus size={14} /> Ajouter un stage
                  </Button>
                </div>

                {stages.length === 0 ? (
                  <div className="bg-white rounded-sm border border-[#D4C4A8] p-10 text-center">
                    <FileText size={32} className="text-[#D4C4A8] mx-auto mb-3" />
                    <p className="font-serif text-lg text-[#7A6355]">Aucune fiche de suivi</p>
                    <p className="text-sm font-sans text-[#7A6355] mt-1">Ajoutez un stage pour commencer le suivi.</p>
                  </div>
                ) : stages.map(stage => (
                  <div key={stage.id} className="bg-white rounded-sm border border-[#D4C4A8] p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif text-lg text-[#5C3D2E]">{stage.stage_title}</h3>
                          <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${STATUS_COLORS[stage.status]}`}>
                            {stage.status === 'upcoming' ? 'À venir' : stage.status === 'completed' ? 'Effectué' : 'Annulé'}
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
                        {stage.key_insight && (
                          <div className="mt-2 border-l-4 border-[#C8912A] pl-3">
                            <p className="text-xs font-sans text-[#C8912A] mb-0.5">Prise de conscience</p>
                            <p className="text-sm font-sans italic text-[#5C3D2E]">« {stage.key_insight} »</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes personnelles du membre sur ce stage */}
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
                                ? <EyeOff size={11} className="text-[#7A6355]" aria-label="Note privée" />
                                : <Eye size={11} className="text-[#4A5E3A]" aria-label="Note partagée" />}
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

            {/* Tab : Mes notes (formateur) */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-xl text-[#5C3D2E]">Mes guidances</h2>
                  <Button size="sm" variant="primary" onClick={() => setAddingNote(v => !v)}>
                    <Plus size={14} /> Ajouter une guidance
                  </Button>
                </div>

                {/* Formulaire nouvelle note */}
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
                        <input
                          type="checkbox"
                          checked={newNote.visible}
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
                          {CATEGORY_OPTIONS.find(o => o.value === note.category)?.label}
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

            {/* Tab : Réservations */}
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
                      <div key={res.id} className="bg-white rounded-sm border border-[#D4C4A8] p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#5C3D2E] rounded-sm flex flex-col items-center justify-center text-white flex-shrink-0">
                          <span className="font-serif text-lg font-bold leading-none">{new Date(res.event_date).getDate()}</span>
                          <span className="text-[10px] font-sans text-[#C8912A]">
                            {new Date(res.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-base text-[#5C3D2E]">{res.event_title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${STATUS_COLORS[res.status] || ''}`}>
                              {res.status}
                            </span>
                            <span className="text-xs font-sans text-[#7A6355]">{res.payment_status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab : Profil complet */}
            {activeTab === 'profil' && (
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
            )}

          </div>
        </Container>
      </div>

      {/* Modal : Ajouter un stage */}
      <Modal
        isOpen={stageModal}
        onClose={() => setStageModal(false)}
        title="Ajouter une fiche de suivi"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Titre du stage *"
            name="stage_title"
            value={stageForm.stage_title}
            onChange={e => setStageForm(p => ({ ...p, stage_title: e.target.value }))}
            placeholder="Ex : Théâtre des Doubles Karmiques"
            required
          />
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5" htmlFor="stage_date">
              Date du stage *
            </label>
            <input
              id="stage_date"
              type="date"
              value={stageForm.stage_date}
              onChange={e => setStageForm(p => ({ ...p, stage_date: e.target.value }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5" htmlFor="trainer">
              Formateur
            </label>
            <select
              id="trainer"
              value={stageForm.trainer}
              onChange={e => setStageForm(p => ({ ...p, trainer: e.target.value }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
            >
              <option value="Gabriel">Gabriel</option>
              <option value="Amélie">Amélie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5" htmlFor="status">
              Statut
            </label>
            <select
              id="status"
              value={stageForm.status}
              onChange={e => setStageForm(p => ({ ...p, status: e.target.value as 'upcoming' | 'completed' | 'cancelled' }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
            >
              <option value="upcoming">À venir</option>
              <option value="completed">Effectué</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={createStageLog}
              disabled={savingStage || !stageForm.stage_title || !stageForm.stage_date}
            >
              {savingStage ? 'Enregistrement…' : 'Créer la fiche'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setStageModal(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
