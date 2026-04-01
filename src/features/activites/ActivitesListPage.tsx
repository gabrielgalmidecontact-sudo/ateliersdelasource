'use client'
// src/features/activites/ActivitesListPage.tsx
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Users } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Section } from '@/components/ui/Section'

function useFade(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setV(true), delay); obs.unobserve(el) } }, { threshold: 0.08 })
    obs.observe(el); return () => obs.disconnect()
  }, [delay])
  return { ref, style: { opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.55s ease-out, transform 0.55s ease-out' } }
}

const allActivities = [
  { code: 'A1', title: 'Théâtre des Doubles Karmiques', slug: 'theatre-doubles-karmiques', owner: 'Gabriel', excerpt: 'Avec un groupe de 4 à 5 personnes, Gabriel vous accompagne dans une immersion profonde au cœur de vous-même. Un processus collectif, conscient et créatif pour désamorcer les mécanismes répétitifs.', duration: '3 jours et demi', participants: '4 à 5 personnes', type: 'Stage', imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80' },
  { code: 'A2', title: 'Entretien Biographique', slug: 'entretien-biographique', owner: 'Gabriel', excerpt: 'Formé pendant 3 ans à la biographie avec Cyr Boé, Gabriel vous propose des entretiens d\'une heure pour explorer le sens de votre vie et découvrir les rythmes qui la traversent.', duration: '1 heure', participants: 'Individuel', type: 'Accompagnement', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80' },
  { code: 'A3', title: 'Atelier d\'Expression Parlée et Corporelle', slug: 'atelier-expression-parlee-corporelle', owner: 'Gabriel', excerpt: 'Gagner en aisance corporelle et verbale pour un oral, une audition, un entretien… ou simplement pour retrouver une manière d\'être plus libre et plus tranquille au quotidien.', duration: '1 heure', participants: 'Individuel', type: 'Atelier', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80' },
  { code: 'A4', title: 'Rêves à 100 000 euros', slug: 'reves-100000-euros', owner: 'Gabriel (Galmide)', excerpt: 'Un seul en scène semi-improvisé où Galmide raconte 7 années de vie rocambolesque — déjantée, délurée, touchante et absolument vraie. Le public participe. Au chapeau.', duration: '1h30', participants: 'Tous publics', type: 'Spectacle', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80' },
  { code: 'A5', title: 'La Vision de Dante de Victor Hugo', slug: 'vision-dante-victor-hugo', owner: 'Gabriel (Galmide)', excerpt: 'Immersion poétique à travers l\'œuvre magistrale de Victor Hugo, portée par Galmide et accompagnée d\'une violoncelliste ou pianiste. 1h30. Jouable dans vos salons. Au chapeau.', duration: '1h30', participants: 'Tous publics', type: 'Spectacle', imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80' },
  { code: 'A6', title: 'Massages & Soins', slug: 'massages-soins', owner: 'Amélie', excerpt: 'Amélie vous accueille dans son espace de soins corporels. Détails et horaires à venir dès l\'ouverture de sa salle.', duration: 'À définir', participants: 'Individuel', type: 'Soin', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', placeholder: true },
  { code: 'A7', title: 'Hébergement sur le lieu', slug: 'hebergement', owner: 'Amélie', excerpt: 'Informations pour réserver une nuit ou un séjour sur le lieu. Contenu à venir prochainement.', duration: 'Variable', participants: 'À définir', type: 'Hébergement', imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', placeholder: true },
  { code: 'A8', title: 'Venir sur le lieu', slug: 'venir-sur-le-lieu', owner: 'Amélie', excerpt: 'Accès, itinéraire et informations pratiques pour rejoindre les Ateliers de la Source. Contenu à venir.', duration: '—', participants: '—', type: 'Informations', imageUrl: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80', placeholder: true },
]

const typeColors: Record<string, 'ocre' | 'vert' | 'brun' | 'ghost'> = {
  Stage: 'brun', Atelier: 'ocre', Spectacle: 'vert', Accompagnement: 'ghost', Soin: 'vert', Hébergement: 'ghost', Informations: 'ghost',
}

function ActivityCard({ activity, delay = 0 }: { activity: typeof allActivities[0]; delay?: number }) {
  const { ref, style } = useFade(delay)
  return (
    <div ref={ref} style={style}>
      <Link href={`/activites/${activity.slug}`} className="group block h-full" aria-label={`Voir : ${activity.title}`}>
        <article className="h-full flex flex-col bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="relative h-52 overflow-hidden bg-[#D4C4A8]">
            <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            {activity.placeholder && (
              <div className="absolute inset-0 bg-[#FAF6EF]/60 flex items-center justify-center">
                <span className="text-xs font-sans italic text-[#7A6355]">Contenu à venir</span>
              </div>
            )}
            <div className="absolute top-3 left-3"><Badge variant={typeColors[activity.type] || 'ghost'}>{activity.type}</Badge></div>
            <div className="absolute top-3 right-3"><span className="text-xs font-sans font-bold bg-[#5C3D2E]/80 text-[#F5EDD8] px-2 py-1 rounded-sm">{activity.code}</span></div>
          </div>
          <div className="flex-1 flex flex-col p-6">
            <p className="text-xs font-sans text-[#C8912A] font-medium mb-2">{activity.owner}</p>
            <h2 className="font-serif text-xl text-[#5C3D2E] group-hover:text-[#C8912A] leading-snug mb-3 transition-colors duration-200">{activity.title}</h2>
            <p className="text-sm font-sans text-[#7A6355] leading-relaxed flex-1 line-clamp-3">{activity.excerpt}</p>
            <div className="mt-4 pt-4 border-t border-[#D4C4A8]/50 flex items-center gap-4 text-xs font-sans text-[#7A6355]">
              <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#C8912A]" />{activity.duration}</span>
              <span className="flex items-center gap-1.5"><Users size={12} className="text-[#C8912A]" />{activity.participants}</span>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors duration-200">
              En savoir plus <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}

export function ActivitesListPage() {
  const headerFade = useFade()
  const gabriel = allActivities.filter(a => a.owner.startsWith('Gabriel'))
  const amelie = allActivities.filter(a => a.owner.startsWith('Amélie'))

  return (
    <>
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <div ref={headerFade.ref} style={headerFade.style} className="text-center">
            <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-4">Découvrir</p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#F5EDD8] mb-4">Nos Activités</h1>
            <p className="text-base font-sans text-[#C8A888] max-w-xl mx-auto leading-relaxed">
              Stages de développement personnel, ateliers d&apos;expression, spectacles vivants et soins —
              chaque proposition est une invitation à aller vers soi.
            </p>
          </div>
        </Container>
      </div>

      <Section bg="creme" id="gabriel">
        <Container>
          <SectionHeader eyebrow="Avec Gabriel" title="Stages, Ateliers & Spectacles" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gabriel.map((act, i) => <ActivityCard key={act.code} activity={act} delay={i * 80} />)}
          </div>
        </Container>
      </Section>

      <Section bg="beige" id="amelie">
        <Container>
          <SectionHeader eyebrow="Avec Amélie" title="Soins, Hébergement & Accueil" note="Les propositions d'Amélie seront prochainement détaillées. N'hésitez pas à la contacter directement." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amelie.map((act, i) => <ActivityCard key={act.code} activity={act} delay={i * 80} />)}
          </div>
        </Container>
      </Section>
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
