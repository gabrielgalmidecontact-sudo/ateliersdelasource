'use client'
// src/features/member/MemberTimeline.tsx
// Timeline verticale des expériences (stage_logs) du membre
import Link from 'next/link'
import { ChevronRight, Star, Lightbulb, BookOpen } from 'lucide-react'
import type { StageLog } from '@/lib/supabase/types'

interface MemberTimelineProps {
  stages: StageLog[]
}

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

const STATUS_CONFIG: Record<string, { label: string; dot: string; ring: string }> = {
  completed: { label: 'Effectué',  dot: '#4A5E3A', ring: '#D4E4CC' },
  upcoming:  { label: 'À venir',   dot: '#C8912A', ring: '#F5EDD8' },
  cancelled: { label: 'Annulé',    dot: '#9CA3AF', ring: '#E5E7EB' },
}

function StarRow({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-0.5 mt-1" aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n} size={11}
          className={n <= value ? 'text-[#C8912A]' : 'text-[#D4C4A8]'}
          fill={n <= value ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export function MemberTimeline({ stages }: MemberTimelineProps) {
  if (stages.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
        <BookOpen size={36} className="text-[#D4C4A8] mx-auto mb-4" aria-hidden="true" />
        <h3 className="font-serif text-lg text-[#5C3D2E] mb-2">Votre chemin commence ici</h3>
        <p className="text-sm font-sans text-[#7A6355] max-w-xs mx-auto leading-relaxed">
          Vos expériences apparaîtront ici au fil du temps. Gabriel peut aussi créer votre première fiche de suivi.
        </p>
        <Link
          href="/evenements"
          className="inline-block mt-6 text-sm font-sans font-medium text-[#C8912A] hover:text-[#5C3D2E] transition-colors"
        >
          Découvrir les prochains stages →
        </Link>
      </div>
    )
  }

  // Trier par date décroissante
  const sorted = [...stages].sort((a, b) =>
    new Date(b.stage_date).getTime() - new Date(a.stage_date).getTime()
  )

  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div
        className="absolute left-[22px] top-3 bottom-3 w-px bg-[#D4C4A8]"
        aria-hidden="true"
      />

      <ol className="space-y-6">
        {sorted.map((stage, i) => {
          const d = new Date(stage.stage_date)
          const cfg = STATUS_CONFIG[stage.status] || STATUS_CONFIG.upcoming
          const hasInsight = !!(stage.key_insight?.trim())
          const hasReflection = !!(stage.reflection_after?.trim())

          return (
            <li key={stage.id} className="relative pl-14">
              {/* Point de timeline */}
              <div
                className="absolute left-0 top-3 w-[46px] h-[46px] rounded-full border-2 flex flex-col items-center justify-center bg-white text-center flex-shrink-0"
                style={{ borderColor: cfg.ring }}
                aria-hidden="true"
              >
                <span className="font-serif text-base font-bold leading-none" style={{ color: cfg.dot }}>
                  {d.getDate()}
                </span>
                <span className="text-[9px] font-sans uppercase tracking-wide" style={{ color: cfg.dot }}>
                  {MONTHS_FR[d.getMonth()].slice(0, 3)}
                </span>
              </div>

              {/* Carte */}
              <div className="bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 transition-colors duration-200 overflow-hidden">
                {/* En-tête */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-serif text-base text-[#5C3D2E] leading-snug">
                          {stage.stage_title}
                        </h3>
                        <span
                          className="text-[10px] font-sans px-2 py-0.5 rounded-full border"
                          style={{ color: cfg.dot, borderColor: cfg.ring, backgroundColor: cfg.ring + '60' }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-[#7A6355]">
                        {d.getDate()} {MONTHS_FR[d.getMonth()]} {d.getFullYear()} · Avec {stage.trainer}
                      </p>
                      <StarRow value={stage.rating} />
                    </div>
                    <Link
                      href="/espace-membre/suivi"
                      className="flex-shrink-0 text-[#D4C4A8] hover:text-[#C8912A] transition-colors mt-1"
                      aria-label={`Voir détail de ${stage.stage_title}`}
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>

                {/* Intention / insight / réflexion — affichage condensé */}
                {(stage.intention_before || hasInsight || hasReflection) && (
                  <div className="border-t border-[#F0E8DA] px-4 pb-4 pt-3 space-y-2">
                    {stage.intention_before && !hasReflection && (
                      <div className="flex items-start gap-2">
                        <BookOpen size={12} className="text-[#C8912A] flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-xs font-sans text-[#7A6355] leading-relaxed line-clamp-2 italic">
                          {stage.intention_before}
                        </p>
                      </div>
                    )}
                    {hasInsight && (
                      <div className="flex items-start gap-2 p-2.5 bg-[#FFF8E8] rounded-sm border-l-2 border-[#C8912A]">
                        <Lightbulb size={12} className="text-[#C8912A] flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-xs font-sans text-[#5C3D2E] leading-relaxed italic line-clamp-2">
                          « {stage.key_insight} »
                        </p>
                      </div>
                    )}
                    {hasReflection && !hasInsight && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#4A5E3A] flex-shrink-0 mt-0.5 text-xs">↳</span>
                        <p className="text-xs font-sans text-[#7A6355] leading-relaxed line-clamp-2">
                          {stage.reflection_after}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
