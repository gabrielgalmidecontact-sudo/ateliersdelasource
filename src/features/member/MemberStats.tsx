'use client'
// src/features/member/MemberStats.tsx
// Résumé évolution — nombre stages, notes, dernière activité
import { BookOpen, Feather, Clock } from 'lucide-react'
import type { StageLog } from '@/lib/supabase/types'

interface MemberStatsProps {
  stages: StageLog[]
  notesCount: number
  journalCount: number
}

export function MemberStats({ stages, notesCount, journalCount }: MemberStatsProps) {
  const completed = stages.filter(s => s.status === 'completed').length
  const upcoming  = stages.filter(s => s.status === 'upcoming').length
  const totalNotes = notesCount + journalCount

  // Calcul insight : stages avec key_insight renseigné
  const withInsight = stages.filter(s => s.key_insight && s.key_insight.trim()).length

  const stats = [
    {
      icon: <BookOpen size={20} />,
      value: stages.length,
      label: stages.length <= 1 ? 'Expérience' : 'Expériences',
      sub: completed > 0 ? `${completed} effectuée${completed > 1 ? 's' : ''}` : upcoming > 0 ? `${upcoming} à venir` : null,
      color: '#5C3D2E',
      bg: '#F5EDD8',
    },
    {
      icon: <Feather size={20} />,
      value: totalNotes,
      label: totalNotes <= 1 ? 'Note écrite' : 'Notes écrites',
      sub: journalCount > 0 ? `${journalCount} dans le journal` : null,
      color: '#4A5E3A',
      bg: '#EFF3EC',
    },
    {
      icon: <span className="text-lg">✦</span>,
      value: withInsight,
      label: withInsight <= 1 ? 'Prise de conscience' : 'Prises de conscience',
      sub: withInsight > 0 ? 'enregistrées' : 'à venir',
      color: '#C8912A',
      bg: '#FFF8E8',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white rounded-sm border border-[#D4C4A8] p-5 flex items-center gap-4"
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: s.bg, color: s.color }}
            aria-hidden="true"
          >
            {s.icon}
          </div>
          <div>
            <div className="font-serif text-3xl leading-none" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs font-sans text-[#5C3D2E] mt-0.5 font-medium">{s.label}</div>
            {s.sub && (
              <div className="text-[11px] font-sans text-[#7A6355] mt-0.5">{s.sub}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
