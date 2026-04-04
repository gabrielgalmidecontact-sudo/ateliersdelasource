'use client'
// src/features/auth/MemberDashboard.tsx — "Mon Livre de Bord" (Phase 2)
// Timeline unifiée + mode débutant + guide contextuel
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Settings, LogOut, Calendar, ChevronRight, BookOpen,
  Feather, Clock, Star, Download, User, Sparkles
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { MemberProgressCircles } from '@/features/member/MemberProgressCircles'
import { MemberCompetencyBars } from '@/features/member/MemberCompetencyBars'
import { MemberProgressChart } from '@/features/member/MemberProgressChart'
import { MemberTimelineV2 } from '@/features/member/MemberTimelineV2'
import { MemberBeginnerGuide, MemberBeginnerGuideButton } from '@/features/member/MemberBeginnerGuide'
import type { StageLog, MemberCompetency, Competency } from '@/lib/supabase/types'

type MemberCompetencyWithComp = MemberCompetency & { competency?: Competency }

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
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`
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
  sub?: string
  color?: string
  href?: string
}
function StatCard({ icon, value, label, sub, color = '#C8912A', href }: StatCardProps) {
  const inner = (
    <div className="flex items-center gap-3 p-4 bg-white rounded-sm border border-[#E8D8B8] hover:border-[#C8912A]/50 transition-colors h-full">
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
        {sub && <div className="text-[10px] font-sans text-[#C8A888] mt-0.5">{sub}</div>}
      </div>
    </div>
  )
  if (href) return <Link href={href} className="block">{inner}</Link>
  return inner
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
  const [competencies, setCompetencies] = useState<MemberCompetencyWithComp[]>([])
  const [questCount, setQuestCount] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) router.push('/connexion')
  }, [user, isLoading, router])

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [stagesRes, journalRes, compRes, questRes] = await Promise.all([
        fetch('/api/member/stages',        { headers: { Authorization: `Bearer ${user.accessToken}` } }),
        fetch('/api/member/journal',       { headers: { Authorization: `Bearer ${user.accessToken}` } }),
        fetch('/api/member/competencies',  { headers: { Authorization: `Bearer ${user.accessToken}` } }),
        fetch('/api/member/questionnaires',{ headers: { Authorization: `Bearer ${user.accessToken}` } }),
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
      if (compRes.ok) {
        const { competencies: comps } = await compRes.json()
        setCompetencies(comps || [])
      }
      if (questRes.ok) {
        const d = await questRes.json()
        setQuestCount((d.submissions || []).length)
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

  const handlePdfExport = async () => {
    if (!user || pdfLoading) return
    setPdfLoading(true)
    try {
      const res = await fetch('/api/member/pdf-export', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      if (!res.ok) { setPdfLoading(false); return }
      const data = await res.json()
      const { generateBookPdf } = await import('@/lib/pdf/generateBookPdf')
      await generateBookPdf(data)
    } catch (e) {
      console.error('PDF export error:', e)
    } finally {
      setPdfLoading(false)
    }
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
  const validatedComps = competencies.filter(c => c.is_validated)

  return (
    <div className="min-h-screen bg-[#FAF6EF]">

      {/* Guide débutant (premier accès) */}
      <MemberBeginnerGuide />

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
              <MemberBeginnerGuideButton />
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
              { href: '/espace-membre',                   label: 'Livre de bord' },
              { href: '/espace-membre/suivi',             label: 'Expériences' },
              { href: '/espace-membre/journal',           label: 'Journal' },
              { href: '/espace-membre/competences',       label: 'Compétences' },
              { href: '/espace-membre/questionnaires',    label: 'Questionnaires' },
              { href: '/espace-membre/reservations',      label: 'Réservations' },
              { href: '/espace-membre/profil',            label: 'Profil' },
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
                  COLONNE GAUCHE — Dossier + Stats + Timeline
              ════════════════════════════════════════════ */}
              <div className="space-y-8">

                {/* ── DOSSIER PERSONNEL ── */}
                <section aria-labelledby="profile-heading">
                  <div className="bg-white rounded-sm border border-[#E8D8B8] overflow-hidden">
                    <div className="bg-[#FAF6EF] border-b border-[#E8D8B8] px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white font-serif text-xl flex-shrink-0 shadow-sm"
                          aria-hidden="true"
                        >
                          {initials.length > 0 ? initials : <User size={22} />}
                        </div>
                        <div>
                          <h2 id="profile-heading" className="font-serif text-xl text-[#5C3D2E] leading-tight">{fullName}</h2>
                          <p className="text-xs font-sans text-[#7A6355] mt-0.5">Membre depuis {memberSince}</p>
                        </div>
                      </div>
                      <Link
                        href="/espace-membre/profil"
                        className="flex items-center gap-1.5 text-xs font-sans text-[#7A6355] hover:text-[#C8912A] border border-[#D4C4A8] hover:border-[#C8912A] px-3 py-1.5 rounded-sm transition-all duration-200"
                      >
                        <Settings size={12} />
                        Profil
                      </Link>
                    </div>

                    <div className="p-6">
                      {/* Alerte profil incomplet */}
                      {!profile?.first_name && (
                        <div className="mb-5 p-4 bg-[#FFF8E8] border border-[#E0B060] rounded-sm flex items-start gap-3">
                          <Sparkles size={16} className="text-[#C8912A] flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-sans font-medium text-[#5C3D2E]">Personnalisez votre livre de bord</p>
                            <p className="text-xs font-sans text-[#7A6355] mt-0.5 leading-relaxed">
                              Ajoutez votre prénom et votre intention pour que votre parcours vous ressemble vraiment.
                            </p>
                            <Link href="/espace-membre/profil" className="mt-2 inline-block text-xs font-sans text-[#C8912A] font-medium hover:underline">
                              Compléter mon profil →
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Infos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-5">
                        {profile?.email && (
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-0.5">Email</p>
                            <p className="text-sm font-sans text-[#2D1F14]">{profile.email}</p>
                          </div>
                        )}
                        {profile?.city && (
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-0.5">Ville</p>
                            <p className="text-sm font-sans text-[#2D1F14]">{profile.city}</p>
                          </div>
                        )}
                      </div>

                      {/* Intention / Motivation */}
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

                      {/* Export PDF */}
                      <div className="mt-5 pt-4 border-t border-[#F0E8DA] flex items-center gap-3">
                        <button
                          onClick={handlePdfExport}
                          disabled={pdfLoading}
                          className="flex items-center gap-2 text-xs font-sans text-[#5C3D2E] border border-[#D4C4A8] hover:border-[#C8912A] hover:text-[#C8912A] px-4 py-2 rounded-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-wait"
                          aria-label="Exporter mon livre de bord en PDF"
                        >
                          <Download size={13} />
                          {pdfLoading ? 'Génération…' : 'Exporter mon journal (PDF)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── STATS ── */}
                <section aria-labelledby="stats-heading">
                  <h2 id="stats-heading" className="sr-only">Résumé de votre évolution</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard
                      icon={<BookOpen size={16} />}
                      value={stages.length}
                      label={stages.length <= 1 ? 'Expérience' : 'Expériences'}
                      sub={completedStages.length > 0 ? `${completedStages.length} terminée${completedStages.length > 1 ? 's' : ''}` : undefined}
                      color="#5C3D2E"
                      href="/espace-membre/suivi"
                    />
                    <StatCard
                      icon={<Star size={16} />}
                      value={competencies.length}
                      label="Compétences"
                      sub={validatedComps.length > 0 ? `${validatedComps.length} validée${validatedComps.length > 1 ? 's' : ''}` : undefined}
                      color="#C8912A"
                      href="/espace-membre/competences"
                    />
                    <StatCard
                      icon={<Feather size={16} />}
                      value={totalNotes}
                      label={totalNotes <= 1 ? 'Note' : 'Notes'}
                      sub={questCount > 0 ? `${questCount} questionnaire${questCount > 1 ? 's' : ''}` : undefined}
                      color="#4A5E3A"
                      href="/espace-membre/journal"
                    />
                    <StatCard
                      icon={<Clock size={16} />}
                      value={formatLastActivity(lastActivity)}
                      label="Dernière activité"
                      color="#7A6355"
                    />
                  </div>
                </section>

                {/* ── TIMELINE UNIFIÉE (Phase 2) ── */}
                <section aria-labelledby="timeline-heading">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 id="timeline-heading" className="font-serif text-xl text-[#5C3D2E]">Mon parcours</h2>
                      <p className="text-xs font-sans text-[#7A6355] mt-0.5">Expériences · Notes · Guidances · Compétences</p>
                    </div>
                    <Link
                      href="/espace-membre/suivi"
                      className="text-xs font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors flex items-center gap-1"
                    >
                      Tout voir <ChevronRight size={13} />
                    </Link>
                  </div>
                  <MemberTimelineV2 limit={6} showLoadMore />
                </section>

                {/* ── Accès rapides ── */}
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
                        <p className="text-[11px] font-sans text-[#7A6355]">Mes stages à venir</p>
                      </div>
                      <ChevronRight size={14} className="text-[#D4C4A8] group-hover:text-[#C8912A] ml-auto flex-shrink-0 transition-colors" />
                    </Link>

                    <Link
                      href="/espace-membre/questionnaires"
                      className="group flex items-center gap-3 p-4 bg-white rounded-sm border border-[#E8D8B8] hover:border-[#C8912A]/60 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#F5EDD8] flex items-center justify-center flex-shrink-0">
                        <BookOpen size={16} className="text-[#C8912A]" />
                      </div>
                      <div>
                        <p className="text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">Questionnaires</p>
                        <p className="text-[11px] font-sans text-[#7A6355]">{questCount > 0 ? `${questCount} rempli${questCount > 1 ? 's' : ''}` : 'À découvrir'}</p>
                      </div>
                      <ChevronRight size={14} className="text-[#D4C4A8] group-hover:text-[#C8912A] ml-auto flex-shrink-0 transition-colors" />
                    </Link>
                  </div>
                </section>

              </div>{/* fin colonne gauche */}

              {/* ════════════════════════════════════════════
                  COLONNE DROITE — Sidebar
              ════════════════════════════════════════════ */}
              <aside className="space-y-5">

                {/* Compétences */}
                <SideBlock
                  title="Mes compétences"
                  action={
                    <Link href="/espace-membre/competences" className="text-[10px] font-sans text-[#C8912A] hover:underline">
                      Voir tout
                    </Link>
                  }
                >
                  {competencies.length === 0 ? (
                    <p className="text-xs font-sans text-[#7A6355] italic">Les compétences apparaissent au fil des stages.</p>
                  ) : (
                    <MemberCompetencyBars competencies={competencies} stages={stages} />
                  )}
                </SideBlock>

                {/* Progression */}
                <SideBlock title="Progression globale">
                  <MemberProgressCircles
                    completedStages={completedStages.length}
                    totalStages={stages.length}
                    notesCount={totalNotes}
                  />
                </SideBlock>

                {/* Notes récentes */}
                <SideBlock
                  title="Notes récentes"
                  action={
                    <Link href="/espace-membre/journal" className="text-[10px] font-sans text-[#C8912A] hover:underline">
                      Journal →
                    </Link>
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-[#F0E8DA]">
                      <span className="text-xs font-sans text-[#7A6355]">Notes de suivi</span>
                      <span className="text-sm font-serif text-[#5C3D2E]">{notesCount}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs font-sans text-[#7A6355]">Journal libre</span>
                      <span className="text-sm font-serif text-[#5C3D2E]">{journalCount}</span>
                    </div>
                    {questCount > 0 && (
                      <div className="flex items-center justify-between py-2 border-t border-[#F0E8DA]">
                        <span className="text-xs font-sans text-[#7A6355]">Questionnaires remplis</span>
                        <span className="text-sm font-serif text-[#5C3D2E]">{questCount}</span>
                      </div>
                    )}
                  </div>
                </SideBlock>

                {/* Graph */}
                <SideBlock title="Ma progression">
                  <MemberProgressChart stages={stages} />
                </SideBlock>

                {/* Lien stages */}
                <div className="bg-[#3B2315] rounded-sm p-4 text-center">
                  <p className="text-xs font-sans text-[#C8A888] mb-3 leading-relaxed">
                    Découvrez les prochains stages et ateliers des Ateliers de la Source
                  </p>
                  <Link
                    href="/evenements"
                    className="inline-flex items-center gap-1.5 text-xs font-sans text-white border border-[#C8912A] px-4 py-2 rounded-sm hover:bg-[#C8912A] transition-all duration-200"
                  >
                    Voir les stages <ChevronRight size={12} />
                  </Link>
                </div>

              </aside>

            </div>
          )}
        </Container>
      </div>
    </div>
  )
}
