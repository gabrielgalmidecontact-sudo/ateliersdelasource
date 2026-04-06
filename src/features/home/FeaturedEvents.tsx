'use client'
// src/features/home/FeaturedEvents.tsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setVisible(true), delay)
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [delay])
  return { ref, visible }
}

type HomeEvent = {
  id: string
  title: string
  type: string
  startDate?: string
  location?: string
  slug: string
}

const placeholderEvents: HomeEvent[] = [
  { id: '1', title: 'Théâtre des Doubles Karmiques', type: 'Stage', startDate: '2025-06-06', location: 'Les Ateliers de la Source', slug: 'theatre-doubles-karmiques-juin-2025' },
  { id: '2', title: 'Nos Émerveillements', type: 'Atelier', startDate: '2025-05-05', location: 'Les Ateliers de la Source', slug: 'nos-emerveillements-mai-2025' },
  { id: '3', title: 'Dernières Places disponibles', type: 'Stage', startDate: '2025-04-21', location: 'Les Ateliers de la Source', slug: 'dernieres-places-stage-avril' },
]

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

function isValidDate(value?: string) {
  if (!value) return false
  return !Number.isNaN(new Date(value).getTime())
}

function EventCard({ event, index }: { event: HomeEvent; index: number }) {
  const { ref, visible } = useFadeIn(index * 100)
  const hasDate = isValidDate(event.startDate)
  const date = hasDate ? new Date(event.startDate as string) : null
  const day = date ? date.getDate().toString().padStart(2, '0') : '—'
  const month = date ? MONTHS_FR[date.getMonth()] : 'date'
  const locationLabel = event.location?.trim() || 'Lieu à confirmer'
  const typeLabel = event.type?.trim() || 'Événement'

  return (
    <div
      ref={ref}
      className="group transition-all duration-600 ease-out"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
    >
      <Link href={`/evenements/${event.slug}`} className="block h-full" aria-label={`Voir : ${event.title}`}>
        <div className="h-full bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/60 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
          <div className="flex items-stretch">
            <div className="flex-shrink-0 w-20 bg-[#5C3D2E] flex flex-col items-center justify-center py-5 px-2">
              <span className="font-serif text-3xl font-bold text-[#F5EDD8] leading-none">{day}</span>
              <span className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mt-1">{month}</span>
            </div>
            <div className="flex-1 p-5">
              <span className="text-xs font-sans uppercase tracking-wider text-[#C8912A] font-medium">{typeLabel}</span>
              <h3 className="mt-1.5 font-serif text-lg text-[#5C3D2E] group-hover:text-[#C8912A] leading-snug transition-colors duration-200">{event.title}</h3>
            </div>
          </div>
          <div className="mt-auto px-5 py-3 border-t border-[#D4C4A8]/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-sans text-[#7A6355]">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-sans text-[#C8912A] font-medium whitespace-nowrap">
              Voir le détail
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

type FeaturedEventsProps = {
  events?: HomeEvent[]
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  const { ref, visible } = useFadeIn()

  const safeEvents = (events ?? []).filter((event) => {
    const slug = event.slug?.trim()
    return Boolean(slug) && !slug.startsWith('http://') && !slug.startsWith('https://')
  })

  const displayedEvents = safeEvents.length > 0 ? safeEvents : placeholderEvents

  return (
    <section className="py-20 md:py-28 bg-[#F5EDD8]" aria-labelledby="events-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="text-center mb-12 transition-all duration-700 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-3">Agenda</p>
          <h2 id="events-title" className="font-serif text-3xl md:text-4xl text-[#5C3D2E]">Nos Prochains Stages &amp; Ateliers</h2>
          <div className="mt-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF50] to-transparent mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedEvents.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
        </div>
        <div className="mt-12 text-center">
          <Link href="/evenements" className="inline-flex items-center justify-center gap-2 rounded-sm font-sans font-medium px-6 py-3 text-sm uppercase tracking-widest transition-all duration-200 bg-transparent text-[#5C3D2E] border border-[#5C3D2E] hover:bg-[#5C3D2E] hover:text-[#F5EDD8]">
            Voir le programme complet
          </Link>
        </div>
      </div>
    </section>
  )
}
