'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Users, MapPin, Tag, ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { buildReservationHref } from '@/lib/reservations/buildReservationHref'

interface ActivityData {
  code: string
  title: string
  slug: string
  owner: { name: string; role: string }
  excerpt: string
  content: string
  duration: string
  participants: string
  price: string
  location: string
  type: string
  imageUrl: string
  nextEventDate?: string
  placeholder?: boolean
}



function formatContent(text: string) {
  if (!text.trim()) {
    return (
      <p className="text-[#2D1F14] font-sans leading-relaxed">
        Le contenu détaillé de cette activité sera bientôt disponible.
      </p>
    )
  }

  return text.split('\n\n').map((paragraph, index) => {
    if (paragraph.startsWith('—') || paragraph.includes('\n—')) {
      const items = paragraph.split('\n').filter((line) => line.trim())

      return (
        <ul key={index} className="space-y-2 my-4">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-start gap-2 text-[#2D1F14] font-sans">
              <span className="text-[#C8912A] font-bold mt-0.5">—</span>
              <span>{item.replace(/^—\s*/, '')}</span>
            </li>
          ))}
        </ul>
      )
    }

    if (paragraph.startsWith('«') || paragraph.startsWith('"')) {
      return (
        <blockquote
          key={index}
          className="border-l-4 border-[#C8912A] pl-5 my-6 italic font-serif text-lg text-[#5C3D2E]"
        >
          {paragraph}
        </blockquote>
      )
    }

    return (
      <p key={index} className="text-[#2D1F14] font-sans leading-relaxed mb-4">
        {paragraph}
      </p>
    )
  })
}

export function ActivityDetailPage({
  activity,
  allActivities,
}: {
  activity: ActivityData
  allActivities: ActivityData[]
}) {
  const [visible, setVisible] = useState(true)

  const ownerName = activity.owner?.name || 'Les Ateliers'
  const related = allActivities
    .filter((item) => item.slug !== activity.slug && item.owner.name === ownerName)
    .slice(0, 2)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <>
      <section className="relative h-[55vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover" />
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
              <Link href="/activites" className="inline-flex items-center gap-1.5 text-xs font-sans text-white/70 hover:text-white mb-4 transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Toutes les activités
              </Link>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="ocre">{activity.type || 'Activité'}</Badge>
                {activity.code && (
                  <span className="text-xs font-sans font-bold bg-[#5C3D2E]/70 text-[#F5EDD8] px-2 py-1 rounded-sm">
                    {activity.code}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight max-w-3xl">
                {activity.title}
              </h1>

              <p className="mt-3 text-base font-sans text-white/70">
                Avec {activity.owner.name}
                {activity.owner.role ? ` — ${activity.owner.role}` : ''}
              </p>
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
              {activity.excerpt && (
                <p className="text-lg font-sans text-[#7A6355] leading-relaxed mb-8 italic">
                  {activity.excerpt}
                </p>
              )}

              <div className="w-12 h-0.5 bg-gradient-to-r from-[#D4AF50] to-transparent mb-8" />
              <div className="prose-source">{formatContent(activity.content)}</div>

              <div className="mt-12 p-8 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
                <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">Vous souhaitez en savoir plus ?</h2>
                <p className="text-sm font-sans text-[#7A6355] mb-5">
                  Contactez {activity.owner.name} directement pour obtenir toutes les informations, connaître les prochaines dates ou vous inscrire.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button href={buildReservationHref({ eventTitle: activity.title, eventSlug: activity.slug, eventType: activity.type, eventDate: activity.nextEventDate || null })} variant="primary" size="md">
                    Réserver
                    <ArrowRight size={16} />
                  </Button>
                  <Button href="/contact" variant="outline" size="md">
                    <Mail size={16} />
                    Envoyer un message
                  </Button>
                  <Button href="/evenements" variant="outline" size="md">
                    Voir les prochaines dates
                    <ArrowRight size={16} />
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
              <div className="sticky top-24 space-y-4">
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                  <h2 className="font-serif text-lg text-[#5C3D2E] mb-5">Informations pratiques</h2>

                  <div className="space-y-4">
                    {[
                      { icon: <Clock size={16} className="text-[#C8912A]" />, label: 'Durée', value: activity.duration || 'À confirmer' },
                      { icon: <Users size={16} className="text-[#C8912A]" />, label: 'Participants', value: activity.participants || 'À confirmer' },
                      { icon: <Tag size={16} className="text-[#C8912A]" />, label: 'Tarif', value: activity.price || 'Sur demande' },
                      { icon: <MapPin size={16} className="text-[#C8912A]" />, label: 'Lieu', value: activity.location || 'Lieu à confirmer' },
                    ].map((info) => (
                      <div key={info.label} className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">{info.icon}</div>
                        <div>
                          <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-0.5">{info.label}</p>
                          <p className="text-sm font-sans text-[#2D1F14]">{info.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                  <h2 className="font-serif text-base text-[#5C3D2E] mb-4">L&apos;animateur</h2>
                  <p className="text-sm font-sans font-semibold text-[#5C3D2E]">{activity.owner.name}</p>
                  {activity.owner.role && (
                    <p className="text-xs font-sans text-[#C8912A] mt-0.5">{activity.owner.role}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {related.length > 0 && (
        <div className="bg-[#F5EDD8] py-16">
          <Container>
            <h2 className="font-serif text-2xl text-[#5C3D2E] mb-8">
              D&apos;autres propositions de {activity.owner.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((item) => (
                <Link key={item.slug} href={`/activites/${item.slug}`} className="group block">
                  <div className="flex gap-4 items-start p-5 bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 transition-all duration-200 hover:shadow-md">
                    <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-sm flex-shrink-0" />
                    <div>
                      {item.code && (
                        <span className="text-xs font-sans text-[#C8912A] font-medium">{item.code}</span>
                      )}
                      <h3 className="font-serif text-base text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors leading-snug mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs font-sans text-[#7A6355] mt-1 line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </div>
      )}
    </>
  )
}
