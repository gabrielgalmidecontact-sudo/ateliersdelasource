'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { supabase } from '@/lib/supabase/client'

type CallbackState = 'loading' | 'error'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [state, setState] = useState<CallbackState>('loading')
  const [error, setError] = useState('')

  const hasHashTokens = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.location.hash.includes('access_token')
  }, [])

  useEffect(() => {
    let isMounted = true

    async function resolveCallback() {
      try {
        if (typeof window === 'undefined') return

        // Nettoyage visuel de l'URL après retour email Supabase
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, '/auth/callback')
        }

        // Laisse Supabase hydrater automatiquement la session depuis l'URL/hash
        // puis récupère la session courante.
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session?.user || !session.access_token) {
          throw new Error('Session de confirmation introuvable')
        }

        const profileRes = await fetch('/api/member/profile', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (!profileRes.ok) {
          throw new Error('Impossible de récupérer le profil utilisateur')
        }

        const profileData = await profileRes.json().catch(() => null)
        const role = profileData?.profile?.role

        if (!isMounted) return

        router.replace(role === 'admin' ? '/admin' : '/espace-membre')
      } catch (err) {
        if (!isMounted) return
        setState('error')
        setError(
          err instanceof Error
            ? err.message
            : 'Une erreur est survenue pendant la confirmation.'
        )
      }
    }

    resolveCallback()

    return () => {
      isMounted = false
    }
  }, [router, hasHashTokens])

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center px-4 py-16">
      <Container className="max-w-md">
        <div className="bg-white rounded-sm border border-[#D4C4A8] p-8 shadow-sm text-center">
          {state === 'loading' ? (
            <>
              <p className="text-xs font-sans tracking-widest uppercase text-[#C8912A] mb-2">
                Confirmation
              </p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">
                Finalisation en cours
              </h1>
              <p className="text-sm font-sans text-[#7A6355] mt-3">
                Nous validons votre inscription et préparons votre espace.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-sans tracking-widest uppercase text-red-600 mb-2">
                Erreur
              </p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">
                Confirmation impossible
              </h1>
              <p className="text-sm font-sans text-[#7A6355] mt-3">
                {error || 'Le lien de confirmation est invalide ou expiré.'}
              </p>
              <button
                type="button"
                onClick={() => router.replace('/connexion')}
                className="mt-6 inline-flex items-center justify-center px-5 py-3 bg-[#5C3D2E] text-white text-sm font-medium hover:bg-[#4A2F24] transition-colors"
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}
