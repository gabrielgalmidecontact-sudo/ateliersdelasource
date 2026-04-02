// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient, createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    // ① Authentification via le client anon (pas de session persistée sur le service client)
    const authClient = createAuthClient()
    const { data, error } = await authClient.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // ② Récupération du profil via un client service_role SÉPARÉ (bypass RLS sans recursion)
    const adminClient = createServerClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      success: true,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'member',
        firstName: profile?.first_name,
        lastName: profile?.last_name,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
