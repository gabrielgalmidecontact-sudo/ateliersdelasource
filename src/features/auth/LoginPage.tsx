'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type LoginStatus = 'idle' | 'loading' | 'error'

export function LoginPage() {
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [status, setStatus] = useState<LoginStatus>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (status === 'loading') return

    setError('')
    setStatus('loading')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
        signal: controller.signal,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || 'Email ou mot de passe incorrect')
      }

      if (typeof window !== 'undefined') {
        if (data?.accessToken) {
          localStorage.setItem('supabase_access_token', data.accessToken)
        }
        if (data?.refreshToken) {
          localStorage.setItem('supabase_refresh_token', data.refreshToken)
        }
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/admin'
      window.location.assign(callbackUrl)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('La connexion a pris trop de temps. Veuillez réessayer.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur de connexion')
      }
      setStatus('error')
    } finally {
      clearTimeout(timeout)
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col">
      <div className="py-6 border-b border-[#D4C4A8] bg-white">
        <Container>
          <Link
            href="/"
            className="font-serif text-xl text-[#5C3D2E] hover:text-[#C8912A] transition-colors"
          >
            Les Ateliers de la Source
          </Link>
        </Container>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-sm border border-[#D4C4A8] p-8 shadow-sm">
            <div className="text-center mb-8">
              <p className="text-xs font-sans tracking-widest uppercase text-[#C8912A] mb-2">
                Espace membre
              </p>
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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
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
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-[34px] text-[#7A6355] hover:text-[#5C3D2E] transition-colors"
                  aria-label={
                    showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                  }
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
                {status === 'loading' ? (
                  'Connexion…'
                ) : (
                  <>
                    Se connecter <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm font-sans text-[#7A6355]">
              Pas encore de compte ?{' '}
              <Link
                href="/inscription"
                className="text-[#C8912A] hover:text-[#5C3D2E] font-medium transition-colors"
              >
                Créer mon espace
              </Link>
            </p>
            <Link
              href="/"
              className="block text-xs font-sans text-[#7A6355] hover:text-[#5C3D2E] transition-colors"
            >
              ← Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}