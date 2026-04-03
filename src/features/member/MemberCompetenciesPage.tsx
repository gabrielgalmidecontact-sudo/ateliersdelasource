'use client'
// src/features/member/MemberCompetenciesPage.tsx
// Vue membre de ses compétences — niveau et validation par Gabriel
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Circle, Award } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import type { MemberCompetency, Competency } from '@/lib/supabase/types'

type MemberCompetencyWithComp = MemberCompetency & { competency?: Competency }

const MONTHS_FR = ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'jun.', 'jul.', 'aoû.', 'sep.', 'oct.', 'nov.', 'déc.']

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function CompetencyCard({ mc }: { mc: MemberCompetencyWithComp }) {
  const comp = mc.competency
  const barColor = mc.is_validated ? '#4A5E3A' : '#C8912A'

  return (
    <div className={`bg-white rounded-sm border p-5 ${mc.is_validated ? 'border-[#B8D4A8]' : 'border-[#D4C4A8]'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {comp?.icon && <span className="text-2xl leading-none">{comp.icon}</span>}
          <div>
            <h3 className="font-serif text-base text-[#5C3D2E] leading-tight">{comp?.name || '—'}</h3>
            {comp?.category && (
              <p className="text-[10px] font-sans text-[#7A6355] uppercase tracking-wide mt-0.5">{comp.category}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg font-serif font-bold" style={{ color: barColor }}>{mc.level}%</span>
          {mc.is_validated ? (
            <div className="flex items-center gap-1">
              <CheckCircle size={16} className="text-[#4A5E3A]" />
              <span className="text-[10px] font-sans text-[#4A5E3A]">Validé</span>
            </div>
          ) : (
            <Circle size={16} className="text-[#D4C4A8]" />
          )}
        </div>
      </div>

      {comp?.description && (
        <p className="text-xs font-sans text-[#7A6355] mb-3 leading-relaxed">{comp.description}</p>
      )}

      {/* Barre de progression */}
      <div className="w-full bg-[#F0E8DA] rounded-full h-2 overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${mc.level}%`, backgroundColor: barColor }}
        />
      </div>

      {mc.notes && (
        <div className="p-3 bg-[#FAF6EF] rounded-sm border border-[#E8D8B8]">
          <p className="text-xs font-sans text-[#7A6355] italic leading-relaxed">{mc.notes}</p>
        </div>
      )}

      {mc.is_validated && mc.validated_at && mc.validated_by && (
        <p className="text-[10px] font-sans text-[#4A5E3A] mt-2">
          ✓ Validé par {mc.validated_by} le {formatDate(mc.validated_at)}
        </p>
      )}
    </div>
  )
}

export function MemberCompetenciesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [competencies, setCompetencies] = useState<MemberCompetencyWithComp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) router.push('/connexion')
  }, [user, isLoading, router])

  const loadData = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/member/competencies', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setCompetencies(d.competencies || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (user) loadData() }, [user, loadData])

  const validated = competencies.filter(c => c.is_validated)
  const inProgress = competencies.filter(c => !c.is_validated)

  if (isLoading || !user) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header */}
      <div className="pt-24 pb-8 bg-[#3B2315]">
        <Container>
          <div className="flex items-center gap-3 mb-4">
            <Link href="/espace-membre" className="text-[#C8A888] hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
          </div>
          <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#C8912A] mb-1">Espace personnel</p>
          <h1 className="font-serif text-3xl text-[#F5EDD8]">Mes compétences</h1>
          <p className="text-sm font-sans text-[#C8A888] mt-1">
            Suivies et validées par Gabriel
          </p>
        </Container>
      </div>

      <div className="py-10">
        <Container className="max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : competencies.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
              <Award size={40} className="text-[#D4C4A8] mx-auto mb-4" />
              <p className="font-serif text-xl text-[#7A6355] mb-2">Pas encore de compétences</p>
              <p className="text-sm font-sans text-[#7A6355] max-w-sm mx-auto leading-relaxed">
                Gabriel définira et suivra vos compétences au fil de votre parcours.
                Elles apparaîtront ici au fil du temps.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-sm border border-[#E8D8B8] p-4 text-center">
                  <div className="font-serif text-3xl text-[#5C3D2E]">{competencies.length}</div>
                  <div className="text-xs font-sans text-[#7A6355] mt-0.5">Compétences suivies</div>
                </div>
                <div className="bg-white rounded-sm border border-[#B8D4A8] p-4 text-center">
                  <div className="font-serif text-3xl text-[#4A5E3A]">{validated.length}</div>
                  <div className="text-xs font-sans text-[#7A6355] mt-0.5">Validées</div>
                </div>
                <div className="bg-white rounded-sm border border-[#E8D8B8] p-4 text-center">
                  <div className="font-serif text-3xl text-[#C8912A]">
                    {competencies.length > 0
                      ? Math.round(competencies.reduce((s, c) => s + c.level, 0) / competencies.length)
                      : 0}%
                  </div>
                  <div className="text-xs font-sans text-[#7A6355] mt-0.5">Niveau moyen</div>
                </div>
              </div>

              {/* Validées */}
              {validated.length > 0 && (
                <section>
                  <h2 className="font-serif text-xl text-[#5C3D2E] mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-[#4A5E3A]" />
                    Compétences validées
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {validated.map(mc => <CompetencyCard key={mc.id} mc={mc} />)}
                  </div>
                </section>
              )}

              {/* En progression */}
              {inProgress.length > 0 && (
                <section>
                  <h2 className="font-serif text-xl text-[#5C3D2E] mb-4 flex items-center gap-2">
                    <Circle size={18} className="text-[#C8912A]" />
                    En progression
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inProgress.map(mc => <CompetencyCard key={mc.id} mc={mc} />)}
                  </div>
                </section>
              )}

              {/* Message d'encouragement */}
              <div className="bg-[#FFF8E8] border border-[#E0B060] rounded-sm p-5">
                <p className="text-sm font-sans text-[#5C3D2E] italic leading-relaxed">
                  &ldquo;Chaque compétence est une porte qui s&apos;ouvre sur une version de vous plus libre,
                  plus présente, plus entière. Ces jalons ne mesurent pas votre valeur — ils témoignent de
                  votre chemin.&rdquo;
                </p>
                <p className="text-xs font-sans text-[#C8912A] mt-2">— Gabriel, Les Ateliers de la Source</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#E8D8B8]">
            <Link
              href="/espace-membre"
              className="text-sm font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors flex items-center gap-1.5"
            >
              ← Retour au livre de bord
            </Link>
          </div>
        </Container>
      </div>
    </div>
  )
}
