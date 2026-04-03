'use client'
// src/features/member/MemberHero.tsx
// Bandeau héro espace membre — prénom, stats rapides, déconnexion
import Link from 'next/link'
import { LogOut, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import type { Profile } from '@/lib/supabase/types'

interface MemberHeroProps {
  firstName: string
  email: string
  profile: Profile | null
  stagesCount: number
  notesCount: number
  lastActivity: string | null
  onSignOut: () => void
}

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return 'Aucune activité'
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

export function MemberHero({ firstName, email, stagesCount, notesCount, lastActivity, onSignOut }: MemberHeroProps) {
  return (
    <div className="pt-24 pb-12 bg-[#3B2315]">
      <Container>
        <div className="flex items-start justify-between flex-wrap gap-4">
          {/* Identité */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#C8912A]">Mon chemin</span>
              <Sparkles size={12} className="text-[#C8912A]" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#F5EDD8] leading-tight">
              Bonjour, {firstName}&nbsp;
            </h1>
            <p className="text-sm font-sans text-[#C8A888] mt-1.5">{email}</p>
          </div>

          {/* Déconnexion */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 text-sm font-sans text-[#C8A888] hover:text-white transition-colors mt-1"
            aria-label="Se déconnecter"
          >
            <LogOut size={15} />
            Se déconnecter
          </button>
        </div>

        {/* Stats rapides */}
        <div className="mt-8 flex flex-wrap gap-6">
          <div>
            <span className="font-serif text-3xl text-white">{stagesCount}</span>
            <p className="text-xs font-sans text-[#C8A888] mt-0.5">
              {stagesCount === 0 ? 'expérience' : stagesCount === 1 ? 'expérience' : 'expériences'}
            </p>
          </div>
          <div className="w-px bg-[#5C3D2E]" aria-hidden="true" />
          <div>
            <span className="font-serif text-3xl text-white">{notesCount}</span>
            <p className="text-xs font-sans text-[#C8A888] mt-0.5">
              {notesCount <= 1 ? 'note de journal' : 'notes de journal'}
            </p>
          </div>
          <div className="w-px bg-[#5C3D2E]" aria-hidden="true" />
          <div>
            <span className="font-serif text-sm text-[#C8912A]">{formatLastActivity(lastActivity)}</span>
            <p className="text-xs font-sans text-[#C8A888] mt-0.5">dernière activité</p>
          </div>
        </div>

        {/* Navigation interne */}
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Navigation espace membre">
          {[
            { href: '/espace-membre', label: 'Mon chemin' },
            { href: '/espace-membre/suivi', label: 'Expériences' },
            { href: '/espace-membre/journal', label: 'Journal' },
            { href: '/espace-membre/reservations', label: 'Réservations' },
            { href: '/espace-membre/profil', label: 'Profil' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-sans tracking-wide text-[#C8A888] hover:text-white border border-[#5C3D2E] hover:border-[#C8912A] px-3 py-1.5 rounded-sm transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </div>
  )
}
