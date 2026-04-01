'use client'
// src/features/contact/ContactPage.tsx
import { useState, useRef, useEffect } from 'react'
import { Mail, MapPin, CheckCircle } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function FadeIn({ children, delay = 0, className = '', slideX = false }: {
  children: React.ReactNode
  delay?: number
  className?: string
  slideX?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.05 }
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

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Veuillez remplir les champs obligatoires.')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setStatus('success') }
      else { throw new Error() }
    } catch {
      setStatus('error')
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.')
    }
  }

  return (
    <>
      {/* Hero */}
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <FadeIn className="text-center">
            <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#C8912A] mb-4">Nous écrire</p>
            <h1 className="font-serif text-4xl md:text-5xl text-[#F5EDD8] mb-4">Contact</h1>
            <p className="text-base font-sans text-[#C8A888] max-w-md mx-auto">
              Une question, un projet, une envie de participer ? Nous vous répondons avec plaisir.
            </p>
          </FadeIn>
        </Container>
      </div>

      {/* Content */}
      <div className="bg-[#FAF6EF] py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <FadeIn delay={100} className="lg:col-span-2">
              <h2 className="font-serif text-2xl text-[#5C3D2E] mb-8">Envoyer un message</h2>

              {status === 'success' ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <CheckCircle size={56} className="text-[#4A5E3A]" />
                  <h3 className="font-serif text-2xl text-[#5C3D2E]">Message envoyé !</h3>
                  <p className="font-sans text-[#7A6355] max-w-sm">
                    Merci pour votre message. Nous vous répondrons dans les meilleurs délais.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                  >
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Nom *"
                      name="name"
                      placeholder="Votre nom complet"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Email *"
                      name="email"
                      type="email"
                      placeholder="votre@email.fr"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Téléphone"
                      name="phone"
                      type="tel"
                      placeholder="06 00 00 00 00"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    <Input
                      label="Sujet"
                      name="subject"
                      placeholder="Ex: Stage, Spectacle, Question..."
                      value={form.subject}
                      onChange={handleChange}
                    />
                  </div>
                  <Textarea
                    label="Message *"
                    name="message"
                    placeholder="Décrivez votre demande..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                  {error && (
                    <p className="text-sm text-red-600 font-sans bg-red-50 rounded-sm px-4 py-2 border border-red-200">{error}</p>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={status === 'loading'}
                    className="w-full sm:w-auto"
                  >
                    {status === 'loading' ? 'Envoi en cours…' : 'Envoyer le message'}
                  </Button>
                </form>
              )}
            </FadeIn>

            {/* Sidebar info */}
            <FadeIn delay={200} slideX>
              <div className="sticky top-24 space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-[#5C3D2E] mb-5">Informations</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans text-[#7A6355] mb-0.5 uppercase tracking-wider">Email</p>
                        <a href="mailto:contact@ateliersdelasource.fr" className="text-sm font-sans text-[#5C3D2E] hover:text-[#C8912A] transition-colors">
                          contact@ateliersdelasource.fr
                        </a>
                        <p className="text-xs font-sans text-[#7A6355] italic mt-1">Adresse en cours de création</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-[#C8912A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-sans text-[#7A6355] mb-0.5 uppercase tracking-wider">Lieu</p>
                        <p className="text-sm font-sans text-[#5C3D2E]">France</p>
                        <p className="text-xs font-sans text-[#7A6355] italic mt-1">Adresse précise communiquée à l&apos;inscription</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
                  <p className="text-sm font-serif text-[#5C3D2E] mb-2">Vous cherchez des informations sur un stage ou un spectacle ?</p>
                  <p className="text-xs font-sans text-[#7A6355] leading-relaxed">
                    Précisez l&apos;activité dans votre message, nous vous répondrons en détail sur les dates, tarifs et modalités d&apos;inscription.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </div>
    </>
  )
}
