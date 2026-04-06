'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Users } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Section } from '@/components/ui/Section'
import type { Activity } from '@/types'
import { imageUrl } from '@/lib/sanity/image'

function useFade(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          obs.unobserve(el)
        }
      },
      { threshold: 0.05 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
    },
  }
}

type DisplayActivity = {
  code: string
  title: string
  slug: string
  owner: string
  excerpt: string
  duration: string
  participants: string
  type: string
  imageUrl: string
  placeholder?: boolean
}

const STATIC_ACTIVITIES: DisplayActivity[] = [
  { code: 'A1', title: 'Théâtre des Doubles Karmiques', slug: 'theatre-doubles-karmiques', owner: 'Gabriel', excerpt: "Avec un groupe de 4 à 5 personnes, Gabriel vous accompagne dans une immersion profonde au cœur de vous-même. Un processus collectif, conscient et créatif pour désamorcer les mécanismes répétitifs.", duration: '3 jours et demi', participants: '4 à 5 personnes', type: 'Stage', imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80' },
  { code: 'A2', title: 'Entretien Biographique', slug: 'entretien-biographique', owner: 'Gabriel', excerpt: "Formé pendant 3 ans à la biographie avec Cyr Boé, Gabriel vous propose des entretiens d'une heure pour explorer le sens de votre vie et découvrir les rythmes qui la traversent.", duration: '1 heure', participants: 'Individuel', type: 'Accompagnement', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80' },
  { code: 'A3', title: "Atelier d'Expression Parlée et Corporelle", slug: 'atelier-expression-parlee-corporelle', owner: 'Gabriel', excerpt: "Gagner en aisance corporelle et verbale pour un oral, une audition, un entretien… ou simplement pour retrouver une manière d'être plus libre et plus tranquille au quotidien.", duration: '1 heure', participants: 'Individuel', type: 'Atelier', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80' },
  { code: 'A4', title: 'Rêves à 100 000 euros', slug: 'reves-100000-euros', owner: 'Gabriel (Galmide)', excerpt: "Un seul en scène semi-improvisé où Galmide raconte 7 années de vie rocambolesque — déjantée, délurée, touchante et absolument vraie. Le public participe. Au chapeau.", duration: '1h30', participants: 'Tous publics', type: 'Spectacle', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80' },
  { code: 'A5', title: 'La Vision de Dante de Victor Hugo', slug: 'vision-dante-victor-hugo', owner: 'Gabriel (Galmide)', excerpt: "Immersion poétique à travers l'œuvre magistrale de Victor Hugo, portée par Galmide et accompagnée d'une violoncelliste ou pianiste. 1h30. Jouable dans vos salons. Au chapeau.", duration: '1h30', participants: 'Tous publics', type: 'Spectacle', imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80' },
  { code: 'A6', title: 'Massages & Soins', slug: 'massages-soins', owner: 'Amélie', excerpt: "Amélie vous accueille dans son espace de soins corporels. Détails et horaires à venir dès l'ouverture de sa salle.", duration: 'À définir', participants: 'Individuel', type: 'Soin', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', placeholder: true },
  { code: 'A7', title: 'Hébergement sur le lieu', slug: 'hebergement', owner: 'Amélie', excerpt: "Informations pour réserver une nuit ou un séjour sur le lieu. Contenu à venir prochainement.", duration: 'Variable', participants: 'À définir', type: 'Hébergement', imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', placeholder: true },
  { code: 'A8', title: 'Venir sur le lieu', slug: 'venir-sur-le-lieu', owner: 'Amélie', excerpt: "Accès, itinéraire et informations pratiques pour rejoindre les Ateliers de la Source. Contenu à venir.", duration: '—', participants: '—', type: 'Informations', imageUrl: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80', placeholder: true },
]

const typeColors: Record<string, 'ocre' | 'vert' | 'brun' | 'ghost'> = {
  Stage: 'brun',
  Atelier: 'ocre',
  Spectacle: 'vert',
  Accompagnement: 'ghost',
  Soin: 'vert',
  Hébergement: 'ghost',
  Informations: 'ghost',
}

function getStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function getOwnerName(value: unknown): string {
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name
    return typeof name === 'string' && name.trim() ? name : 'Les Ateliers'
  }

  if (typeof value === 'string' && value.trim()) return value

  return 'Les Ateliers'
}

function getDuration(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value

  if (value && typeof value === 'object') {
    const record = value as { value?: unknown; label?: unknown }
    if (typeof record.value === 'string' && record.value.trim()) return record.value
    if (typeof record.label === 'string' && record.label.trim()) return record.label
  }

  return 'À confirmer'
}

function getTypeFromOwner(ownerName: string): string {
  if (ownerName.toLowerCase().includes('amélie') || ownerName.toLowerCase().includes('amelie')) {
    return 'Informations'
  }
  return 'Activité'
}

function normalizeSanityActivity(activity: Activity): DisplayActivity {
  const ownerName = getOwnerName(activity.owner)
  const slug =
    typeof activity.slug === 'object'
      ? (activity.slug as { current?: string }).current || ''
      : String(activity.slug ?? '')

  return {
    code: getStringValue(activity.code),
    title: getStringValue(activity.title, 'Activité'),
    slug,
    owner: ownerName,
    excerpt: getStringValue(activity.excerpt, 'Description bientôt disponible.'),
    duration: getDuration(activity.duration),
    participants: getStringValue(activity.participants, 'À confirmer'),
    type: getTypeFromOwner(ownerName),
    imageUrl: activity.coverImage
      ? imageUrl(activity.coverImage, 800, 600) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'
      : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  }
}

function ActivityCard({ activity, delay = 0 }: { activity: DisplayActivity; delay?: number }) {
  const { ref, style } = useFade(delay)

  return (
    <div ref={ref} style={style}>
      <Link href={`/activites/${activity.slug}`} className="group block h-full" aria-label={`Voir : ${activity.title}`}>
        <article className="h-full flex flex-col bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="relative h-52 overflow-hidden bg-[#D4C4A8]">
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />

            {activity.placeholder && (
              <div className="absolute inset-0 bg-[#FAF6EF]/60 flex items-center justify-center">
                <span className="text-xs font-sans italic text-[#7A6355]">Contenu à venir</span>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <Badge variant={typeColors[activity.type] || 'ghost'}>{activity.type}</Badge>
            </div>

            {activity.code && (
              <div className="absolute top-3 right-3">
                <span className="text-xs font-sans font-bold bg-[#5C3D2E]/80 text-[#F5EDD8] px-2 py-1 rounded-sm">
                  {activity.code}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col p-6">
            <p className="text-xs font-sans text-[#C8912A] font-medium mb-2">{activity.owner}</p>

            <h2 className="font-serif text-xl text-[#5C3D2E] group-hover:text-[#C8912A] leading-snug mb-3 transition-colors duration-200">
              {activity.title}
            </h2>

            <p className="text-sm font-sans text-[#7A6355] leading-relaxed flex-1 line-clamp-3">
              {activity.excerpt}
            </p>

            <div className="mt-4 pt-4 border-t border-[#D4C4A8]/50 flex items-center gap-4 text-xs font-sans text-[#7A6355]">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-[#C8912A]" />
                {activity.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={12} className="text-[#C8912A]" />
                {activity.participants}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors duration-200">
              En savoir plus
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}

interface Props {
  sanityActivities?: Activity[] | null
}

export function ActivitesListPage({ sanityActivities }: Props = {}) {
  const headerFade = useFade()

  const activities: DisplayActivity[] =
    sanityActivities && sanityActivities.length > 0
      ? sanityActivities.map(normalizeSanityActivity)
      : STATIC_ACTIVITIES

  const gabriel = activities.filter((activity) => activity.owner.toLowerCase().includes('gabriel'))
  const amelie = activities.filter((activity) => activity.owner.toLowerCase().includes('amélie') || activity.owner.toLowerCase().includes('amelie'))
  const others = activities.filter(
    (activity) =>
      !activity.owner.toLowerCase().includes('gabriel') &&
      !activity.owner.toLowerCase().includes('amélie') &&
      !activity.owner.toLowerCase().includes('amelie')
  )

  return (
    <>
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <div ref={headerFade.ref} style={headerFade.style} className="text-center">
            <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-4">Découvrir</p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#F5EDD8] mb-4">Nos Activités</h1>
            <p className="text-base font-sans text-[#C8A888] max-w-xl mx-auto leading-relaxed">
              Stages de développement personnel, ateliers d&apos;expression, spectacles vivants et accompagnements.
            </p>
          </div>
        </Container>
      </div>

      {gabriel.length > 0 && (
        <Section bg="creme" id="gabriel">
          <Container>
            <SectionHeader eyebrow="Avec Gabriel" title="Stages, Ateliers & Spectacles" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gabriel.map((activity, index) => (
                <ActivityCard key={activity.code || activity.slug} activity={activity} delay={index * 80} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {amelie.length > 0 && (
        <Section bg="beige" id="amelie">
          <Container>
            <SectionHeader
              eyebrow="Avec Amélie"
              title="Soins, Hébergement & Accueil"
              note="Les propositions d'Amélie peuvent être enrichies progressivement dans le CMS."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amelie.map((activity, index) => (
                <ActivityCard key={activity.code || activity.slug} activity={activity} delay={index * 80} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {others.length > 0 && (
        <Section bg="creme" id="autres">
          <Container>
            <SectionHeader eyebrow="Autres propositions" title="Activités complémentaires" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map((activity, index) => (
                <ActivityCard key={activity.code || activity.slug} activity={activity} delay={index * 80} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}

function SectionHeader({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  const { ref, style } = useFade()

  return (
    <div ref={ref} style={style} className="mb-10">
      <p className="text-xs font-sans tracking-widest uppercase text-[#C8912A] mb-2">{eyebrow}</p>
      <h2 className="font-serif text-2xl md:text-3xl text-[#5C3D2E]">{title}</h2>
      <div className="mt-3 w-12 h-0.5 bg-gradient-to-r from-[#D4AF50] to-transparent" />
      {note && <p className="mt-3 text-sm font-sans text-[#7A6355] max-w-lg">{note}</p>}
    </div>
  )
}
