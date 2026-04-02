'use client'
// src/features/evenements/EventDetailPage.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Tag, ArrowLeft, Mail } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

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
  return text.split('\n\n').map((para, i) => (
    <p key={i} className="font-sans text-[#2D1F14] leading-relaxed mb-4">{para}</p>
  ))
}

export function EventDetailPage({ event }: { event: EventData }) {
  const [visible, setVisible] = useState(true)
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const isSameDay = event.startDate === event.endDate
  const isPast = startDate < new Date()

  const formattedStart = `${startDate.getDate()} ${MONTHS_FR[startDate.getMonth()]} ${startDate.getFullYear()}`
  const formattedEnd = `${endDate.getDate()} ${MONTHS_FR[endDate.getMonth()]} ${endDate.getFullYear()}`

  const typeColors: Record<string, 'ocre' | 'vert' | 'brun' | 'ghost'> = {
    Stage: 'brun',
    Atelier: 'ocre',
    Spectacle: 'vert',
    Formation: 'ghost',
  }

  useEffect(() => { setVisible(true) }, [])

  return (
    <>
      {/* Hero */}
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
                <Badge variant={typeColors[event.type] || 'ghost'}>{event.type}</Badge>
                {isPast && <Badge variant="ghost">Événement passé</Badge>}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-white leading-tight max-w-2xl">
                {event.title}
              </h1>
            </div>
          </Container>
        </div>
      </section>

      {/* Content */}
      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main */}
            <div
              className="lg:col-span-2"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: 'opacity 0.6s ease 100ms, transform 0.6s ease 100ms',
              }}
            >
              <p className="text-lg font-sans text-[#7A6355] leading-relaxed mb-8 italic">
                {event.excerpt}
              </p>
              <div className="w-12 h-0.5 bg-gradient-to-r from-[#D4AF50] to-transparent mb-8" />
              <div>{formatContent(event.description)}</div>

              {/* CTA */}
              <div className="mt-12 p-8 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
                {event.registrationEnabled ? (
                  <>
                    <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">S&apos;inscrire</h2>
                    <p className="text-sm font-sans text-[#7A6355] mb-5">
                      Les inscriptions sont ouvertes. Réservez votre place dès maintenant.
                    </p>
                    <Button variant="secondary" size="md">Réserver ma place</Button>
                  </>
                ) : (
                  <>
                    <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">Intéressé·e ?</h2>
                    <p className="text-sm font-sans text-[#7A6355] mb-5">
                      Pour vous inscrire ou obtenir plus d&apos;informations, contactez {event.owner} directement.
                    </p>
                    <Button href="/contact" variant="primary" size="md">
                      <Mail size={16} />
                      Contacter {event.owner}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
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
                          {isSameDay ? formattedStart : `Du ${formattedStart} au ${formattedEnd}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-0.5">Lieu</p>
                        <p className="text-sm font-sans text-[#2D1F14]">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Tag size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-0.5">Tarif</p>
                        <p className="text-sm font-sans text-[#2D1F14]">{event.priceLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-0.5">Places</p>
                        <p className="text-sm font-sans text-[#2D1F14]">{event.capacity}</p>
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
