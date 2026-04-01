'use client'
// src/features/home/FeaturedEvents.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Placeholder events (replaced by CMS data in production)
const placeholderEvents = [
  {
    id: '1',
    title: 'Théâtre des Doubles Karmiques',
    type: 'Stage',
    startDate: '2025-06-06',
    endDate: '2025-06-09',
    location: 'Les Ateliers de la Source',
    slug: 'theatre-doubles-karmiques-juin-2025',
    priceLabel: 'Sur devis',
    hasFlyerPdf: false,
  },
  {
    id: '2',
    title: 'Nos Émerveillements',
    type: 'Atelier',
    startDate: '2025-05-05',
    endDate: '2025-05-05',
    location: 'Les Ateliers de la Source',
    slug: 'nos-emerveillements-mai-2025',
    priceLabel: 'Sur devis',
    hasFlyerPdf: false,
  },
  {
    id: '3',
    title: 'Dernières Places disponibles',
    type: 'Formation',
    startDate: '2025-04-21',
    endDate: '2025-04-24',
    location: 'Les Ateliers de la Source',
    slug: 'dernieres-places-stage-avril',
    priceLabel: 'Sur devis',
    hasFlyerPdf: false,
  },
]

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

function EventCard({ event, index }: { event: typeof placeholderEvents[0]; index: number }) {
  const date = new Date(event.startDate)
  const day = date.getDate().toString().padStart(2, '0')
  const month = MONTHS_FR[date.getMonth()]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
      className="group"
    >
      <Link href={`/evenements/${event.slug}`} className="block h-full" aria-label={`Voir le détail : ${event.title}`}>
        <div className="h-full bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/60 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
          {/* Date badge + type */}
          <div className="flex items-stretch">
            {/* Date block */}
            <div className="flex-shrink-0 w-20 bg-[#5C3D2E] flex flex-col items-center justify-center py-5 px-2">
              <span className="font-serif text-3xl font-bold text-[#F5EDD8] leading-none">{day}</span>
              <span className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mt-1">{month}</span>
            </div>
            {/* Info */}
            <div className="flex-1 p-5">
              <span className="text-xs font-sans uppercase tracking-wider text-[#C8912A] font-medium">
                {event.type}
              </span>
              <h3 className="mt-1.5 font-serif text-lg text-[#5C3D2E] group-hover:text-[#C8912A] leading-snug transition-colors duration-200">
                {event.title}
              </h3>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto px-5 py-3 border-t border-[#D4C4A8]/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-sans text-[#7A6355]">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-sans text-[#C8912A] font-medium whitespace-nowrap">
              Voir le détail
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function FeaturedEvents() {
  return (
    <section className="py-20 md:py-28 bg-[#F5EDD8]" aria-labelledby="events-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-3">Agenda</p>
          <h2 id="events-title" className="font-serif text-3xl md:text-4xl text-[#5C3D2E]">
            Nos Prochains Stages &amp; Ateliers
          </h2>
          <div className="mt-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF50] to-transparent mx-auto" />
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {placeholderEvents.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>

        {/* See all */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button href="/evenements" variant="outline" size="md">
            Voir le programme complet
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
