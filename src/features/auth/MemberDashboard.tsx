'use client'
// src/features/auth/MemberDashboard.tsx — "Mon chemin"
// Dashboard membre transformé en outil de parcours personnel
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, User, ChevronRight, Calendar } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { MemberHero } from '@/features/member/MemberHero'
import { MemberStats } from '@/features/member/MemberStats'
import { MemberTimeline } from '@/features/member/MemberTimeline'
import type { StageLog } from '@/lib/supabase/types'

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
        // Compter les notes liées aux stages
        const total = list.reduce((acc: number, s: StageLog & { member_notes?: unknown[] }) => {
          return acc + ((s as StageLog & { member_notes?: unknown[] }).member_notes?.length || 0)
        }, 0)
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

  const firstName = profile?.first_name || user.email.split('@')[0]
  const lastActivity = stages.length > 0
    ? [...stages].sort((a, b) => new Date(b.stage_date).getTime() - new Date(a.stage_date).getTime())[0]?.stage_date || null
    : null

  return (
    <>
      {/* Hero */}
      <MemberHero
        firstName={firstName}
        email={user.email}
        profile={profile}
        stagesCount={stages.length}
        notesCount={notesCount + journalCount}
        lastActivity={lastActivity}
        onSignOut={handleSignOut}
      />

      <div className="bg-[#FAF6EF] py-12">
        <Container>

          {/* Compléter profil */}
          {!profile?.first_name && (
            <div className="mb-8 p-5 bg-[#FFF8E8] border border-[#E0B060] rounded-sm flex items-start gap-3">
              <User size={18} className="text-[#C8912A] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-sans font-medium text-[#5C3D2E] text-sm mb-1">Personnalisez votre espace</p>
                <p className="text-xs font-sans text-[#7A6355]">
                  Ajoutez votre prénom et votre motivation pour un suivi plus humain.
                </p>
                <Link href="/espace-membre/profil" className="mt-2 inline-block text-xs font-sans text-[#C8912A] font-medium hover:underline">
                  Compléter mon profil →
                </Link>
              </div>
            </div>
          )}

          {dataLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <section aria-labelledby="stats-heading" className="mb-12">
                <h2 id="stats-heading" className="sr-only">Résumé de votre évolution</h2>
                <MemberStats stages={stages} notesCount={notesCount} journalCount={journalCount} />
              </section>

              {/* Timeline */}
              <section aria-labelledby="timeline-heading" className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 id="timeline-heading" className="font-serif text-2xl text-[#5C3D2E]">
                    Mon parcours
                  </h2>
                  {stages.length > 0 && (
                    <Link
                      href="/espace-membre/suivi"
                      className="text-sm font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors flex items-center gap-1"
                    >
                      Tout voir <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
                <MemberTimeline stages={stages.slice(0, 5)} />
              </section>

              {/* Accès rapide */}
              <section aria-labelledby="quick-access-heading">
                <h2 id="quick-access-heading" className="font-serif text-xl text-[#5C3D2E] mb-4">
                  Accès rapide
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    href="/espace-membre/journal"
                    className="group flex items-center gap-4 p-4 bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F5EDD8] group-hover:bg-[#FFF8E8] flex items-center justify-center flex-shrink-0 transition-colors">
                      <span className="text-[#C8912A] text-base">✦</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans font-medium text-sm text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">Journal</p>
                      <p className="text-xs font-sans text-[#7A6355] mt-0.5">Notes libres</p>
                    </div>
                    <ChevronRight size={16} className="text-[#D4C4A8] group-hover:text-[#C8912A] ml-auto flex-shrink-0 transition-colors" />
                  </Link>

                  <Link
                    href="/espace-membre/reservations"
                    className="group flex items-center gap-4 p-4 bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FFF8E8] flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-[#C8912A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans font-medium text-sm text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">Réservations</p>
                      <p className="text-xs font-sans text-[#7A6355] mt-0.5">Stages inscrits</p>
                    </div>
                    <ChevronRight size={16} className="text-[#D4C4A8] group-hover:text-[#C8912A] ml-auto flex-shrink-0 transition-colors" />
                  </Link>

                  <Link
                    href="/espace-membre/newsletter"
                    className="group flex items-center gap-4 p-4 bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F0F5EC] flex items-center justify-center flex-shrink-0">
                      <Bell size={18} className="text-[#4A5E3A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans font-medium text-sm text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">Newsletter</p>
                      <p className="text-xs font-sans text-[#7A6355] mt-0.5">Préférences</p>
                    </div>
                    <ChevronRight size={16} className="text-[#D4C4A8] group-hover:text-[#C8912A] ml-auto flex-shrink-0 transition-colors" />
                  </Link>
                </div>
              </section>

              {/* CTA découverte */}
              <div className="mt-10 text-center">
                <Button href="/evenements" variant="outline" size="md">
                  Voir les prochains stages
                </Button>
              </div>
            </>
          )}
        </Container>
      </div>
    </>
  )
}
