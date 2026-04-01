// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Mot de passe minimum 8 caractères' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Créer le compte
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/espace-membre`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Compléter le profil avec prénom/nom
    if (data.user && firstName) {
      await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName || null })
        .eq('id', data.user.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.',
      userId: data.user?.id,
    })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
