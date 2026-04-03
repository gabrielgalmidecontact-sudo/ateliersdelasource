'use client'
// src/features/member/MemberProgressCircles.tsx
// Indicateurs circulaires de progression — style premium, pas de bibliothèque externe

interface CircleProps {
  value: number      // 0–100
  label: string
  sublabel?: string
  color?: string
  size?: number
}

export function ProgressCircle({ value, label, sublabel, color = '#C8912A', size = 80 }: CircleProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Fond */}
        <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E8D8B8"
            strokeWidth="4"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        {/* Valeur centrale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-lg font-bold" style={{ color }}>
            {value}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-sans font-medium text-[#5C3D2E] leading-tight">{label}</p>
        {sublabel && <p className="text-[10px] font-sans text-[#7A6355] mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}

interface MemberProgressCirclesProps {
  stagesCompleted: number
  stagesTotal: number
  notesCount: number
}

export function MemberProgressCircles({ stagesCompleted, stagesTotal, notesCount }: MemberProgressCirclesProps) {
  const completionRate = stagesTotal > 0 ? Math.round((stagesCompleted / stagesTotal) * 100) : 0
  const engagementRate = Math.min(100, Math.round((notesCount / Math.max(1, stagesTotal)) * 25))

  return (
    <div className="flex items-center justify-center gap-8 py-4">
      <ProgressCircle
        value={completionRate}
        label="Taux de complétion"
        sublabel={`${stagesCompleted} / ${stagesTotal} effectué${stagesCompleted > 1 ? 's' : ''}`}
        color="#C8912A"
        size={88}
      />
      <ProgressCircle
        value={engagementRate}
        label="Engagement notes"
        sublabel={`${notesCount} note${notesCount > 1 ? 's' : ''} rédigée${notesCount > 1 ? 's' : ''}`}
        color="#4A5E3A"
        size={88}
      />
    </div>
  )
}
