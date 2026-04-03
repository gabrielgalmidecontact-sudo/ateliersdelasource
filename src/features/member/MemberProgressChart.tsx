'use client'
// src/features/member/MemberProgressChart.tsx
// Mini graphe d'évolution — SVG pur, sans bibliothèque externe

import type { StageLog } from '@/lib/supabase/types'

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

interface DataPoint {
  month: string
  value: number
}

function buildChartData(stages: StageLog[]): DataPoint[] {
  const now = new Date()
  const points: DataPoint[] = []

  // 6 derniers mois
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = MONTHS_FR[d.getMonth()]
    const stagesInMonth = stages.filter(s => {
      const sd = new Date(s.stage_date)
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth()
    })
    const avgRating = stagesInMonth.length > 0
      ? stagesInMonth.reduce((acc, s) => acc + (s.rating || 0), 0) / stagesInMonth.length
      : 0
    // Valeur composite : présence d'un stage (40pts) + rating moyen (60pts/5)
    const val = stagesInMonth.length > 0 ? Math.round(40 + (avgRating / 5) * 60) : 0
    points.push({ month, value: val })
  }
  return points
}

interface MemberProgressChartProps {
  stages: StageLog[]
}

export function MemberProgressChart({ stages }: MemberProgressChartProps) {
  const data = buildChartData(stages)
  const hasData = data.some(d => d.value > 0)

  const chartW = 260
  const chartH = 80
  const padX = 20
  const padY = 8

  // Normaliser les valeurs
  const maxVal = Math.max(...data.map(d => d.value), 1)
  const pts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (chartW - 2 * padX)
    const y = padY + (1 - d.value / maxVal) * (chartH - 2 * padY)
    return { x, y, value: d.value, month: d.month }
  })

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${chartH} L ${pts[0].x} ${chartH} Z`

  return (
    <div>
      <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-3">
        Évolution de votre engagement
      </p>

      {hasData ? (
        <div className="relative">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full"
            style={{ height: 80 }}
            role="img"
            aria-label="Graphe d'évolution de l'engagement"
          >
            {/* Aire */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8912A" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#C8912A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#chartGrad)" />
            {/* Ligne */}
            <path
              d={pathD}
              fill="none"
              stroke="#C8912A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Points */}
            {pts.map((p, i) => p.value > 0 && (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="white"
                stroke="#C8912A"
                strokeWidth="1.5"
              />
            ))}
          </svg>
          {/* Labels mois */}
          <div className="flex justify-between mt-1">
            {data.map(d => (
              <span key={d.month} className="text-[10px] font-sans text-[#C8A888]">{d.month}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-16 text-center">
          <p className="text-xs font-sans text-[#7A6355] italic">
            Votre courbe d&apos;évolution apparaîtra ici
          </p>
          <p className="text-[11px] font-sans text-[#C8A888] mt-1">après votre première expérience</p>
        </div>
      )}
    </div>
  )
}
