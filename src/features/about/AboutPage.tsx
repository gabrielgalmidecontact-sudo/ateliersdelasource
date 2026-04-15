'use client'
// src/features/about/AboutPage.tsx
import { useRef, useState, useEffect } from 'react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

function FadeIn({ children, delay = 0, className = '', slideX = false }: {
  children: React.ReactNode
  delay?: number
  className?: string
  slideX?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : slideX ? 'translateX(24px)' : 'translateY(24px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <FadeIn className="text-center">
            <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-4">Le lieu</p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#F5EDD8]">À propos</h1>
          </FadeIn>
        </Container>
      </div>

      {/* About content */}
      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container size="md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Text */}
            <FadeIn delay={100}>
              <p className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mb-3">L&apos;histoire</p>
              <h2 className="font-serif text-3xl text-[#5C3D2E] mb-6">Les Ateliers de la Source</h2>
              <div className="space-y-4 font-sans text-[#2D1F14] text-sm leading-relaxed">
                <p>
                  Les Ateliers de la Source sont un espace de rencontre, de création et de transformation.
                  Un lieu où des propositions humaines, profondes et vivantes viennent à la rencontre de chacun.
                </p>
                <p>
                  Gabriel et Amélie accueillent dans ce lieu tout ce qui touche au développement personnel, à l&apos;expression artistique, à la biographie, et au soin du corps.
                </p>
                <p>
                  L&apos;idée centrale est simple : chacun porte en lui une source. Le travail proposé ici est d&apos;aider cette source à couler plus librement.
                </p>
              </div>
            </FadeIn>

            {/* Gabriel photo */}
            <FadeIn delay={200} slideX>
              <div className="rounded-sm overflow-hidden">
                <img
                  src="/images/founders/histoire.jpg"
                  alt="Les Ateliers de la Source"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </FadeIn>
          </div>

          {/* Gabriel detail */}
          <FadeIn delay={0} className="mt-20 pt-16 border-t border-[#D4C4A8]">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-10 items-start">
              <div className="rounded-sm overflow-hidden max-w-sm">
                <img
                  src="/images/founders/gabriel-about.jpg"
                  alt="Gabriel"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mb-3">Gabriel</p>
                <h2 className="font-serif text-2xl text-[#5C3D2E] mb-5">Comédien, thérapeute, conteur</h2>
                <div className="space-y-4 font-sans text-sm text-[#2D1F14] leading-relaxed max-w-2xl">
                  <p>
                    Gabriel est comédien de formation. Il propose des stages de développement personnel (Théâtre des Doubles Karmiques), des entretiens biographiques, des ateliers d&apos;expression parlée et corporelle, ainsi que des spectacles (Rêves à 100 000 euros, La Vision de Dante).
                  </p>
                  <p>
                    Formé pendant 3 ans à l&apos;accompagnement biographique auprès de Cyr Boé, il mêle dans son travail une approche artistique et thérapeutique, toujours au service de la transformation personnelle.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Amélie detail */}
          <FadeIn delay={0} className="mt-16 pt-16 border-t border-[#D4C4A8]">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-10 items-start">
              <div className="rounded-sm overflow-hidden max-w-sm">
                <img
                  src="/images/founders/amelie-about.jpg"
                  alt="Amélie"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mb-3">Amélie</p>
                <h2 className="font-serif text-2xl text-[#5C3D2E] mb-5">Praticienne, hôte du lieu</h2>
                <div className="space-y-4 font-sans text-sm text-[#2D1F14] leading-relaxed max-w-2xl">
                  <p>
                    Amélie accueille les participants et propose des soins corporels dans son espace dédié, ainsi que des informations pour l&apos;hébergement et l&apos;accès au lieu.
                  </p>
                  <p className="text-[#7A6355] italic">
                    Ses propositions détaillées seront disponibles prochainement, dès l&apos;ouverture de son espace (prévue début juin).
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="mt-12 text-center">
            <Button href="/contact" variant="primary" size="md">Nous contacter</Button>
          </div>
        </Container>
      </div>
    </>
  )
}
