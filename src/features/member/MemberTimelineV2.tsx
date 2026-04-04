'use client'
// src/features/member/MemberTimelineV2.tsx
// Timeline unifiée du membre — parcours de transformation
// Affiche expériences, notes, guidances, compétences, questionnaires sur une ligne du temps

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  BookOpen, Feather, MessageCircle, Award, FileText,
  ChevronRight, Lightbulb, Sparkles, Star
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

type TLEntry = {
  id: string
  type: 'experience' | 'journal' | 'guidance' | 'competency' | 'questionnaire' | 'note' | string
  title: string
  content: string | null
  date: string
  meta?: Record<string, unknown>
}

const TYPE_CFG: Record<string, {
  icon: React.ReactNode
  color: string
  ring: string
  bg: string
  label: string
  dot: string
}> = {
  experience: {
    icon: <BookOpen size={13} />,
    color: '#5C3D2E',
    ring: '#D4C4A8',
    bg: '#FAF6EF',
    label: 'Expérience',
    dot: '#5C3D2E',
  },
  journal: {
    icon: <Feather size={13} />,
    color: '#4A5E3A',
    ring: '#B8D4A8',
    bg: '#F0F5EC',
    label: 'Journal',
    dot: '#4A5E3A',
  },
  guidance: {
    icon: <MessageCircle size={13} />,
    color: '#C8912A',
    ring: '#E0B060',
    bg: '#FFF8E8',
    label: 'Guidance',
    dot: '#C8912A',
  },
  competency: {
    icon: <Award size={13} />,
    color: '#7A6355',
    ring: '#C8A888',
    bg: '#F5EDD8',
    label: 'Compétence',
    dot: '#7A6355',
  },
  questionnaire: {
    icon: <FileText size={13} />,
    color: '#5C3D2E',
    ring: '#D4C4A8',
    bg: '#FAF6EF',
    label: 'Questionnaire',
    dot: '#5C3D2E',
  },
  note: {
    icon: <Feather size={13} />,
    color: '#4A5E3A',
    ring: '#B8D4A8',
    bg: '#F0F5EC',
    label: 'Note',
    dot: '#4A5E3A',
  },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  completed: { label: 'Terminée', color: '#4A5E3A' },
  upcoming:  { label: 'À venir',  color: '#C8912A' },
  ongoing:   { label: 'En cours', color: '#C8912A' },
  planned:   { label: 'Prévue',   color: '#7A6355' },
  cancelled: { label: 'Annulée',  color: '#9CA3AF' },
}

const MONTHS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function getHref(entry: TLEntry): string {
  switch (entry.type) {
    case 'experience': return '/espace-membre/suivi'
    case 'journal':    return '/espace-membre/journal'
    case 'guidance':   return '/espace-membre/suivi'
    case 'competency': return '/espace-membre/competences'
    case 'questionnaire': return '/espace-membre/questionnaires'
    default:           return '/espace-membre'
  }
}

interface MemberTimelineV2Props {
  limit?: number
  showLoadMore?: boolean
  compact?: boolean
}

export function MemberTimelineV2({ limit = 8, showLoadMore = true, compact = false }: MemberTimelineV2Props) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TLEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/member/timeline', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      if (res.ok) {
        const d = await res.json()
        setEntries(d.timeline || [])
        setTotal(d.total || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { if (user) load() }, [user, load])

  const displayed = entries.slice(0, limit)

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#E8D8B8]" />
              <div className="w-px flex-1 bg-[#E8D8B8] mt-1 h-10" />
            </div>
            <div className="flex-1 pb-5">
              <div className="h-16 bg-[#E8D8B8] rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-sm border border-[#E8D8B8] p-10 text-center">
        <Sparkles size={32} className="text-[#D4C4A8] mx-auto mb-3" aria-hidden="true" />
        <p className="font-serif text-base text-[#5C3D2E] mb-1">Votre chemin commence ici</p>
        <p className="text-sm font-sans text-[#7A6355] max-w-xs mx-auto leading-relaxed mb-5">
          Vos expériences, notes et guidances apparaîtront ici au fil du temps.
        </p>
        <Link
          href="/evenements"
          className="inline-block text-xs font-sans font-medium text-[#C8912A] border border-[#C8912A] px-4 py-2 rounded-sm hover:bg-[#C8912A] hover:text-white transition-all duration-200"
        >
          Voir les prochains stages
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className={compact ? 'space-y-0' : ''}>
        {displayed.map((entry, idx) => {
          const cfg = TYPE_CFG[entry.type] || TYPE_CFG.note
          const isLast = idx === displayed.length - 1
          const isOpen = expanded === entry.id
          const status = entry.meta?.status as string | undefined
          const statusInfo = status ? STATUS_LABELS[status] : null

          return (
            <div key={entry.id} className="flex gap-3 group">
              {/* Dot + ligne */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ borderColor: cfg.ring, backgroundColor: 'white', color: cfg.color }}
                  aria-hidden="true"
                >
                  {cfg.icon}
                </div>
                {!isLast && <div className="w-px flex-1 bg-[#E8D8B8] mt-1" />}
              </div>

              {/* Contenu */}
              <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-4'}`}>
                <div
                  className="rounded-sm border transition-all duration-200 hover:shadow-sm cursor-pointer"
                  style={{ borderColor: cfg.ring, backgroundColor: cfg.bg }}
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                >
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span
                            className="text-[10px] font-sans uppercase tracking-widest"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          {statusInfo && (
                            <span
                              className="text-[10px] font-sans px-1.5 py-0.5 rounded-full border"
                              style={{ color: statusInfo.color, borderColor: statusInfo.color + '50' }}
                            >
                              {statusInfo.label}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-sm leading-snug" style={{ color: cfg.color }}>
                          {entry.title}
                        </h4>
                        <p className="text-[11px] font-sans text-[#7A6355] mt-0.5">{formatDate(entry.date)}</p>
                      </div>
                      <Link
                        href={getHref(entry)}
                        onClick={e => e.stopPropagation()}
                        className="flex-shrink-0 text-[#C8A888] hover:text-[#C8912A] transition-colors mt-0.5"
                        aria-label={`Voir ${entry.title}`}
                      >
                        <ChevronRight size={14} />
                      </Link>
                    </div>

                    {/* Contenu expandable */}
                    {isOpen && entry.content && (
                      <div className="mt-2 pt-2 border-t border-[#E8D8B8]">
                        {entry.type === 'guidance' ? (
                          <div className="flex items-start gap-1.5">
                            <MessageCircle size={11} className="flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
                            <p className="text-xs font-sans text-[#5C3D2E] italic leading-relaxed">
                              &ldquo;{entry.content}&rdquo;
                            </p>
                          </div>
                        ) : entry.type === 'competency' ? (
                          <div className="flex items-center gap-2">
                            <Star size={11} className="text-[#C8912A]" />
                            <p className="text-xs font-sans text-[#5C3D2E]">{entry.content}</p>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1.5">
                            {!!entry.meta?.key_insight && (
                              <Lightbulb size={11} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
                            )}
                            <p className="text-xs font-sans text-[#7A6355] leading-relaxed line-clamp-3">
                              {entry.content}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load more */}
      {showLoadMore && total > limit && (
        <div className="mt-2 pl-11">
          <Link
            href="/espace-membre/suivi"
            className="inline-flex items-center gap-1.5 text-xs font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors"
          >
            <span>Voir toute la timeline ({total} événements)</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      )}
    </div>
  )
}
