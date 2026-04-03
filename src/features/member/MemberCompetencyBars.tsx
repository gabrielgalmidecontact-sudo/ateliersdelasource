'use client'
// src/features/member/MemberCompetencyBars.tsx
// Barres de compétences premium — alimentées par les données de stage

import type { StageLog } from '@/lib/supabase/types'

interface Competency {
  label: string
  value: number   // 0–100
  color: string
}

function deriveCompetencies(stages: StageLog[]): Competency[] {
  const completed = stages.filter(s => s.status === 'completed')
  if (completed.length === 0) {
    return [
      { label: 'Présence corporelle', value: 0, color: '#C8912A' },
      { label: 'Expression orale', value: 0, color: '#4A5E3A' },
    ]
  }

  // Calcul de score basé sur : rating moyen, reflections renseignées, insights notés
  const avgRating = completed.reduce((acc, s) => acc + (s.rating || 0), 0) / completed.length
  const withReflection = completed.filter(s => s.reflection_after?.trim()).length
  const withInsight = completed.filter(s => s.key_insight?.trim()).length

  const presenceScore = Math.min(100, Math.round(
    (avgRating / 5) * 50 + (withReflection / completed.length) * 30 + 20
  ))
  const expressionScore = Math.min(100, Math.round(
    (withInsight / completed.length) * 60 + (completed.length / Math.max(3, completed.length)) * 40
  ))

  return [
    { label: 'Présence corporelle', value: presenceScore, color: '#C8912A' },
    { label: 'Expression orale', value: expressionScore, color: '#4A5E3A' },
  ]
}

interface CompetencyBarProps {
  label: string
  value: number
  color: string
}

function CompetencyBar({ label, value, color }: CompetencyBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans text-[#5C3D2E] font-medium">{label}</span>
        <span className="text-xs font-sans font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-[#E8D8B8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

interface MemberCompetencyBarsProps {
  stages: StageLog[]
}

export function MemberCompetencyBars({ stages }: MemberCompetencyBarsProps) {
  const competencies = deriveCompetencies(stages)
  const hasData = stages.filter(s => s.status === 'completed').length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355]">
          Compétences développées
        </p>
        {!hasData && (
          <span className="text-[10px] font-sans text-[#C8A888] italic">En construction</span>
        )}
      </div>
      {competencies.map(c => (
        <CompetencyBar key={c.label} {...c} />
      ))}
      {!hasData && (
        <p className="text-[11px] font-sans text-[#7A6355] italic leading-relaxed mt-2">
          Vos compétences se calculeront automatiquement après votre premier stage.
        </p>
      )}
    </div>
  )
}
