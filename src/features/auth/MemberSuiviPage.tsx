'use client'
// src/features/auth/MemberSuiviPage.tsx
// Journal de suivi du membre — stages effectués, notes, réflexions
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Star, BookOpen, MessageSquare, Eye, EyeOff, Save, Lightbulb, Feather } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { BeginnerMode } from '@/features/member/BeginnerMode'
import type { StageLog, TrainerNote, MemberNote } from '@/lib/supabase/types'

type StageWithNotes = StageLog & {
  member_notes: MemberNote[]
  trainer_notes: TrainerNote[]
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'À venir',
  completed: 'Effectué',
  cancelled: 'Annulé',
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-[#FFF8E8] text-[#C8912A] border-[#E0B060]',
  completed: 'bg-[#F0F5EC] text-[#4A5E3A] border-[#B8D4A8]',
  cancelled: 'bg-[#F5F5F5] text-[#7A6355] border-[#D4C4A8]',
}

const CATEGORY_LABELS: Record<string, string> = {
  observation: 'Observation',
  encouragement: 'Encouragement',
  recommendation: 'Recommandation',
  general: 'Note générale',
}

function StarRating({ value, onChange }: { value: number | null; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`transition-colors ${n <= (value || 0) ? 'text-[#C8912A]' : 'text-[#D4C4A8]'} ${onChange ? 'hover:text-[#C8912A] cursor-pointer' : 'cursor-default'}`}
        >
          <Star size={18} fill={n <= (value || 0) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

function StageCard({ stage, token, onUpdate }: { stage: StageWithNotes; token: string; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, string | number | boolean>>({})
  const [saving, setSaving] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', open: false })

  const stageDate = new Date(stage.stage_date)
  const formattedDate = stageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  async function saveField(field: string, value: string | number | boolean | null) {
    setSaving(true)
    await fetch(`/api/member/stages/${stage.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ [field]: value }),
    })
    setSaving(false)
    setEditing(null)
    onUpdate()
  }

  async function addNote() {
    if (!newNote.title || !newNote.content) return
    await fetch('/api/member/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stage_log_id: stage.id, title: newNote.title, content: newNote.content }),
    })
    setNewNote({ title: '', content: '', open: false })
    onUpdate()
  }

  return (
    <div className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#FAF6EF] transition-colors"
      >
        <div className="flex-shrink-0 w-14 h-14 bg-[#5C3D2E] rounded-sm flex flex-col items-center justify-center text-white">
          <span className="font-serif text-xl font-bold leading-none">{stageDate.getDate()}</span>
          <span className="text-[10px] font-sans uppercase tracking-wider text-[#C8912A]">
            {stageDate.toLocaleDateString('fr-FR', { month: 'short' })}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-serif text-lg text-[#5C3D2E] leading-snug">{stage.stage_title}</h3>
            <span className={`text-xs font-sans px-2 py-0.5 rounded-full border ${STATUS_COLORS[stage.status]}`}>
              {STATUS_LABELS[stage.status]}
            </span>
          </div>
          <p className="text-xs font-sans text-[#7A6355]">{formattedDate} · Avec {stage.trainer}</p>
          {stage.rating && (
            <div className="mt-1">
              <StarRating value={stage.rating} />
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-[#7A6355]">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Content déplié */}
      {open && (
        <div className="border-t border-[#D4C4A8] p-5 space-y-6">

          {/* Intention avant le stage */}
          <div>
            <h4 className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mb-2 flex items-center gap-2">
              <BookOpen size={13} /> Avant — Mon intention
            </h4>
            {editing === 'intention_before' ? (
              <div className="space-y-2">
                <textarea
                  className="w-full text-sm font-sans text-[#2D1F14] border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[100px] focus:outline-none focus:border-[#C8912A]"
                  value={draft.intention_before as string || stage.intention_before || ''}
                  onChange={e => setDraft(p => ({ ...p, intention_before: e.target.value }))}
                  placeholder="Quelle est mon intention pour ce stage ? Qu'est-ce que j'espère découvrir ou transformer ?"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => saveField('intention_before', draft.intention_before as string)} disabled={saving}>
                    <Save size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
                </div>
              </div>
            ) : (
              <div
                className="text-sm font-sans text-[#2D1F14] leading-relaxed cursor-pointer hover:bg-[#FAF6EF] p-3 rounded-sm transition-colors group"
                onClick={() => { setEditing('intention_before'); setDraft(p => ({ ...p, intention_before: stage.intention_before || '' })) }}
              >
                {stage.intention_before || <span className="text-[#7A6355] italic">Cliquez pour ajouter votre intention…</span>}
                <span className="ml-2 text-xs text-[#C8912A] opacity-0 group-hover:opacity-100 transition-opacity">✏️ Modifier</span>
              </div>
            )}
          </div>

          {/* Réflexion après */}
          {(stage.status === 'completed' || stage.reflection_after) && (
            <div>
              <h4 className="text-xs font-sans uppercase tracking-widest text-[#4A5E3A] mb-2 flex items-center gap-2">
                <MessageSquare size={13} /> Après — Réflexion
              </h4>
              {editing === 'reflection_after' ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full text-sm font-sans text-[#2D1F14] border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[100px] focus:outline-none focus:border-[#C8912A]"
                    value={draft.reflection_after as string || stage.reflection_after || ''}
                    onChange={e => setDraft(p => ({ ...p, reflection_after: e.target.value }))}
                    placeholder="Qu'ai-je vécu ? Qu'est-ce que cela a changé en moi ?"
                  />
                  <textarea
                    className="w-full text-sm font-sans text-[#2D1F14] border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
                    value={draft.key_insight as string || stage.key_insight || ''}
                    onChange={e => setDraft(p => ({ ...p, key_insight: e.target.value }))}
                    placeholder="Ma prise de conscience principale…"
                  />
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-xs font-sans text-[#7A6355]">Note :</span>
                    <StarRating
                      value={draft.rating as number || stage.rating}
                      onChange={v => setDraft(p => ({ ...p, rating: v }))}
                    />
                    <Button size="sm" variant="primary" onClick={async () => {
                      setSaving(true)
                      await fetch(`/api/member/stages/${stage.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                          reflection_after: draft.reflection_after,
                          key_insight: draft.key_insight,
                          rating: draft.rating,
                        }),
                      })
                      setSaving(false)
                      setEditing(null)
                      onUpdate()
                    }} disabled={saving}>
                      <Save size={13} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <div
                  className="cursor-pointer hover:bg-[#FAF6EF] p-3 rounded-sm transition-colors group space-y-2"
                  onClick={() => { setEditing('reflection_after'); setDraft({ reflection_after: stage.reflection_after || '', key_insight: stage.key_insight || '', rating: stage.rating || 0 }) }}
                >
                  {stage.reflection_after
                    ? <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{stage.reflection_after}</p>
                    : <p className="text-sm font-sans text-[#7A6355] italic">Cliquez pour ajouter votre réflexion après le stage…</p>
                  }
                  {stage.key_insight && (
                    <div className="mt-3 p-4 bg-[#FFF8E8] rounded-sm border border-[#E0B060] flex items-start gap-3">
                      <Lightbulb size={16} className="text-[#C8912A] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Insight clé</p>
                        <p className="text-sm font-sans text-[#5C3D2E] italic leading-relaxed">« {stage.key_insight} »</p>
                      </div>
                    </div>
                  )}
                  <span className="text-xs text-[#C8912A] opacity-0 group-hover:opacity-100 transition-opacity">✏️ Modifier</span>
                </div>
              )}
            </div>
          )}

          {/* Notes du formateur (visibles) */}
          {stage.trainer_notes && stage.trainer_notes.filter(n => n.is_visible_to_member).length > 0 && (
            <div>
              <h4 className="text-xs font-sans uppercase tracking-widest text-[#5C3D2E] mb-2 flex items-center gap-2">
                <Eye size={13} /> Notes de {stage.trainer}
              </h4>
              <div className="space-y-3">
                {stage.trainer_notes.filter(n => n.is_visible_to_member).map(note => (
                  <div key={note.id} className="p-4 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-sans font-medium text-[#5C3D2E]">{note.trainer_name}</span>
                      <span className="text-xs font-sans text-[#7A6355] bg-[#E8D8B8] px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[note.category]}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{note.content}</p>
                    <p className="text-xs font-sans text-[#7A6355] mt-2">
                      {new Date(note.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes personnelles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-sans uppercase tracking-widest text-[#7A6355] flex items-center gap-2">
                <BookOpen size={13} /> Mes notes personnelles
              </h4>
              <button
                onClick={() => setNewNote(p => ({ ...p, open: !p.open }))}
                className="text-xs font-sans text-[#C8912A] flex items-center gap-1 hover:underline"
              >
                <Plus size={13} /> Ajouter
              </button>
            </div>

            {newNote.open && (
              <div className="mb-3 p-4 bg-[#FAF6EF] border border-[#D4C4A8] rounded-sm space-y-2">
                <input
                  className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm px-3 py-2 focus:outline-none focus:border-[#C8912A]"
                  placeholder="Titre de la note"
                  value={newNote.title}
                  onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))}
                />
                <textarea
                  className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
                  placeholder="Contenu de la note…"
                  value={newNote.content}
                  onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={addNote}>Enregistrer</Button>
                  <Button size="sm" variant="ghost" onClick={() => setNewNote({ title: '', content: '', open: false })}>Annuler</Button>
                </div>
              </div>
            )}

            {stage.member_notes && stage.member_notes.length > 0 ? (
              <div className="space-y-2">
                {stage.member_notes.map(note => (
                  <div key={note.id} className="p-3 bg-[#FAF6EF] rounded-sm border border-[#D4C4A8]/50">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-sans font-medium text-[#5C3D2E]">{note.title}</p>
                      {note.is_private && <EyeOff size={12} className="text-[#7A6355]" aria-label="Note privée" />}
                    </div>
                    <p className="text-xs font-sans text-[#7A6355] leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-sans text-[#7A6355] italic">Aucune note pour ce stage.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function MemberSuiviPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stages, setStages] = useState<StageWithNotes[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => { setVisible(true) }, [])
  useEffect(() => { if (!isLoading && !user) router.push('/connexion') }, [user, isLoading, router])

  const loadStages = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/member/stages', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const { stages } = await res.json()
      setStages(stages || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (user) loadStages() }, [user, loadStages])

  if (isLoading || !user) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      <div className="pt-32 pb-12 bg-[#3B2315]">
        <Container>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Link href="/espace-membre" className="text-[#C8A888] hover:text-[#F5EDD8] transition-colors text-xs font-sans flex items-center gap-1 mb-3">
                <ArrowLeft size={12} /> Livre de bord
              </Link>
              <h1 className="font-serif text-3xl text-[#F5EDD8]">Mes expériences</h1>
              <p className="text-sm font-sans text-[#C8A888] mt-1">Fiches de suivi · Réflexions · Prises de conscience</p>
            </div>
            <div className="mt-2">
              <BeginnerMode context="member-suivi" />
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16">
        <Container size="md">
          <div
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stages.length === 0 ? (
              <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
                <BookOpen size={40} className="text-[#D4C4A8] mx-auto mb-4" />
                <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">Votre journal est vide pour l&apos;instant</h2>
                <p className="text-sm font-sans text-[#7A6355] max-w-sm mx-auto mb-6 leading-relaxed">
                  Vos fiches de suivi apparaîtront ici après votre inscription à un stage. Gabriel ou Amélie peuvent aussi en créer une pour vous.
                </p>
                <Button href="/evenements" variant="primary" size="md">Découvrir les stages</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-sans text-[#7A6355]">
                    {stages.length} expérience{stages.length > 1 ? 's' : ''}
                  </p>
                  <Link
                    href="/espace-membre/journal"
                    className="flex items-center gap-1.5 text-xs font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors"
                  >
                    <Feather size={12} /> Journal libre
                  </Link>
                </div>
                {stages.map(stage => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    token={user.accessToken}
                    onUpdate={loadStages}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>
    </>
  )
}
