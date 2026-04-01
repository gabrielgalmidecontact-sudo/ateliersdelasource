'use client'
// src/features/home/HomeIntro.tsx
import { motion } from 'framer-motion'

export function HomeIntro() {
  return (
    <section className="py-16 bg-[#3B2315]" aria-label="Introduction">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-5">Le lieu</p>
          <blockquote className="font-serif text-2xl md:text-3xl text-[#F5EDD8] leading-relaxed italic">
            &ldquo;Un espace pour se retrouver, se questionner, créer et avancer
            vers une vie plus juste et plus libre.&rdquo;
          </blockquote>
          <div className="mt-6 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF50] to-transparent mx-auto" />
          <p className="mt-6 text-sm font-sans text-[#C8A888] max-w-xl mx-auto leading-relaxed">
            Les Ateliers de la Source proposent des stages de développement personnel, des ateliers d&apos;expression,
            des accompagnements individuels et des spectacles dans un cadre naturel et chaleureux.
            Gabriel et Amélie vous accueillent dans cet espace de rencontre et de transformation.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
