'use client'
// src/features/home/HeroHome.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export function HeroHome() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Petit délai pour laisser le JS s'hydrater puis déclencher l'animation
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden"
      aria-label="Bandeau principal"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')` }}
          role="img"
          aria-label="Paysage naturel serein"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D1F14]/70 via-[#2D1F14]/40 to-[#2D1F14]/80" />
        <div className="absolute inset-0 bg-[#5C3D2E]/20 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ease-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}
      >
        <p className="font-sans text-xs tracking-[0.25em] uppercase text-[#E0B060] mb-6">
          Stages · Ateliers · Spectacles
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] mb-6">
          Les Ateliers<br />
          <span className="text-[#E0B060]">de la Source</span>
        </h1>
        <p
          className="font-sans text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-200 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          Un lieu de ressourcement, de création et de transformation.
          Des propositions humaines, profondes et vivantes.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-300 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <Link
            href="/activites"
            className="inline-flex items-center justify-center gap-2 rounded-sm font-sans font-medium px-8 py-4 text-base uppercase tracking-widest transition-all duration-200 bg-[#C8912A] text-white hover:bg-[#a87820] border border-[#C8912A]"
          >
            Découvrir les activités
          </Link>
          <Link
            href="/evenements"
            className="inline-flex items-center justify-center gap-2 rounded-sm font-sans font-medium px-8 py-4 text-base uppercase tracking-widest transition-all duration-200 bg-transparent border border-white/60 text-white hover:bg-white hover:text-[#5C3D2E]"
          >
            Prochains stages
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-1000 delay-700"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className="text-white/50 animate-bounce">
          <ChevronDown size={28} />
        </div>
      </div>
    </section>
  )
}
