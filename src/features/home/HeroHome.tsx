'use client'
// src/features/home/HeroHome.tsx
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ChevronDown } from 'lucide-react'

export function HeroHome() {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden" aria-label="Bandeau principal">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
          }}
          role="img"
          aria-label="Paysage naturel serein"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D1F14]/70 via-[#2D1F14]/40 to-[#2D1F14]/80" />
        {/* Warm tone overlay */}
        <div className="absolute inset-0 bg-[#5C3D2E]/20 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {/* Eyebrow */}
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-[#E0B060] mb-6">
            Stages · Ateliers · Spectacles
          </p>

          {/* Title */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] mb-6">
            Les Ateliers<br />
            <span className="text-[#E0B060]">de la Source</span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
            className="font-sans text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Un lieu de ressourcement, de création et de transformation.
            Des propositions humaines, profondes et vivantes.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button href="/activites" variant="secondary" size="lg">
              Découvrir les activités
            </Button>
            <Button href="/evenements" variant="outline" size="lg" className="border-white/60 text-white hover:bg-white hover:text-[#5C3D2E]">
              Prochains stages
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-white/50"
          aria-hidden="true"
        >
          <ChevronDown size={28} />
        </motion.div>
      </motion.div>
    </section>
  )
}
