'use client'
// src/features/evenements/EventDetailPage.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Tag, ArrowLeft, Mail } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { buildReservationHref } from '@/lib/reservations/buildReservationHref'

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

interface EventData {
  title: string
  slug: string
  type: string
  startDate: string
  endDate: string
  location: string
  owner: string
  priceLabel: string
  capacity: string
  registrationEnabled: boolean
  excerpt: string
  description: string
  imageUrl: string
}



function formatContent(text: string) {
  const safeText = typeof text === 'string' ? text.trim() : ''
  if (!safeText) {
    return (
      <p className="font-sans text-[#2D1F14] leading-relaxed">
        Le contenu détaillé de cet événement sera bientôt disponible.
      </p>
    )
  }

  return safeText.split('\n\n').map((para, i) => (
    <p key={i} className="font-sans text-[#2D1F14] leading-relaxed mb-4">{para}</p>
  ))
}

function isValidDate(value?: string) {
  if (!value) return false
  return !Number.isNaN(new Date(value).getTime())
}

function toDateInputValue(value?: string) {
  if (!isValidDate(value)) return ''
  return new Date(value as string).toISOString().slice(0, 10)
}

function formatDate(value?: string) {
  if (!isValidDate(value)) return 'Date à confirmer'
  const date = new Date(value as string)
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`
}

export function EventDetailPage({ event }: { event: EventData }) {
  const [visible, setVisible] = useState(true)

  const hasStartDate = isValidDate(event.startDate)
  const hasEndDate = isValidDate(event.endDate)

  const startDate = hasStartDate ? new Date(event.startDate) : null
  const endDate = hasEndDate ? new Date(event.endDate) : null

  const isSameDay =
    hasStartDate &&
    hasEndDate &&
    startDate!.toDateString() === endDate!.toDateString()

  const isPast = hasStartDate ? startDate! < new Date() : false

  const formattedStart = formatDate(event.startDate)
  const formattedEnd = formatDate(event.endDate)

  const ownerName = event.owner?.trim() || 'Les Ateliers'
  const locationLabel = event.location?.trim() || 'Lieu à confirmer'
  const priceLabel = event.priceLabel?.trim() || 'Tarif à confirmer'
  const capacityLabel = event.capacity?.trim() || 'Capacité à confirmer'
  const excerpt = event.excerpt?.trim()
  const typeLabel = event.type?.trim() || 'Événement'

  const typeColors: Record<string, 'ocre' | 'vert' | 'brun' | 'ghost'> = {
    Stage: 'brun',
    Atelier: 'ocre',
    Spectacle: 'vert',
    Formation: 'ghost',
  }

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <>
      <section className="relative h-[50vh] min-h-[380px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D1F14]/90 via-[#2D1F14]/40 to-transparent" />
        </div>
        <div className="relative z-10 w-full pb-12 pt-24">
          <Container>
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}
            >
              <Link href="/evenements" className="inline-flex items-center gap-1.5 text-xs font-sans text-white/70 hover:text-white mb-4 transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Tous les événements
              </Link>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={typeColors[typeLabel] || 'ghost'}>{typeLabel}</Badge>
                {isPast && <Badge variant="ghost">Événement passé</Badge>}
                {!hasStartDate && <Badge variant="ghost">Date à confirmer</Badge>}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-white leading-tight max-w-2xl">
                {event.title}
              </h1>
            </div>
          </Container>
        </div>
      </section>

      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div
              className="lg:col-span-2"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: 'opacity 0.6s ease 100ms, transform 0.6s ease 100ms',
              }}
            >
              {excerpt ? (
                <p className="text-lg font-sans text-[#7A6355] leading-relaxed mb-8 italic">
                  {excerpt}
                </p>
              ) : null}

              <div className="w-12 h-0.5 bg-gradient-to-r from-[#D4AF50] to-transparent mb-8" />
              <div>{formatContent(event.description)}</div>

              <div className="mt-12 p-8 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
                <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">
                  {event.registrationEnabled ? "S&apos;inscrire" : "Réserver ou en savoir plus"}
                </h2>
                <p className="text-sm font-sans text-[#7A6355] mb-5">
                  {event.registrationEnabled
                    ? "Les inscriptions sont ouvertes. Réservez votre place dès maintenant."
                    : `Vous pouvez déjà faire une demande de réservation ou contacter ${ownerName} pour obtenir plus d’informations.`}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button href={buildReservationHref({ eventTitle: event.title, eventSlug: event.slug, eventType: event.type, eventDate: event.startDate })} variant="secondary" size="md">
                    Réserver ma place
                  </Button>

                  <Button href="/contact" variant="outline" size="md">
                    <Mail size={16} />
                    Contacter {ownerName}
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="lg:col-span-1"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(20px)',
                transition: 'opacity 0.6s ease 200ms, transform 0.6s ease 200ms',
              }}
            >
              <div className="sticky top-24">
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                  <h2 className="font-serif text-lg text-[#5C3D2E] mb-5">Informations</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-0.5">Date</p>
                        <p className="text-sm font-sans text-[#2D1F14]">
                          {!hasStartDate
                            ? 'Date à confirmer'
                            : !hasEndDate || isSameDay
                              ? formattedStart
                              : `Du ${formattedStart} au ${formattedEnd}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-0.5">Lieu</p>
                        <p className="text-sm font-sans text-[#2D1F14]">{locationLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Tag size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-0.5">Tarif</p>
                        <p className="text-sm font-sans text-[#2D1F14]">{priceLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-0.5">Places</p>
                        <p className="text-sm font-sans text-[#2D1F14]">{capacityLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}
