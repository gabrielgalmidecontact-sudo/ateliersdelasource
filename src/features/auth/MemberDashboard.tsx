'use client'
// src/features/auth/MemberDashboard.tsx — "Mon Livre de Bord"
// Layout 2 colonnes premium — identique au wireframe fourni
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, LogOut, Calendar, ChevronRight, BookOpen, Feather, Clock, Star, Lightbulb, Download, User } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { MemberProgressCircles } from '@/features/member/MemberProgressCircles'
import { MemberCompetencyBars } from '@/features/member/MemberCompetencyBars'
import { MemberProgressChart } from '@/features/member/MemberProgressChart'
import { BeginnerMode } from '@/features/member/BeginnerMode'
import type { StageLog } from '@/lib/supabase/types'

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 3)}. ${d.getFullYear()}`
}

function getMemberSince(createdAt?: string | null): string {
  if (!createdAt) return '2024'
  return String(new Date(createdAt).getFullYear())
}

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  color?: string
}
function StatCard({ icon, value, label, color = '#C8912A' }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-sm border border-[#E8D8B8]">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '18', color }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <div className="font-serif text-xl leading-none" style={{ color }}>{value}</div>
        <div className="text-[11px] font-sans text-[#7A6355] mt-0.5">{label}</div>
      </div>
    </div>
  )
}

// ─── Timeline entry ───────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; dot: string; ring: string; bg: string }> = {
  completed: { label: 'Terminé',   dot: '#4A5E3A', ring: '#B8D4A8', bg: '#F0F5EC' },
  upcoming:  { label: 'En cours',  dot: '#C8912A', ring: '#E0B060', bg: '#FFF8E8' },
  cancelled: { label: 'Annulé',    dot: '#9CA3AF', ring: '#D1D5DB', bg: '#F9FAFB' },
}

function TimelineEntry({ stage }: { stage: StageLog }) {
  const d = new Date(stage.stage_date)
  const cfg = STATUS_CFG[stage.status] || STATUS_CFG.upcoming
  const hasInsight = !!(stage.key_insight?.trim())

  return (
    <div className="flex gap-3 group">
      {/* Dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          style={{ borderColor: cfg.ring, backgroundColor: 'white' }}
          aria-hidden="true"
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
        </div>
        <div className="w-px flex-1 bg-[#E8D8B8] mt-1" />
      </div>
      {/* Content */}
      <div className="flex-1 pb-5 min-w-0">
        <div
          className="rounded-sm border p-3.5 transition-all duration-200 hover:shadow-sm"
          style={{ borderColor: cfg.ring, backgroundColor: cfg.bg }}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-serif text-sm text-[#5C3D2E] leading-snug">{stage.stage_title}</h4>
              <span
                className="text-[10px] font-sans px-2 py-0.5 rounded-full border"
                style={{ color: cfg.dot, borderColor: cfg.ring }}
              >
                {cfg.label}
              </span>
            </div>
            <Link
              href="/espace-membre/suivi"
              className="flex-shrink-0 text-[#C8A888] hover:text-[#C8912A] transition-colors"
              aria-label={`Voir ${stage.stage_title}`}
            >
              <ChevronRight size={14} />
            </Link>
          </div>
          <p className="text-[11px] font-sans text-[#7A6355] mb-1">
            {MONTHS_FR[d.getMonth()].charAt(0).toUpperCase() + MONTHS_FR[d.getMonth()].slice(1)} {d.getFullYear()}
          </p>
          {stage.intention_before && !hasInsight && (
            <p className="text-xs font-sans text-[#7A6355] italic leading-relaxed line-clamp-2">
              {stage.intention_before}
            </p>
          )}
          {hasInsight && (
            <div className="flex items-start gap-1.5 mt-1.5 p-2 bg-white/70 rounded border-l-2 border-[#C8912A]">
              <Lightbulb size={11} className="text-[#C8912A] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[11px] font-sans text-[#5C3D2E] italic line-clamp-2">
                « {stage.key_insight} »
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar block wrapper ────────────────────────────────────────────────────
function SideBlock({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-sm border border-[#E8D8B8] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#F0E8DA]">
        <h3 className="font-serif text-sm text-[#5C3D2E]">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MemberDashboard() {
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [stages, setStages] = useState<StageLog[]>([])
  const [journalCount, setJournalCount] = useState(0)
  const [notesCount, setNotesCount] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) router.push('/connexion')
  }, [user, isLoading, router])

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [stagesRes, journalRes] = await Promise.all([
        fetch('/api/member/stages', { headers: { Authorization: `Bearer ${user.accessToken}` } }),
        fetch('/api/member/journal', { headers: { Authorization: `Bearer ${user.accessToken}` } }),
      ])
      if (stagesRes.ok) {
        const { stages: data } = await stagesRes.json()
        const list: StageLog[] = data || []
        setStages(list)
        const total = list.reduce((acc: number, s: StageLog & { member_notes?: unknown[] }) =>
          acc + ((s as StageLog & { member_notes?: unknown[] }).member_notes?.length || 0), 0)
        setNotesCount(total)
      }
      if (journalRes.ok) {
        const { notes } = await journalRes.json()
        setJournalCount((notes || []).length)
      }
    } finally {
      setDataLoading(false)
    }
  }, [user])

  useEffect(() => { if (user) loadData() }, [user, loadData])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = profile?.first_name || ''
  const lastName = profile?.last_name || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || user.email.split('@')[0]
  const initials = [(profile?.first_name || '?')[0], (profile?.last_name || '')[0]].filter(Boolean).join('').toUpperCase() || '?'
  const memberSince = getMemberSince(profile?.created_at)
  const lastActivity = stages.length > 0
    ? [...stages].sort((a, b) => new Date(b.stage_date).getTime() - new Date(a.stage_date).getTime())[0]?.stage_date || null
    : null
  const completedStages = stages.filter(s => s.status === 'completed')
  const totalNotes = notesCount + journalCount
  const sortedStages = [...stages].sort((a, b) => new Date(b.stage_date).getTime() - new Date(a.stage_date).getTime())
  const recentStages = sortedStages.slice(0, 4)

  return (
    <div className="min-h-screen bg-[#FAF6EF]">

      {/* ── Header brun ── */}
      <div className="pt-24 pb-8 bg-[#3B2315]">
        <Container>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#C8912A] mb-1">Espace personnel</p>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#F5EDD8]">Mon Livre de Bord</h1>
              <p className="text-sm font-sans text-[#C8A888] mt-1">Ateliers de la Source</p>
            </div>
            <div className="flex items-center gap-3">
              <BeginnerMode context="member-dashboard" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-xs font-sans text-[#C8A888] hover:text-white transition-colors"
                aria-label="Se déconnecter"
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Nav secondaire */}
          <nav className="mt-5 flex flex-wrap gap-1.5" aria-label="Navigation espace membre">
            {[
              { href: '/espace-membre',             label: 'Livre de bord' },
              { href: '/espace-membre/suivi',        label: 'Expériences' },
              { href: '/espace-membre/journal',      label: 'Journal' },
              { href: '/espace-membre/reservations', label: 'Réservations' },
              { href: '/espace-membre/profil',       label: 'Profil' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] font-sans tracking-wide text-[#C8A888] hover:text-white border border-[#5C3D2E] hover:border-[#C8912A] px-3 py-1 rounded-sm transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>

      {/* ── Contenu principal ── */}
      <div className="py-10">
        <Container>
          {dataLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

              {/* ════════════════════════════════════════════
                  COLONNE GAUCHE — Dossier + Timeline
              ════════════════════════════════════════════ */}
              <div className="space-y-8">

                {/* ── DOSSIER PERSONNEL ── */}
                <section aria-labelledby="profile-heading">
                  <div className="bg-white rounded-sm border border-[#E8D8B8] overflow-hidden">

                    {/* En-tête dossier */}
                    <div className="bg-[#FAF6EF] border-b border-[#E8D8B8] px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div
                          className="w-14 h-14 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white font-serif text-xl flex-shrink-0 shadow-sm"
                          aria-hidden="true"
                        >
                          {initials.length > 0 ? initials : <User size={22} />}
                        </div>
                        <div>
                          <h2 id="profile-heading" className="font-serif text-xl text-[#5C3D2E] leading-tight">
                            {fullName}
                          </h2>
                          <p className="text-xs font-sans text-[#7A6355] mt-0.5">
                            Membre depuis {memberSince}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/espace-membre/profil"
                        className="flex items-center gap-1.5 text-xs font-sans text-[#7A6355] hover:text-[#C8912A] border border-[#D4C4A8] hover:border-[#C8912A] px-3 py-1.5 rounded-sm transition-all duration-200"
                      >
                        <Settings size={12} />
                        Paramètres du profil
                      </Link>
                    </div>

                    <div className="p-6">
                      {/* Alerte profil incomplet */}
                      {!profile?.first_name && (
                        <div className="mb-5 p-4 bg-[#FFF8E8] border border-[#E0B060] rounded-sm flex items-start gap-3">
                          <User size={16} className="text-[#C8912A] flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-sans font-medium text-[#5C3D2E]">Personnalisez votre livre de bord</p>
                            <p className="text-xs font-sans text-[#7A6355] mt-0.5 leading-relaxed">
                              Ajoutez votre prénom et votre intention pour que votre dossier vous ressemble vraiment.
                            </p>
                            <Link href="/espace-membre/profil" className="mt-2 inline-block text-xs font-sans text-[#C8912A] font-medium hover:underline">
                              Compléter mon profil →
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Informations du membre */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-5">
                        {profile?.email && (
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-0.5">Email</p>
                            <p className="text-sm font-sans text-[#2D1F14]">{profile.email}</p>
                          </div>
                        )}
                        {profile?.phone && (
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-0.5">Téléphone</p>
                            <p className="text-sm font-sans text-[#2D1F14]">{profile.phone}</p>
                          </div>
                        )}
                        {profile?.city && (
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-0.5">Ville</p>
                            <p className="text-sm font-sans text-[#2D1F14]">{profile.city}</p>
                          </div>
                        )}
                      </div>

                      {/* Motivation */}
                      {profile?.motivation && (
                        <div className="mb-4 p-4 bg-[#FAF6EF] rounded-sm border border-[#E8D8B8]">
                          <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1.5">Mon intention</p>
                          <p className="text-sm font-sans text-[#5C3D2E] italic leading-relaxed">
                            &ldquo;{profile.motivation}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Bio */}
                      {profile?.bio && (
                        <div className="p-4 bg-[#FAF6EF] rounded-sm border border-[#E8D8B8]">
                          <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-1.5">À propos de moi</p>
                          <p className="text-sm font-sans text-[#2D1F14] leading-relaxed">{profile.bio}</p>
                        </div>
                      )}

                      {/* Bouton exporter — préparé visuellement */}
                      <div className="mt-5 pt-4 border-t border-[#F0E8DA] flex items-center gap-3">
                        <button
                          disabled
                          title="Export PDF — disponible prochainement"
                          className="flex items-center gap-2 text-xs font-sans text-[#C8A888] border border-dashed border-[#D4C4A8] px-4 py-2 rounded-sm cursor-not-allowed opacity-60"
                          aria-label="Exporter mon journal en PDF — bientôt disponible"
                        >
                          <Download size={13} />
                          Exporter mon journal (PDF)
                          <span className="text-[10px] bg-[#F5EDD8] text-[#7A6355] px-1.5 py-0.5 rounded-full ml-1">bientôt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── STATS RAPIDES ── */}
                <section aria-labelledby="stats-heading">
                  <h2 id="stats-heading" className="sr-only">Résumé de votre évolution</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard
                      icon={<BookOpen size={16} />}
                      value={stages.length}
                      label={stages.length <= 1 ? 'Expérience vécue' : 'Expériences vécues'}
                      color="#5C3D2E"
                    />
                    <StatCard
                      icon={<Star size={16} />}
                      value={2}
                      label="Compétences"
                      color="#C8912A"
                    />
                    <StatCard
                      icon={<Feather size={16} />}
                      value={totalNotes}
                      label={totalNotes <= 1 ? 'Note prise' : 'Notes prises'}
                      color="#4A5E3A"
                    />
                    <StatCard
                      icon={<Clock size={16} />}
                      value={formatLastActivity(lastActivity)}
                      label="Dernière activité"
                      color="#7A6355"
                    />
                  </div>
                </section>

                {/* ── TIMELINE ── */}
                <section aria-labelledby="timeline-heading">
                  <div className="flex items-center justify-between mb-4">
                    <h2 id="timeline-heading" className="font-serif text-xl text-[#5C3D2E]">Mon parcours</h2>
                    {stages.length > 4 && (
                      <Link
                        href="/espace-membre/suivi"
                        className="text-xs font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors flex items-center gap-1"
                      >
                        Voir tout <ChevronRight size={13} />
                      </Link>
                    )}
                  </div>

                  {recentStages.length === 0 ? (
                    <div className="bg-white rounded-sm border border-[#E8D8B8] p-10 text-center">
                      <BookOpen size={32} className="text-[#D4C4A8] mx-auto mb-3" aria-hidden="true" />
                      <p className="font-serif text-base text-[#5C3D2E] mb-1">Votre chemin commence ici</p>
                      <p className="text-sm font-sans text-[#7A6355] max-w-xs mx-auto leading-relaxed mb-5">
                        Vos expériences apparaîtront au fil du temps. Gabriel peut créer votre première fiche.
                      </p>
                      <Link
                        href="/evenements"
                        className="inline-block text-xs font-sans font-medium text-[#C8912A] border border-[#C8912A] px-4 py-2 rounded-sm hover:bg-[#C8912A] hover:text-white transition-all duration-200"
                      >
                        Voir les prochains stages
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {recentStages.map(stage => (
                        <TimelineEntry key={stage.id} stage={stage} />
                      ))}
                      {/* CTA voir tout */}
                      {stages.length <= 4 && (
                        <div className="mt-2 pl-11">
                          <Link
                            href="/espace-membre/suivi"
                            className="inline-flex items-center gap-1.5 text-xs font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors"
                          >
                            <span>Accéder aux fiches détaillées</span>
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* ── Accès rapides bas de page ── */}
                <section aria-label="Accès rapides">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                      href="/espace-membre/journal"
                      className="group flex items-center gap-3 p-4 bg-white rounded-sm border border-[#E8D8B8] hover:border-[#C8912A]/60 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#F5EDD8] group-hover:bg-[#FFF8E8] flex items-center justify-center flex-shrink-0 transition-colors">
                        <Feather size={16} className="text-[#C8912A]" />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">Journal libre</p>
                        <p className="text-[11px] font-sans text-[#7A6355]">{journalCount} note{journalCount > 1 ? 's' : ''}</p>
                      </div>
                      <ChevronRight size={14} className="text-[#D4C4A8] group-hover:text-[#C8912A] ml-auto flex-shrink-0 transition-colors" />
                    </Link>

                    <Link
                      href="/espace-membre/reservations"
                      className="group flex items-center gap-3 p-4 bg-white rounded-sm border border-[#E8D8B8] hover:border-[#C8912A]/60 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#FFF8E8] flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-[#C8912A]" />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">Réservations</p>
                        <p className="text-[11px] font-sans text-[#7A6355]">Stages inscrits</p>
                      </div>
                      <ChevronRight size={14} className="text-[#D4C4A8] group-hover:text-[#C8912A] ml-auto flex-shrink-0 transition-colors" />
                    </Link>

                    <Link
                      href="/evenements"
                      className="group flex items-center gap-3 p-4 bg-[#3B2315] rounded-sm border border-[#5C3D2E] hover:border-[#C8912A] hover:shadow-sm transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#5C3D2E] flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-[#C8912A]" />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-medium text-[#F5EDD8] group-hover:text-[#C8912A] transition-colors">Prochains stages</p>
                        <p className="text-[11px] font-sans text-[#C8A888]">Découvrir</p>
                      </div>
                      <ChevronRight size={14} className="text-[#5C3D2E] group-hover:text-[#C8912A] ml-auto flex-shrink-0 transition-colors" />
                    </Link>
                  </div>
                </section>

              </div>

              {/* ════════════════════════════════════════════
                  COLONNE DROITE — Sidebar
              ════════════════════════════════════════════ */}
              <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start" aria-label="Résumé de progression">

                {/* ── Compétences ── */}
                <SideBlock title="Mes compétences">
                  <MemberCompetencyBars stages={stages} />
                </SideBlock>

                {/* ── Indicateurs circulaires ── */}
                <SideBlock title="Progression globale">
                  <MemberProgressCircles
                    stagesCompleted={completedStages.length}
                    stagesTotal={stages.length}
                    notesCount={totalNotes}
                  />
                </SideBlock>

                {/* ── Notes récentes ── */}
                <SideBlock
                  title="Notes récentes"
                  action={
                    <Link
                      href="/espace-membre/journal"
                      className="text-[10px] font-sans text-[#C8912A] hover:underline"
                    >
                      Voir tout
                    </Link>
                  }
                >
                  <div className="space-y-2">
                    <Link
                      href="/espace-membre/suivi"
                      className="flex items-center justify-between p-3 bg-[#FAF6EF] rounded-sm hover:bg-[#F5EDD8] transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={13} className="text-[#C8912A]" aria-hidden="true" />
                        <span className="text-xs font-sans text-[#5C3D2E]">Réflexions post-stage</span>
                      </div>
                      <span className="text-xs font-sans font-bold text-[#C8912A]">
                        {notesCount} note{notesCount > 1 ? 's' : ''}
                      </span>
                    </Link>
                    <Link
                      href="/espace-membre/journal"
                      className="flex items-center justify-between p-3 bg-[#FAF6EF] rounded-sm hover:bg-[#F5EDD8] transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Feather size={13} className="text-[#4A5E3A]" aria-hidden="true" />
                        <span className="text-xs font-sans text-[#5C3D2E]">Journal libre</span>
                      </div>
                      <span className="text-xs font-sans font-bold text-[#4A5E3A]">
                        {journalCount} note{journalCount > 1 ? 's' : ''}
                      </span>
                    </Link>
                  </div>
                </SideBlock>

                {/* ── Graphe de progression ── */}
                <SideBlock title="Ma progression">
                  <MemberProgressChart stages={stages} />
                </SideBlock>

              </aside>
            </div>
          )}
        </Container>
      </div>
    </div>
  )
}
