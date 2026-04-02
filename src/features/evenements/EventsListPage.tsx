'use client'
// src/features/evenements/EventsListPage.tsx
// Accepte les données Sanity (via page.tsx server) ou utilise les données statiques intégrées
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, Filter } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import type { Event } from '@/types'
import { imageUrl } from '@/lib/sanity/image'

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

// ─── Type normalisé pour l'affichage ─────────────────────────────────────
type DisplayEvent = {
  id: string
  title: string
  slug: string
  type: string
  startDate: string
  endDate?: string
  location: string
  owner?: string
  priceLabel?: string
  excerpt?: string
  imageUrl: string
}

// ─── Données statiques (fallback) ────────────────────────────────────────
const STATIC_EVENTS: DisplayEvent[] = [
  {
    id: 'e1',
    title: 'Théâtre des Doubles Karmiques',
    slug: 'theatre-doubles-karmiques-juin-2025',
    type: 'Stage',
    startDate: '2025-06-06',
    endDate: '2025-06-09',
    location: 'Les Ateliers de la Source',
    owner: 'Gabriel',
    priceLabel: 'Sur devis',
    excerpt: 'Stage de développement personnel sur 3 jours et demi. 4 à 5 participants maximum.',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80',
  },
  {
    id: 'e2',
    title: 'Nos Émerveillements',
    slug: 'nos-emerveillements-mai-2025',
    type: 'Atelier',
    startDate: '2025-05-05',
    endDate: '2025-05-05',
    location: 'Les Ateliers de la Source',
    owner: 'Gabriel',
    priceLabel: 'Sur devis',
    excerpt: "Atelier collectif autour de l'émerveillement et de la présence au monde.",
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
  },
  {
    id: 'e3',
    title: 'Dernières Places — Stage printemps',
    slug: 'dernieres-places-stage-avril',
    type: 'Stage',
    startDate: '2025-04-21',
    endDate: '2025-04-24',
    location: 'Les Ateliers de la Source',
    owner: 'Gabriel',
    priceLabel: 'Sur devis',
    excerpt: 'Quelques dernières places disponibles pour ce stage de développement personnel.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  },
  {
    id: 'e4',
    title: 'Rêves à 100 000 euros — Spectacle',
    slug: 'reves-100000-euros-spectacle-2025',
    type: 'Spectacle',
    startDate: '2025-07-12',
    endDate: '2025-07-12',
    location: 'À préciser',
    owner: 'Gabriel',
    priceLabel: 'Au chapeau',
    excerpt: 'Un soir, une histoire folle et vraie. Semi-improvisation, participation du public.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
  },
]

// ─── Normalisation Sanity → DisplayEvent ─────────────────────────────────
function normalizeSanityEvent(e: Event): DisplayEvent {
  const slug = typeof e.slug === 'object' ? (e.slug as { current: string }).current : String(e.slug ?? '')
  const img = e.coverImage
    ? imageUrl(e.coverImage, 800, 500) || ''
    : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
  const ownerName = typeof e.owner === 'object' && e.owner
    ? (e.owner as { name?: string }).name ?? ''
    : ''
  // dates from Sanity may be nested
  const dates = (e as { dates?: { startDate?: string; endDate?: string } }).dates
  const startDate = dates?.startDate ?? (e as { startDate?: string }).startDate ?? ''
  const endDate = dates?.endDate ?? (e as { endDate?: string }).endDate

  return {
    id: e._id ?? slug,
    title: e.title ?? '',
    slug,
    type: e.type ?? 'Stage',
    startDate,
    endDate,
    location: typeof e.location === 'string' ? e.location : (e.location != null ? (e.location as unknown as { name?: string })?.name ?? '' : ''),
    owner: ownerName,
    priceLabel: e.priceLabel ?? '',
    excerpt: e.excerpt ?? '',
    imageUrl: img,
  }
}

const typeColors: Record<string, 'ocre' | 'vert' | 'brun' | 'ghost'> = {
  Stage: 'brun',
  Atelier: 'ocre',
  Spectacle: 'vert',
  Formation: 'ghost',
}

function EventCard({ event, index }: { event: DisplayEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const startDate = new Date(event.startDate)
  const day = startDate.getDate().toString().padStart(2, '0')
  const month = MONTHS_SHORT[startDate.getMonth()]
  const year = startDate.getFullYear()
  const isPast = startDate < new Date()

  useEffect(() => {
    const el = ref.current
    if (!el) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${(index % 2) * 80}ms, transform 0.5s ease ${(index % 2) * 80}ms`,
      }}
    >
      <Link href={`/evenements/${event.slug}`} className="group block" aria-label={`Voir : ${event.title}`}>
        <article className={`flex gap-0 rounded-sm border overflow-hidden transition-all duration-300 hover:shadow-lg ${isPast ? 'opacity-60 border-[#D4C4A8]' : 'border-[#D4C4A8] hover:border-[#C8912A]/60'} bg-white`}>
          {/* Image */}
          <div className="hidden sm:block w-44 flex-shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Top: date + type */}
            <div className="flex items-stretch">
              <div className="flex-shrink-0 w-16 bg-[#5C3D2E] flex flex-col items-center justify-center py-4 px-2">
                <span className="font-serif text-2xl font-bold text-[#F5EDD8] leading-none">{day}</span>
                <span className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mt-0.5">{month}</span>
                <span className="text-xs font-sans text-[#F5EDD8]/50 mt-0.5">{year}</span>
              </div>
              <div className="flex-1 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={typeColors[event.type] || 'ghost'}>{event.type}</Badge>
                  {isPast && <Badge variant="ghost">Passé</Badge>}
                </div>
                <h2 className="font-serif text-lg text-[#5C3D2E] group-hover:text-[#C8912A] leading-snug transition-colors duration-200">
                  {event.title}
                </h2>
                {event.excerpt && (
                  <p className="mt-2 text-sm font-sans text-[#7A6355] line-clamp-2 leading-relaxed">
                    {event.excerpt}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto px-5 py-3 border-t border-[#D4C4A8]/50 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-4 text-xs font-sans text-[#7A6355]">
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-[#C8912A]" />
                    {event.location}
                  </span>
                )}
                {event.priceLabel && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-[#C8912A]" />
                    {event.priceLabel}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-sans font-medium text-[#C8912A]">
                Détails
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}

const EVENT_TYPES = ['Tous', 'Stage', 'Atelier', 'Spectacle', 'Formation']

interface Props {
  /** Si fourni (depuis Sanity), remplace les données statiques */
  sanityEvents?: Event[] | null
}

export function EventsListPage({ sanityEvents }: Props = {}) {
  const [filter, setFilter] = useState('Tous')
  const [heroVisible, setHeroVisible] = useState(false)

  // Utilise Sanity si disponible, sinon les données statiques
  const events: DisplayEvent[] = sanityEvents && sanityEvents.length > 0
    ? sanityEvents.map(normalizeSanityEvent)
    : STATIC_EVENTS

  const filtered = filter === 'Tous' ? events : events.filter(e => e.type === filter)
  const upcoming = filtered.filter(e => new Date(e.startDate) >= new Date())
  const past = filtered.filter(e => new Date(e.startDate) < new Date())

  useEffect(() => { setHeroVisible(true) }, [])

  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <div
            className="text-center"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(24px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-4">Agenda</p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#F5EDD8] mb-4">Stages &amp; Événements</h1>
            <p className="text-base font-sans text-[#C8A888] max-w-xl mx-auto">
              Retrouvez l&apos;ensemble de nos prochains stages, ateliers et spectacles.
            </p>
          </div>
        </Container>
      </div>

      {/* Filters */}
      <div className="bg-[#F5EDD8] border-b border-[#D4C4A8] sticky top-[64px] z-30">
        <Container>
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            <Filter size={14} className="text-[#7A6355] flex-shrink-0" />
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium whitespace-nowrap transition-all duration-200 ${
                  filter === type
                    ? 'bg-[#5C3D2E] text-[#F5EDD8]'
                    : 'bg-transparent text-[#5C3D2E] border border-[#D4C4A8] hover:border-[#C8912A]'
                }`}
                aria-pressed={filter === type}
              >
                {type}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Events list */}
      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container size="md">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-16">
              <h2 className="font-serif text-xl text-[#5C3D2E] mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-[#C8912A]" />
                À venir
              </h2>
              <div className="space-y-4">
                {upcoming.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="font-serif text-xl text-[#7A6355] mb-6">Événements passés</h2>
              <div className="space-y-4">
                {past.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="font-serif text-xl text-[#7A6355]">Aucun événement dans cette catégorie pour le moment.</p>
              <p className="text-sm font-sans text-[#7A6355] mt-2">Revenez bientôt ou contactez-nous pour être informé.</p>
            </div>
          )}
        </Container>
      </div>
    </>
  )
}
