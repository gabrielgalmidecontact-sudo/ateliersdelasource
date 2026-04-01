'use client'
// src/features/home/FounderColumns.tsx
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Activities data (hardcoded for static fallback; replaced by CMS in production)
const gabrielActivities = [
  { code: 'A1', title: 'Théâtre des Doubles Karmiques', slug: 'theatre-doubles-karmiques', excerpt: 'Stage de développement personnel sur 3 jours et demi en petit groupe.' },
  { code: 'A2', title: 'Entretien Biographique', slug: 'entretien-biographique', excerpt: 'Entretiens d\'une heure pour explorer le sens et les rythmes de votre vie.' },
  { code: 'A3', title: 'Atelier d\'Expression Parlée et Corporelle', slug: 'atelier-expression-parlee-corporelle', excerpt: 'Gagner en aisance verbale et corporelle, séance par séance.' },
  { code: 'A4', title: 'Rêves à 100 000 euros', slug: 'reves-100000-euros', excerpt: 'Un seul en scène semi-improvisé, interactif et touchant — 1h30 au chapeau.' },
  { code: 'A5', title: 'La Vision de Dante de Victor Hugo', slug: 'vision-dante-victor-hugo', excerpt: 'Récitation poétique accompagnée de violoncelle ou piano — 1h30 au chapeau.' },
]

const amelieActivities = [
  { code: 'A6', title: 'Massages & Soins', slug: 'massages-soins', excerpt: 'Soins corporels dans un espace dédié. Contenu à venir.' },
  { code: 'A7', title: 'Réserver un hébergement', slug: 'hebergement', excerpt: 'Informations pour réserver votre nuit sur le lieu. Contenu à venir.' },
  { code: 'A8', title: 'Venir sur le lieu', slug: 'venir-sur-le-lieu', excerpt: 'Accès, itinéraire et informations pratiques. Contenu à venir.' },
]

interface ActivityLinkProps {
  code: string
  title: string
  slug: string
  excerpt: string
}

function ActivityLink({ code, title, slug, excerpt }: ActivityLinkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link href={`/activites/${slug}`} className="block py-4 border-b border-[#D4C4A8]/50 hover:border-[#C8912A]/50 transition-colors duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 mt-0.5 text-xs font-sans font-medium tracking-widest text-[#C8912A] uppercase bg-[#C8912A]/10 px-2 py-0.5 rounded-sm">
              {code}
            </span>
            <div>
              <h3 className="text-base font-serif text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors duration-200 leading-snug">
                {title}
              </h3>
              <p className="mt-1 text-sm font-sans text-[#7A6355] leading-relaxed line-clamp-2">
                {excerpt}
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="flex-shrink-0 mt-1 text-[#D4C4A8] group-hover:text-[#C8912A] group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </Link>
    </motion.div>
  )
}

interface PersonBlockProps {
  name: string
  role: string
  bio: string
  imageUrl: string
  activities: ActivityLinkProps[]
  side: 'left' | 'right'
  isPlaceholder?: boolean
}

function PersonBlock({ name, role, bio, imageUrl, activities, side, isPlaceholder }: PersonBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="flex flex-col"
    >
      {/* Portrait */}
      <div className="relative mb-8">
        <div className="aspect-[4/3] rounded-sm overflow-hidden bg-[#D4C4A8]">
          <img
            src={imageUrl}
            alt={`Portrait de ${name}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#2D1F14]/80 to-transparent">
          <p className="font-serif text-2xl text-white">{name}</p>
          <p className="text-xs font-sans text-[#E0B060] tracking-widest uppercase mt-1">{role}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm font-sans text-[#7A6355] leading-relaxed mb-6">
        {bio}
        {isPlaceholder && <span className="italic text-[#C8912A]/70"> (Contenu à venir)</span>}
      </p>

      {/* Activities */}
      <div className="flex-1">
        <p className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mb-3">Propositions</p>
        <div>
          {activities.map(act => (
            <ActivityLink key={act.code} {...act} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[#5C3D2E] hover:text-[#C8912A] transition-colors duration-200 group"
        >
          Contacter {name.split(' ')[0]}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </motion.div>
  )
}

export function FounderColumns() {
  return (
    <section className="py-20 md:py-28 bg-[#FAF6EF]" aria-labelledby="founders-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-3">L&apos;équipe</p>
          <h2 id="founders-title" className="font-serif text-3xl md:text-4xl text-[#5C3D2E]">
            Gabriel &amp; Amélie
          </h2>
          <div className="mt-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF50] to-transparent mx-auto" />
        </motion.div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <PersonBlock
            name="Gabriel"
            role="Comédien · Thérapeute"
            bio="Comédien et animateur de stages de développement personnel, Gabriel vous accompagne dans une exploration de vous-même à travers le théâtre, la biographie et l'expression. Un chemin humain, créatif et profond."
            imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
            activities={gabrielActivities}
            side="left"
          />
          <div className="lg:border-l lg:border-[#D4C4A8]/50 lg:pl-16">
            <PersonBlock
              name="Amélie"
              role="Praticienne · Hôte du lieu"
              bio="Amélie vous accueille dans cet espace de douceur et de ressourcement. Elle propose des soins corporels et des informations pratiques pour votre séjour sur le lieu. Ses offres seront détaillées prochainement."
              imageUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80"
              activities={amelieActivities}
              side="right"
              isPlaceholder
            />
          </div>
        </div>
      </div>
    </section>
  )
}
