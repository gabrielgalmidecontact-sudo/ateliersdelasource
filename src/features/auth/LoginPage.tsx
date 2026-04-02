'use client'
// src/features/auth/LoginPage.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const router = useRouter()
  const { signIn, user, isAdmin } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(true)

  useEffect(() => { setVisible(true) }, [])

  // Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      router.push(isAdmin ? '/admin' : '/espace-membre')
    }
  }, [user, isAdmin, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    const result = await signIn(form.email, form.password)
    if (result.error) {
      setError(result.error)
      setStatus('error')
    }
    // La redirection est gérée par le useEffect ci-dessus
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col">
      {/* Header minimal */}
      <div className="py-6 border-b border-[#D4C4A8] bg-white">
        <Container>
          <Link href="/" className="font-serif text-xl text-[#5C3D2E] hover:text-[#C8912A] transition-colors">
            Les Ateliers de la Source
          </Link>
        </Container>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="w-full max-w-md"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
        >
          {/* Card */}
          <div className="bg-white rounded-sm border border-[#D4C4A8] p-8 shadow-sm">
            <div className="text-center mb-8">
              <p className="text-xs font-sans tracking-widest uppercase text-[#C8912A] mb-2">Espace membre</p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">Connexion</h1>
              <p className="text-sm font-sans text-[#7A6355] mt-2">
                Accédez à votre espace personnel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input
                label="Adresse email"
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
                  label="Mot de passe"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Votre mot de passe"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-[34px] text-[#7A6355] hover:text-[#5C3D2E] transition-colors"
                  aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

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
                className="w-full"
              >
                {status === 'loading' ? 'Connexion…' : (
                  <>Se connecter <ArrowRight size={16} /></>
                )}
              </Button>
            </form>
          </div>

          {/* Liens */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm font-sans text-[#7A6355]">
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="text-[#C8912A] hover:text-[#5C3D2E] font-medium transition-colors">
                Créer mon espace
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
