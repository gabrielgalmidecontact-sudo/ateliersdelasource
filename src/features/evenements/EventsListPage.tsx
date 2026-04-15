'use client'
// src/features/evenements/EventsListPage.tsx
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, Filter } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import type { Event } from '@/types'
import { imageUrl } from '@/lib/sanity/image'
import { buildReservationHref } from '@/lib/reservations/buildReservationHref'

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']
const EVENT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'

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

function normalizeSanityEvent(e: Event): DisplayEvent {
  const slug = typeof e.slug === 'object' ? (e.slug as { current: string }).current : String(e.slug ?? '')
  const img = e.coverImage
    ? imageUrl(e.coverImage, 800, 500) || EVENT_FALLBACK_IMAGE
    : EVENT_FALLBACK_IMAGE

  const ownerName = typeof e.owner === 'object' && e.owner
    ? (e.owner as { name?: string }).name ?? ''
    : typeof e.owner === 'string'
      ? e.owner
      : ''

  const dates = (e as { dates?: { startDate?: string; endDate?: string } }).dates
  const startDate = dates?.startDate ?? (e as { startDate?: string | null }).startDate ?? ''
  const endDate = dates?.endDate ?? (e as { endDate?: string | null }).endDate ?? ''

  return {
    id: e._id ?? slug,
    title: e.title ?? '',
    slug,
    type: e.type ?? 'Stage',
    startDate,
    endDate,
    location:
      typeof e.location === 'string'
        ? e.location
        : e.location != null
          ? ((e.location as unknown as { name?: string })?.name ?? '')
          : '',
    owner: ownerName,
    priceLabel: typeof e.priceLabel === 'string' ? e.priceLabel : '',
    excerpt: typeof e.excerpt === 'string' ? e.excerpt : '',
    imageUrl: img,
  }
}

const typeColors: Record<string, 'ocre' | 'vert' | 'brun' | 'ghost'> = {
  Stage: 'brun',
  Atelier: 'ocre',
  Spectacle: 'vert',
  Formation: 'ghost',
  Hébergement: 'ocre',
}


function hasValidDate(value?: string) {
  if (!value) return false
  return !Number.isNaN(new Date(value).getTime())
}

function EventCard({ event, index }: { event: DisplayEvent; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  const validStartDate = hasValidDate(event.startDate)
  const startDate = validStartDate ? new Date(event.startDate) : null
  const day = startDate ? startDate.getDate().toString().padStart(2, '0') : '—'
  const month = startDate ? MONTHS_SHORT[startDate.getMonth()] : 'date'
  const year = startDate ? startDate.getFullYear() : 'à venir'
  const isPast = startDate ? startDate < new Date() : false

  useEffect(() => {
    const el = ref.current
    if (!el) return
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
          <div className="hidden sm:block w-44 flex-shrink-0 overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <div className="flex-1 flex flex-col">
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
                  {!validStartDate && <Badge variant="ghost">Date à confirmer</Badge>}
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
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-sans font-medium text-[#C8912A]">
                  Détails
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>

                {!isPast && (
                  <span
                    onClick={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="relative z-10"
                  >
                    <Link
                      href={buildReservationHref({ eventTitle: event.title, eventSlug: event.slug, eventType: event.type, eventDate: event.startDate })}
                      className="inline-flex items-center justify-center rounded-sm border border-[#5C3D2E] px-3 py-2 text-[11px] font-sans font-medium uppercase tracking-widest text-[#5C3D2E] transition-all duration-200 hover:bg-[#5C3D2E] hover:text-[#F5EDD8]"
                    >
                      Réserver
                    </Link>
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}

const EVENT_TYPES = ['Tous', 'Stage', 'Atelier', 'Spectacle', 'Formation', 'Hébergement']

interface Props {
  sanityEvents?: Event[] | null
}

export function EventsListPage({ sanityEvents }: Props = {}) {
  const [filter, setFilter] = useState('Tous')
  const [heroVisible, setHeroVisible] = useState(true)

  const events: DisplayEvent[] = sanityEvents && sanityEvents.length > 0
    ? sanityEvents.map(normalizeSanityEvent)
    : []

  const filtered = filter === 'Tous' ? events : events.filter(e => e.type === filter)

  const upcoming = filtered.filter((e) => hasValidDate(e.startDate) && new Date(e.startDate) >= new Date())
  const past = filtered.filter((e) => hasValidDate(e.startDate) && new Date(e.startDate) < new Date())
  const undated = filtered.filter((e) => !hasValidDate(e.startDate))

  useEffect(() => { setHeroVisible(true) }, [])

  return (
    <>
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

      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container size="md">
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

          {undated.length > 0 && (
            <div className="mb-16">
              <h2 className="font-serif text-xl text-[#5C3D2E] mb-6">À confirmer</h2>
              <div className="space-y-4">
                {undated.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
              </div>
            </div>
          )}

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
              <p className="font-serif text-xl text-[#7A6355]">Aucun événement pour le moment.</p>
              <p className="text-sm font-sans text-[#7A6355] mt-2">
                Les prochains stages et événements pourront être publiés directement depuis le Studio Sanity.
              </p>
            </div>
          )}
        </Container>
      </div>
    </>
  )
}
