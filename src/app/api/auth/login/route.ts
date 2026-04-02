// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAuthClient, createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Auth via client anon
    const authClient = createAuthClient()
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Profil via service_role
    const adminClient = createServerClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, first_name, last_name')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      success: true,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'member',
        firstName: profile?.first_name || null,
        lastName: profile?.last_name || null,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}