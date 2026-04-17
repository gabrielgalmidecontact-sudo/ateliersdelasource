'use client'
// src/features/admin/AdminDashboard.tsx — Espace accompagnement Gabriel
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users, FileText, Calendar, Settings, LogOut, ChevronRight,
  BookOpen, Feather, Plus, Eye, Award, MessageSquare
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { AdminBeginnerMode } from '@/features/admin/AdminBeginnerMode'

interface MemberSummary {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  stages_count: number
  last_stage_date: string | null
  created_at: string
}

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function timeSince(iso: string): string {
  const now = new Date()
  const d = new Date(iso)
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7) return `Il y a ${diff} jours`
  if (diff < 30) return `Il y a ${Math.floor(diff / 7)} sem.`
  return formatDate(iso)
}

// ─── Section block ────────────────────────────────────────────────────────────
function AdminSection({ title, action, children }: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E8DA]">
        <h2 className="font-serif text-base text-[#5C3D2E]">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </div>
  )
}

// ─── Stat block ───────────────────────────────────────────────────────────────
function AdminStat({ value, label, icon, color = '#C8912A' }: {
  value: number | string
  label: string
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="bg-white rounded-sm border border-[#D4C4A8] p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '15', color }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <div className="font-serif text-3xl leading-none" style={{ color }}>{value}</div>
        <div className="text-xs font-sans text-[#7A6355] mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const { user, profile, isAdmin, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [stats, setStats] = useState({ members: 0, stages: 0, reservations: 0 })
  const [reviewPendingCount, setReviewPendingCount] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => { setVisible(true) }, [])

  useEffect(() => {
    if (!isLoading) {
      if (!user) { router.push('/connexion'); return }
      if (!isAdmin) { router.push('/espace-membre') }
    }
  }, [user, isAdmin, isLoading, router])

  useEffect(() => {
    if (!user || !isAdmin) return

    fetch('/api/admin/members', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    }).then(r => r.json()).then(data => {
      if (data.members) {
        const list: MemberSummary[] = data.members
        setMembers(list)
        setStats(s => ({ ...s, members: list.length }))
      }
    })

    fetch('/api/admin/reviews?status=pending', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    }).then(r => r.json()).then(data => {
      if (typeof data.pendingCount === 'number') {
        setReviewPendingCount(data.pendingCount)
      } else if (Array.isArray(data.reviews)) {
        setReviewPendingCount(data.reviews.filter((item: { is_published?: boolean }) => !item.is_published).length)
      }
    })
  }, [user, isAdmin])

  if (isLoading || !user) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Membres récents (5 derniers inscrits)
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Membres avec suivi actif (ont des stages)
  const activeMembers = members.filter(m => (m.stages_count || 0) > 0)
    .sort((a, b) => {
      if (a.last_stage_date && b.last_stage_date) {
        return new Date(b.last_stage_date).getTime() - new Date(a.last_stage_date).getTime()
      }
      return 0
    })
    .slice(0, 5)

  const accesRapides = [
    {
      href: '/admin/membres',
      icon: <Users size={20} />,
      label: 'Membres',
      description: 'Fiches de suivi et accompagnement',
      badge: stats.members > 0 ? String(stats.members) : null,
      color: '#5C3D2E',
    },
    {
      href: '/admin/groupes',
      icon: <Users size={20} />,
      label: 'Groupes',
      description: 'Organiser les membres',
      badge: null,
      color: '#4A5E3A',
    },
    {
      href: '/admin/questionnaires',
      icon: <FileText size={20} />,
      label: 'Questionnaires',
      description: 'Créer et gérer les questionnaires',
      badge: null,
      color: '#C8912A',
    },
    {
      href: '/admin/competences',
      icon: <Award size={20} />,
      label: 'Compétences',
      description: 'Référentiel et validation',
      badge: null,
      color: '#4A5E3A',
    },
    {
      href: '/admin/avis',
      icon: <MessageSquare size={20} />,
      label: 'Avis',
      description: 'Valider les témoignages',
      badge: reviewPendingCount > 0 ? String(reviewPendingCount) : null,
      color: '#C8912A',
    },
    {
      href: '/studio',
      icon: <Settings size={20} />,
      label: 'Sanity Studio',
      description: 'Modifier le contenu du site',
      badge: null,
      color: '#7A6355',
      external: true,
    },
    {
      href: '/admin/evenements',
      icon: <Calendar size={20} />,
      label: 'Événements',
      description: 'Agenda et inscriptions',
      badge: null,
      color: '#7A6355',
    },
    {
      href: '/admin/newsletter',
      icon: <Feather size={20} />,
      label: 'Newsletter',
      description: 'Abonnés et envoi des campagnes',
      badge: null,
      color: '#4A5E3A',
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAF6EF]">

      {/* ── Header admin ── */}
      <div className="bg-[#3B2315] border-b border-[#5C3D2E]">
        <Container>
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-serif text-base text-[#F5EDD8] hover:text-[#C8912A] transition-colors">
                Les Ateliers de la Source
              </Link>
              <span className="text-[#5C3D2E]">/</span>
              <span className="text-sm font-sans text-[#C8A888]">Administration</span>
            </div>
            <div className="flex items-center gap-3">
              <AdminBeginnerMode />
              <span className="text-xs font-sans text-[#C8A888] hidden sm:block">{profile?.first_name || user.email}</span>
              <button
                onClick={async () => { await signOut(); router.push('/') }}
                className="flex items-center gap-1.5 text-xs font-sans text-[#C8A888] hover:text-white transition-colors"
                aria-label="Se déconnecter"
              >
                <LogOut size={13} /> Déconnexion
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Contenu ── */}
      <div className="py-10">
        <Container>
          <div
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >

            {/* Accroche */}
            <div className="mb-8">
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Tableau de bord</p>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#5C3D2E]">
                Bonjour, {profile?.first_name || 'Gabriel'}
              </h1>
              <p className="text-sm font-sans text-[#7A6355] mt-1">
                Votre espace d&apos;accompagnement — Les Ateliers de la Source
              </p>
            </div>

            {/* ── Stats rapides ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <AdminStat
                value={stats.members}
                label="Membres inscrits"
                icon={<Users size={18} />}
                color="#5C3D2E"
              />
              <AdminStat
                value={activeMembers.length}
                label="Suivis actifs"
                icon={<BookOpen size={18} />}
                color="#C8912A"
              />
              <AdminStat
                value={members.filter(m => {
                  const d = new Date(m.created_at)
                  const now = new Date()
                  return now.getTime() - d.getTime() < 30 * 86400000
                }).length}
                label="Nouveaux (30j)"
                icon={<Feather size={18} />}
                color="#4A5E3A"
              />
              <AdminStat
                value={reviewPendingCount}
                label="Avis en attente"
                icon={<MessageSquare size={18} />}
                color="#7A6355"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

              {/* ── Colonne principale ── */}
              <div className="space-y-6">

                {/* Membres à suivre */}
                <AdminSection
                  title="Membres à suivre"
                  action={
                    <Link href="/admin/membres" className="text-xs font-sans text-[#C8912A] hover:underline flex items-center gap-1">
                      Voir tous <ChevronRight size={12} />
                    </Link>
                  }
                >
                  {activeMembers.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users size={28} className="text-[#D4C4A8] mx-auto mb-2" />
                      <p className="text-sm font-sans text-[#7A6355]">Aucun suivi actif pour le moment.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F0E8DA]">
                      {activeMembers.map(m => {
                        const name = [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email
                        const initials = [(m.first_name || '?')[0], (m.last_name || '')[0]].filter(Boolean).join('').toUpperCase() || '?'
                        return (
                          <Link
                            key={m.id}
                            href={`/admin/membres/${m.id}`}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAF6EF] transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white text-xs font-serif flex-shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">{name}</p>
                              <p className="text-xs font-sans text-[#7A6355]">
                                {m.stages_count} expérience{(m.stages_count || 0) > 1 ? 's' : ''}
                                {m.last_stage_date && ` · ${timeSince(m.last_stage_date)}`}
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-[#D4C4A8] group-hover:text-[#C8912A] flex-shrink-0 transition-colors" />
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </AdminSection>

                {/* Membres récents */}
                <AdminSection
                  title="Inscriptions récentes"
                  action={
                    <Link href="/admin/membres" className="text-xs font-sans text-[#C8912A] hover:underline flex items-center gap-1">
                      Gérer <ChevronRight size={12} />
                    </Link>
                  }
                >
                  {recentMembers.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm font-sans text-[#7A6355]">Aucun membre inscrit.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F0E8DA]">
                      {recentMembers.map(m => {
                        const name = [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email
                        const initials = [(m.first_name || '?')[0], (m.last_name || '')[0]].filter(Boolean).join('').toUpperCase() || '?'
                        return (
                          <Link
                            key={m.id}
                            href={`/admin/membres/${m.id}`}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAF6EF] transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-[#F5EDD8] border border-[#D4C4A8] flex items-center justify-center text-[#5C3D2E] text-xs font-serif flex-shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors truncate">{name}</p>
                              <p className="text-xs font-sans text-[#7A6355]">
                                Inscrit {timeSince(m.created_at)}
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-[#D4C4A8] group-hover:text-[#C8912A] flex-shrink-0 transition-colors" />
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </AdminSection>

              </div>

              {/* ── Colonne droite — accès rapides ── */}
              <div className="space-y-4">
                {/* Accès rapides */}
                <div className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F0E8DA]">
                    <h2 className="font-serif text-base text-[#5C3D2E]">Accès rapides</h2>
                  </div>
                  <div className="divide-y divide-[#F0E8DA]">
                    {accesRapides.map((card) => (
                      <Link
                        key={card.href}
                        href={card.href}
                        target={card.external ? '_blank' : undefined}
                        rel={card.external ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-3 px-5 py-4 hover:bg-[#FAF6EF] transition-colors group"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: card.color + '15', color: card.color }}
                          aria-hidden="true"
                        >
                          {card.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">
                              {card.label}
                            </p>
                            {card.badge && (
                              <span className="text-[10px] font-sans font-bold text-[#C8912A] bg-[#FFF8E8] px-1.5 py-0.5 rounded-full">
                                {card.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-sans text-[#7A6355]">{card.description}</p>
                        </div>
                        <ChevronRight size={14} className="text-[#D4C4A8] group-hover:text-[#C8912A] flex-shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Action principale */}
                <Link
                  href="/admin/membres"
                  className="flex items-center justify-center gap-2 p-4 bg-[#5C3D2E] hover:bg-[#3B2315] text-white rounded-sm transition-colors duration-200 font-sans text-sm font-medium"
                >
                  <Plus size={15} />
                  Suivre un nouveau membre
                </Link>

                {/* Prochaines évolutions */}
                <div className="bg-[#F5EDD8] rounded-sm border border-[#D4C4A8] p-4">
                  <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-2">Prochainement</p>
                  <ul className="space-y-1.5">
                    {[
                      'Rappels automatiques membre',
                      'Cycles automatisés',
                      'Partage de journal',
                      'Tableau de bord multi-accompagnant',
                    ].map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs font-sans text-[#7A6355]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8912A] flex-shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
