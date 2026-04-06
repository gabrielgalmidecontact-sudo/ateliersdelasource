'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

interface AuthUser {
  id: string
  email: string
  accessToken: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error?: string; message?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (token: string) => {
    const res = await fetch('/api/member/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      setProfile(null)
      return
    }

    const data = await res.json().catch(() => null)
    setProfile(data?.profile ?? null)
  }, [])

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user && session.access_token) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            accessToken: session.access_token,
          })
          await fetchProfile(session.access_token)
        } else {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && session.access_token) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          accessToken: session.access_token,
        })
        await fetchProfile(session.access_token)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        return { error: data?.error || 'Email ou mot de passe incorrect' }
      }

      if (!data?.accessToken || !data?.refreshToken) {
        return { error: 'Réponse de connexion invalide' }
      }

      const { error } = await supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
      })

      if (error) {
        return { error: error.message || 'Impossible de créer la session' }
      }

      return {}
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'Erreur serveur' }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) return { error: data?.error || 'Erreur inscription' }

    return { message: data?.message }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user?.accessToken) {
      await fetchProfile(user.accessToken)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAdmin: profile?.role === 'admin',
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}