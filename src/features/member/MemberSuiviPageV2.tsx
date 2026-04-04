'use client'
// src/features/member/MemberSuiviPageV2.tsx
// Page "Mon parcours" — Timeline complète + graphe de progression + fiches de suivi
// Intègre MemberTimelineV2 et l'API /api/member/progression pour Phase 2C

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, BookOpen, Feather, Award, FileText,
  TrendingUp, Calendar, Star, ChevronDown, ChevronUp,
  Lightbulb, Eye, EyeOff, Plus, Save, X, MessageSquare
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { MemberTimelineV2 } from '@/features/member/MemberTimelineV2'
import { BeginnerMode } from '@/features/member/BeginnerMode'
import type { StageLog, TrainerNote, MemberNote } from '@/lib/supabase/types'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ProgressionStats {
  totalStages: number
  completedStages: number
  totalCompetencies: number
  validatedCompetencies: number
  journalNotes: number
  questionnaires: number
  avgRating: number | null
  lastActivity: string | null
}

interface MonthPoint {
  key: string
  label: string
  stages: number
  notes: number
  questionnaires: number
  avgRating: number | null
  score: number
}

type StageWithNotes = StageLog & {
  member_notes: MemberNote[]
  trainer_notes: TrainerNote[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'À venir', completed: 'Effectué', cancelled: 'Annulé', ongoing: 'En cours',
}
const STATUS_COLORS: Record<string, string> = {
  upcoming:  'bg-[#FFF8E8] text-[#C8912A] border-[#E0B060]',
  completed: 'bg-[#F0F5EC] text-[#4A5E3A] border-[#B8D4A8]',
  cancelled: 'bg-[#F5F5F5] text-[#7A6355] border-[#D4C4A8]',
  ongoing:   'bg-[#F0F5EC] text-[#4A5E3A] border-[#B8D4A8]',
}
const CATEGORY_LABELS: Record<string, string> = {
  observation: 'Observation', encouragement: 'Encouragement',
  recommendation: 'Recommandation', general: 'Note générale',
}

// ─── Graphe SVG de progression ─────────────────────────────────────────────────
function ProgressionChart({ data }: { data: MonthPoint[] }) {
  const hasData = data.some(d => d.score > 0)
  const chartW = 400
  const chartH = 100
  const padX = 24
  const padY = 12

  const maxVal = Math.max(...data.map(d => d.score), 1)
  const pts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (chartW - 2 * padX)
    const y = padY + (1 - d.score / maxVal) * (chartH - 2 * padY)
    return { x, y, ...d }
  })

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pts.length > 1
    ? `${pathD} L ${pts[pts.length - 1].x} ${chartH} L ${pts[0].x} ${chartH} Z`
    : ''

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-24 text-center">
        <p className="text-xs font-sans text-[#7A6355] italic">Votre courbe d&apos;évolution apparaîtra ici</p>
        <p className="text-[11px] font-sans text-[#C8A888] mt-1">après votre première expérience</p>
      </div>
    )
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full"
        style={{ height: 100 }}
        role="img"
        aria-label="Graphe de progression sur 12 mois"
      >
        <defs>
          <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8912A" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#C8912A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaD && <path d={areaD} fill="url(#progGrad)" />}
        <path d={pathD} fill="none" stroke="#C8912A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => p.score > 0 && (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke="#C8912A" strokeWidth="1.8" />
            {p.stages > 0 && (
              <circle cx={p.x} cy={p.y} r="5.5" fill="none" stroke="#5C3D2E" strokeWidth="0.8" strokeOpacity="0.4" />
            )}
          </g>
        ))}
      </svg>
      <div className="flex justify-between mt-2 px-4">
        {data.filter((_, i) => i % 2 === 0).map(d => (
          <span key={d.key} className="text-[10px] font-sans text-[#C8A888]">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number | null; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button" onClick={() => onChange?.(n)}
          className={`transition-colors ${n <= (value || 0) ? 'text-[#C8912A]' : 'text-[#D4C4A8]'} ${onChange ? 'hover:text-[#C8912A] cursor-pointer' : 'cursor-default'}`}
        >
          <Star size={16} fill={n <= (value || 0) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

// ─── Stage Card ────────────────────────────────────────────────────────────────
function StageCard({ stage, token, onUpdate }: { stage: StageWithNotes; token: string; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, string | number | boolean>>({})
  const [saving, setSaving] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', content: '', open: false })

  async function saveField() {
    if (!editing) return
    setSaving(true)
    await fetch(`/api/member/stages/${stage.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(draft),
    })
    setSaving(false)
    setEditing(null)
    onUpdate()
  }

  async function addNote() {
    if (!newNote.title && !newNote.content) return
    await fetch('/api/member/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stage_log_id: stage.id, title: newNote.title, content: newNote.content }),
    })
    setNewNote({ title: '', content: '', open: false })
    onUpdate()
  }

  const statusColor = STATUS_COLORS[stage.status] || STATUS_COLORS.upcoming
  const statusLabel = STATUS_LABELS[stage.status] || stage.status
  const d = new Date(stage.stage_date)
  const dateStr = `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`

  return (
    <div className="bg-white rounded-sm border border-[#E8D8B8] overflow-hidden hover:shadow-sm transition-shadow">
      {/* En-tête */}
      <button
        className="w-full flex items-start gap-4 p-5 text-left"
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
      >
        <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-full bg-[#F5EDD8] flex items-center justify-center">
            <BookOpen size={16} className="text-[#5C3D2E]" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-serif text-base text-[#3B2315]">{stage.stage_title}</h3>
            <span className={`text-[11px] font-sans px-2 py-0.5 rounded-full border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-sans text-[#7A6355] flex items-center gap-1">
              <Calendar size={11} /> {dateStr}
            </span>
            {stage.trainer && (
              <span className="text-xs font-sans text-[#7A6355]">avec {stage.trainer}</span>
            )}
            {stage.rating && (
              <StarRating value={stage.rating} />
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-[#C8A888]">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Détails */}
      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-[#F0E8DA]">

          {/* Intention avant */}
          {(stage.intention_before || stage.status !== 'completed') && (
            <div>
              <h4 className="text-[11px] font-sans uppercase tracking-widest text-[#7A6355] mb-2 flex items-center gap-1.5">
                <Lightbulb size={12} /> Mon intention
              </h4>
              {editing === 'intention' ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full text-sm font-sans border border-[#C8912A] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none"
                    value={String(draft.intention_before || '')}
                    onChange={e => setDraft(p => ({ ...p, intention_before: e.target.value }))}
                    placeholder="Votre intention avant ce stage…"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={saveField} disabled={saving}
                      className="flex items-center gap-1 text-xs font-sans text-white bg-[#C8912A] px-3 py-1.5 rounded-sm hover:bg-[#5C3D2E] transition-colors disabled:opacity-60">
                      <Save size={11} /> {saving ? '…' : 'Enregistrer'}
                    </button>
                    <button onClick={() => setEditing(null)} className="text-xs font-sans text-[#7A6355] hover:text-[#5C3D2E] flex items-center gap-1">
                      <X size={11} /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cursor-pointer hover:bg-[#FAF6EF] p-3 rounded-sm transition-colors group"
                  onClick={() => { setEditing('intention'); setDraft({ intention_before: stage.intention_before || '' }) }}>
                  {stage.intention_before
                    ? <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{stage.intention_before}</p>
                    : <p className="text-sm font-sans text-[#7A6355] italic">Cliquez pour ajouter votre intention…</p>
                  }
                  <span className="text-xs text-[#C8912A] opacity-0 group-hover:opacity-100 transition-opacity">✏️ Modifier</span>
                </div>
              )}
            </div>
          )}

          {/* Réflexion après + rating (si completed) */}
          {stage.status === 'completed' && (
            <div>
              <h4 className="text-[11px] font-sans uppercase tracking-widest text-[#7A6355] mb-2 flex items-center gap-1.5">
                <TrendingUp size={12} /> Réflexion & apprentissages
              </h4>
              {editing === 'reflection' ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full text-sm font-sans border border-[#C8912A] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none"
                    value={String(draft.reflection_after || '')}
                    onChange={e => setDraft(p => ({ ...p, reflection_after: e.target.value }))}
                    placeholder="Votre réflexion après le stage…"
                    autoFocus
                  />
                  <input
                    className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm px-3 py-2 focus:outline-none focus:border-[#C8912A]"
                    placeholder="Insight clé (optionnel)…"
                    value={String(draft.key_insight || '')}
                    onChange={e => setDraft(p => ({ ...p, key_insight: e.target.value }))}
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-sans text-[#7A6355]">Votre note :</span>
                    <StarRating
                      value={Number(draft.rating) || null}
                      onChange={v => setDraft(p => ({ ...p, rating: v }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveField} disabled={saving}
                      className="flex items-center gap-1 text-xs font-sans text-white bg-[#C8912A] px-3 py-1.5 rounded-sm hover:bg-[#5C3D2E] transition-colors disabled:opacity-60">
                      <Save size={11} /> {saving ? '…' : 'Enregistrer'}
                    </button>
                    <button onClick={() => setEditing(null)} className="text-xs font-sans text-[#7A6355] hover:text-[#5C3D2E] flex items-center gap-1">
                      <X size={11} /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="cursor-pointer hover:bg-[#FAF6EF] p-3 rounded-sm transition-colors group space-y-2"
                  onClick={() => { setEditing('reflection'); setDraft({ reflection_after: stage.reflection_after || '', key_insight: stage.key_insight || '', rating: stage.rating || 0 }) }}>
                  {stage.reflection_after
                    ? <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{stage.reflection_after}</p>
                    : <p className="text-sm font-sans text-[#7A6355] italic">Cliquez pour ajouter votre réflexion…</p>
                  }
                  {stage.key_insight && (
                    <div className="p-3 bg-[#FFF8E8] rounded-sm border border-[#E0B060] flex items-start gap-2">
                      <Lightbulb size={13} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-sans text-[#5C3D2E] italic leading-relaxed">« {stage.key_insight} »</p>
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
              <h4 className="text-[11px] font-sans uppercase tracking-widest text-[#5C3D2E] mb-2 flex items-center gap-1.5">
                <Eye size={12} /> Notes de {stage.trainer}
              </h4>
              <div className="space-y-2">
                {stage.trainer_notes.filter(n => n.is_visible_to_member).map(note => (
                  <div key={note.id} className="p-3 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-sans font-medium text-[#5C3D2E]">{note.trainer_name}</span>
                      <span className="text-[10px] font-sans text-[#7A6355] bg-[#E8D8B8] px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[note.category] || note.category}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{note.content}</p>
                    <p className="text-[10px] font-sans text-[#7A6355] mt-1.5">
                      {new Date(note.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes personnelles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-sans uppercase tracking-widest text-[#7A6355] flex items-center gap-1.5">
                <MessageSquare size={12} /> Mes notes
              </h4>
              <button
                onClick={() => setNewNote(p => ({ ...p, open: !p.open }))}
                className="text-[11px] font-sans text-[#C8912A] flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Ajouter
              </button>
            </div>

            {newNote.open && (
              <div className="mb-3 p-3 bg-[#FAF6EF] border border-[#D4C4A8] rounded-sm space-y-2">
                <input
                  className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm px-3 py-2 focus:outline-none focus:border-[#C8912A]"
                  placeholder="Titre de la note"
                  value={newNote.title}
                  onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))}
                />
                <textarea
                  className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[70px] focus:outline-none focus:border-[#C8912A]"
                  placeholder="Contenu…"
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
                      {note.is_private && <EyeOff size={11} className="text-[#7A6355]" />}
                    </div>
                    <p className="text-xs font-sans text-[#7A6355] leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : !newNote.open && (
              <p className="text-xs font-sans text-[#7A6355] italic">Aucune note pour cette expérience.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, value, label, color = '#5C3D2E' }: {
  icon: React.ReactNode; value: string | number; label: string; color?: string
}) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-sm border border-[#E8D8B8] px-4 py-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '18', color }}>
        {icon}
      </div>
      <div>
        <div className="font-serif text-lg leading-none" style={{ color }}>{value}</div>
        <div className="text-[10px] font-sans text-[#7A6355] mt-0.5">{label}</div>
      </div>
    </div>
  )
}

// ─── Tab button ────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-sans rounded-sm transition-all ${
        active
          ? 'bg-[#5C3D2E] text-white'
          : 'text-[#7A6355] hover:text-[#5C3D2E] hover:bg-[#F5EDD8]'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function MemberSuiviPageV2() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [stages, setStages] = useState<StageWithNotes[]>([])
  const [stats, setStats] = useState<ProgressionStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'timeline' | 'stages' | 'chart'>('timeline')

  useEffect(() => {
    if (!isLoading && !user) router.push('/connexion')
  }, [user, isLoading, router])

  const loadData = useCallback(async () => {
    if (!user) return
    const token = user.accessToken
    const [stagesRes, progressionRes] = await Promise.all([
      fetch('/api/member/stages', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/member/progression', { headers: { Authorization: `Bearer ${token}` } }),
    ])
    if (stagesRes.ok) {
      const d = await stagesRes.json()
      setStages(d.stages || [])
    }
    if (progressionRes.ok) {
      const d = await progressionRes.json()
      setStats(d.stats)
      setMonthlyData(d.monthlyEvolution || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (user) loadData() }, [user, loadData])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completedStages = stages.filter(s => s.status === 'completed')
  const avgRatingDisplay = stats?.avgRating ? `${Math.round(stats.avgRating * 10) / 10}/5` : '—'

  return (
    <>
      {/* ── Header ── */}
      <div className="pt-32 pb-12 bg-[#3B2315]">
        <Container>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Link href="/espace-membre"
                className="text-[#C8A888] hover:text-[#F5EDD8] transition-colors text-xs font-sans flex items-center gap-1 mb-3">
                <ArrowLeft size={12} /> Livre de bord
              </Link>
              <h1 className="font-serif text-3xl text-[#F5EDD8]">Mon parcours</h1>
              <p className="text-sm font-sans text-[#C8A888] mt-1">
                {(profile?.first_name || profile?.last_name) ? `${[profile.first_name, profile.last_name].filter(Boolean).join(' ')} · ` : ''}Timeline · Expériences · Progression
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <BeginnerMode context="member-suivi" />
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-10">
        <Container>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">

              {/* ── Stats ── */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatPill
                    icon={<BookOpen size={15} />}
                    value={stats.completedStages}
                    label={`sur ${stats.totalStages} expérience${stats.totalStages > 1 ? 's' : ''}`}
                    color="#5C3D2E"
                  />
                  <StatPill
                    icon={<Award size={15} />}
                    value={stats.validatedCompetencies}
                    label={`compétence${stats.validatedCompetencies > 1 ? 's' : ''} validée${stats.validatedCompetencies > 1 ? 's' : ''}`}
                    color="#C8912A"
                  />
                  <StatPill
                    icon={<Feather size={15} />}
                    value={stats.journalNotes}
                    label={`note${stats.journalNotes > 1 ? 's' : ''} de journal`}
                    color="#4A5E3A"
                  />
                  <StatPill
                    icon={<Star size={15} />}
                    value={avgRatingDisplay}
                    label="note moyenne"
                    color="#7A6355"
                  />
                </div>
              )}

              {/* ── Tabs ── */}
              <div className="flex items-center gap-2 flex-wrap">
                <TabBtn active={tab === 'timeline'} onClick={() => setTab('timeline')}
                  icon={<FileText size={12} />} label="Timeline" />
                <TabBtn active={tab === 'stages'} onClick={() => setTab('stages')}
                  icon={<BookOpen size={12} />} label={`Fiches (${stages.length})`} />
                <TabBtn active={tab === 'chart'} onClick={() => setTab('chart')}
                  icon={<TrendingUp size={12} />} label="Progression" />
              </div>

              {/* ── Tab: Timeline ── */}
              {tab === 'timeline' && (
                <div>
                  <MemberTimelineV2 limit={20} showLoadMore={false} />
                </div>
              )}

              {/* ── Tab: Fiches de suivi ── */}
              {tab === 'stages' && (
                <div>
                  {stages.length === 0 ? (
                    <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
                      <BookOpen size={36} className="text-[#D4C4A8] mx-auto mb-4" />
                      <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">Votre carnet est vide</h2>
                      <p className="text-sm font-sans text-[#7A6355] max-w-sm mx-auto mb-6 leading-relaxed">
                        Vos fiches de suivi apparaîtront ici après votre participation à un stage ou atelier.
                      </p>
                      <Button href="/evenements" variant="primary" size="md">Voir les stages</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-sans text-[#7A6355]">
                          {completedStages.length} effectuée{completedStages.length > 1 ? 's' : ''} sur {stages.length}
                        </p>
                        <Link href="/espace-membre/journal"
                          className="flex items-center gap-1.5 text-xs font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors">
                          <Feather size={12} /> Journal libre
                        </Link>
                      </div>
                      {stages.map(stage => (
                        <StageCard
                          key={stage.id}
                          stage={stage}
                          token={user.accessToken}
                          onUpdate={loadData}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Graphe de progression ── */}
              {tab === 'chart' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-sm border border-[#E8D8B8] p-6">
                    <h2 className="font-serif text-base text-[#5C3D2E] mb-1">Évolution sur 12 mois</h2>
                    <p className="text-xs font-sans text-[#7A6355] mb-4">
                      Score composite : présence aux stages, notes de journal, questionnaires
                    </p>
                    <ProgressionChart data={monthlyData} />
                  </div>

                  {/* Légende */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {monthlyData.filter(m => m.stages > 0 || m.notes > 0).slice(-6).map(m => (
                      <div key={m.key} className="bg-white rounded-sm border border-[#E8D8B8] p-4">
                        <p className="text-[11px] font-sans uppercase tracking-widest text-[#7A6355] mb-2">{m.label}</p>
                        <div className="space-y-1">
                          {m.stages > 0 && (
                            <div className="flex justify-between">
                              <span className="text-xs font-sans text-[#7A6355]">Expériences</span>
                              <span className="text-xs font-sans text-[#5C3D2E] font-medium">{m.stages}</span>
                            </div>
                          )}
                          {m.notes > 0 && (
                            <div className="flex justify-between">
                              <span className="text-xs font-sans text-[#7A6355]">Notes</span>
                              <span className="text-xs font-sans text-[#5C3D2E] font-medium">{m.notes}</span>
                            </div>
                          )}
                          {m.questionnaires > 0 && (
                            <div className="flex justify-between">
                              <span className="text-xs font-sans text-[#7A6355]">Questionnaires</span>
                              <span className="text-xs font-sans text-[#5C3D2E] font-medium">{m.questionnaires}</span>
                            </div>
                          )}
                          {m.avgRating && (
                            <div className="flex justify-between">
                              <span className="text-xs font-sans text-[#7A6355]">Note moyenne</span>
                              <span className="text-xs font-sans text-[#C8912A] font-medium">{m.avgRating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Liens rapides */}
                  <div className="flex gap-3 flex-wrap">
                    <Link href="/espace-membre/competences"
                      className="flex items-center gap-2 text-xs font-sans text-[#C8912A] border border-[#C8912A] px-4 py-2 rounded-sm hover:bg-[#C8912A] hover:text-white transition-all">
                      <Award size={13} /> Voir mes compétences
                    </Link>
                    <Link href="/espace-membre/questionnaires"
                      className="flex items-center gap-2 text-xs font-sans text-[#5C3D2E] border border-[#D4C4A8] px-4 py-2 rounded-sm hover:border-[#C8912A] transition-all">
                      <FileText size={13} /> Mes questionnaires
                    </Link>
                  </div>
                </div>
              )}

            </div>
          )}
        </Container>
      </div>
    </>
  )
}
