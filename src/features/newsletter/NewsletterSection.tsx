'use client'
// src/features/newsletter/NewsletterSection.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Votre email est requis.'); return }
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      })
      if (res.ok) { setStatus('success') }
      else { throw new Error() }
    } catch {
      setStatus('error')
      setError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <section className="py-20 bg-[#4A5E3A]" aria-labelledby="newsletter-title">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#B8C4A8] mb-3">Newsletter</p>
          <h2 id="newsletter-title" className="font-serif text-3xl text-white mb-4">
            Restez informé
          </h2>
          <p className="text-sm font-sans text-[#B8C4A8] mb-8 leading-relaxed">
            Recevez nos prochains stages, événements et actualités directement dans votre boîte mail.
            Pas de spam — vous pouvez vous désabonner à tout moment.
          </p>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <CheckCircle size={48} className="text-[#B8C4A8]" />
              <p className="font-serif text-xl text-white">Merci, vous êtes inscrit !</p>
              <p className="text-sm font-sans text-[#B8C4A8]">Vous recevrez prochainement nos actualités.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              <Input
                type="text"
                name="firstName"
                placeholder="Prénom (optionnel)"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60"
                aria-label="Prénom"
              />
              <Input
                type="email"
                name="email"
                placeholder="Votre adresse email *"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                className="bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60"
                required
                aria-label="Adresse email"
                error={error}
              />
              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={status === 'loading'}
                className="w-full"
              >
                {status === 'loading' ? 'Inscription…' : 'S\'inscrire à la newsletter'}
              </Button>
              <p className="text-xs font-sans text-[#B8C4A8]/60 mt-2">
                Vos données ne seront jamais partagées. Voir notre{' '}
                <a href="/politique-confidentialite" className="underline hover:text-[#B8C4A8] transition-colors">
                  politique de confidentialité
                </a>.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
