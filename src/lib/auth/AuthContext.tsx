'use client'
// src/lib/auth/AuthContext.tsx
// Contexte d'authentification global — Supabase Auth
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
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string; message?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string, token: string) => {
    const res = await fetch('/api/member/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const { profile } = await res.json()
      setProfile(profile)
    }
  }, [])

  useEffect(() => {
    // Récupérer la session Supabase au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email!, accessToken: session.access_token })
        fetchProfile(session.user.id, session.access_token)
      }
      setIsLoading(false)
    })

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email!, accessToken: session.access_token })
        fetchProfile(session.user.id, session.access_token)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }

    // Synchroniser la session Supabase côté client
    await supabase.auth.setSession({ access_token: data.accessToken, refresh_token: data.refreshToken })
    return {}
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    return { message: data.message }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id, user.accessToken)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, isLoading,
      isAdmin: profile?.role === 'admin',
      signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
