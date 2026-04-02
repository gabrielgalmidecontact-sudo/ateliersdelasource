'use client'
// src/features/auth/SignupPage.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function SignupPage() {
  const router = useRouter()
  const { signUp, user } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(true)

  useEffect(() => { setVisible(true) }, [])
  useEffect(() => { if (user) router.push('/espace-membre') }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setStatus('loading')
    const result = await signUp(form.email, form.password, form.firstName, form.lastName)
    if (result.error) {
      setError(result.error)
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-sm border border-[#D4C4A8] p-10 shadow-sm">
            <CheckCircle size={56} className="text-[#4A5E3A] mx-auto mb-5" />
            <h2 className="font-serif text-2xl text-[#5C3D2E] mb-3">Compte créé !</h2>
            <p className="text-sm font-sans text-[#7A6355] leading-relaxed mb-6">
              Un email de confirmation vous a été envoyé à <strong>{form.email}</strong>.
              Cliquez sur le lien dans l&apos;email pour activer votre compte.
            </p>
            <Button href="/connexion" variant="primary" size="md">
              Aller à la connexion
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col">
      <div className="py-6 border-b border-[#D4C4A8] bg-white">
        <Container>
          <Link href="/" className="font-serif text-xl text-[#5C3D2E] hover:text-[#C8912A] transition-colors">
            Les Ateliers de la Source
          </Link>
        </Container>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
        >
          <div className="bg-white rounded-sm border border-[#D4C4A8] p-8 shadow-sm">
            <div className="text-center mb-8">
              <p className="text-xs font-sans tracking-widest uppercase text-[#C8912A] mb-2">Bienvenue</p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">Créer mon espace</h1>
              <p className="text-sm font-sans text-[#7A6355] mt-2">
                Rejoignez la communauté des Ateliers de la Source
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom *"
                  name="firstName"
                  placeholder="Prénom"
                  value={form.firstName}
                  onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                  required
                  autoComplete="given-name"
                />
                <Input
                  label="Nom"
                  name="lastName"
                  placeholder="Nom"
                  value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  autoComplete="family-name"
                />
              </div>

              <Input
                label="Email *"
                type="email"
                name="email"
                placeholder="votre@email.fr"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Mot de passe * (min. 8 caractères)"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Choisir un mot de passe"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-[34px] text-[#7A6355] hover:text-[#5C3D2E] transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <Input
                label="Confirmer le mot de passe *"
                type={showPass ? 'text' : 'password'}
                name="confirm"
                placeholder="Répéter le mot de passe"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                required
                autoComplete="new-password"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                  <p className="text-sm font-sans text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={status === 'loading'}
                className="w-full mt-2"
              >
                {status === 'loading' ? 'Création…' : 'Créer mon compte'}
              </Button>

              <p className="text-xs font-sans text-[#7A6355] text-center leading-relaxed">
                En créant un compte, vous acceptez notre{' '}
                <Link href="/politique-confidentialite" className="underline hover:text-[#5C3D2E] transition-colors">
                  politique de confidentialité
                </Link>
              </p>
            </form>
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm font-sans text-[#7A6355]">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-[#C8912A] hover:text-[#5C3D2E] font-medium transition-colors">
                Se connecter
              </Link>
            </p>
            <Link href="/" className="block text-xs font-sans text-[#7A6355] hover:text-[#5C3D2E] transition-colors">
              ← Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
