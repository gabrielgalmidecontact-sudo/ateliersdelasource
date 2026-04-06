'use client'
// src/features/member/MemberCompetencyBars.tsx
// Barres de compétences — réelles (depuis Supabase) ou calculées (fallback)
import { CheckCircle, Circle } from 'lucide-react'
import type { StageLog, MemberCompetency, Competency } from '@/lib/supabase/types'

type MemberCompetencyWithComp = MemberCompetency & { competency?: Competency }

interface CompetencyBarItemProps {
  label: string
  icon?: string | null
  value: number
  color: string
  isValidated?: boolean
  validatedBy?: string | null
}

function CompetencyBar({ label, icon, value, color, isValidated, validatedBy }: CompetencyBarItemProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-sm leading-none">{icon}</span>}
          <span className="text-xs font-sans text-[#5C3D2E] font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-sans font-bold" style={{ color }}>{value}%</span>
          {isValidated !== undefined && (
            isValidated
              ? <CheckCircle size={11} className="text-[#4A5E3A]" aria-label={validatedBy ? `Validé par ${validatedBy}` : 'Validé'} />
              : <Circle size={11} className="text-[#D4C4A8]" aria-label="En cours" />
          )}
        </div>
      </div>
      <div className="h-1.5 bg-[#E8D8B8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${value}%`, backgroundColor: isValidated ? '#4A5E3A' : color }}
        />
      </div>
    </div>
  )
}

// Calcul de fallback si pas de données réelles
function deriveCompetencies(stages: StageLog[]): CompetencyBarItemProps[] {
  const completed = stages.filter(s => s.status === 'completed')
  if (completed.length === 0) {
    return [
      { label: 'Présence corporelle', value: 0, color: '#C8912A' },
      { label: 'Expression orale',    value: 0, color: '#4A5E3A' },
    ]
  }
  const avgRating = completed.reduce((acc, s) => acc + (s.rating || 0), 0) / completed.length
  const withReflection = completed.filter(s => s.reflection_after?.trim()).length
  const withInsight = completed.filter(s => s.key_insight?.trim()).length
  const presenceScore = Math.min(100, Math.round((avgRating / 5) * 50 + (withReflection / completed.length) * 30 + 20))
  const expressionScore = Math.min(100, Math.round((withInsight / completed.length) * 60 + (completed.length / Math.max(3, completed.length)) * 40))
  return [
    { label: 'Présence corporelle', value: presenceScore, color: '#C8912A' },
    { label: 'Expression orale',    value: expressionScore, color: '#4A5E3A' },
  ]
}

interface MemberCompetencyBarsProps {
  stages: StageLog[]
  realCompetencies?: MemberCompetencyWithComp[]
}

export function MemberCompetencyBars({ stages, realCompetencies }: MemberCompetencyBarsProps) {
  // Utiliser les compétences réelles si disponibles
  const hasRealData = realCompetencies && realCompetencies.length > 0
  const hasCompleted = stages.filter(s => s.status === 'completed').length > 0

  if (hasRealData) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355]">
            Compétences validées par Gabriel
          </p>
          <span className="text-[10px] font-sans text-[#4A5E3A]">
            {realCompetencies!.filter(c => c.is_validated).length}/{realCompetencies!.length}
          </span>
        </div>
        {realCompetencies!.map(mc => (
          <CompetencyBar
            key={mc.id}
            label={mc.competency?.name || '—'}
            icon={mc.competency?.icon}
            value={mc.level}
            color="#C8912A"
            isValidated={mc.is_validated}
            validatedBy={mc.validated_by}
          />
        ))}
      </div>
    )
  }

  // Fallback : compétences calculées
  const derivedComps = deriveCompetencies(stages)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355]">
          Compétences développées
        </p>
        {!hasCompleted && (
          <span className="text-[10px] font-sans text-[#C8A888] italic">En construction</span>
        )}
      </div>
      {derivedComps.map(c => (
        <CompetencyBar key={c.label} {...c} />
      ))}
      {!hasCompleted && (
        <p className="text-[11px] font-sans text-[#7A6355] italic leading-relaxed mt-2">
          Gabriel renseignera vos compétences au fil de vos expériences.
        </p>
      )}
    </div>
  )
}
