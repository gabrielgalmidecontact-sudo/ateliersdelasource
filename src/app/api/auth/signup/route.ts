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

    // Créer le compte Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/espace-membre`,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
    }

    // Upsert du profil avec prénom/nom
    // On utilise upsert (pas update) pour être safe si le trigger a déjà créé la ligne
    // ou si la confirmation email est désactivée (pas de trigger déclenché)
    if (firstName || lastName) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email,
          first_name: firstName || null,
          last_name: lastName || null,
          role: 'member',
        }, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })

      if (profileError) {
        // Non bloquant — le trigger crée le profil de toute façon
        console.warn('[SIGNUP] Profile upsert warning:', profileError.message)
      }
    }

    // Envoyer l'email de bienvenue si Resend est configuré
    if (process.env.RESEND_API_KEY && firstName) {
      try {
        const { sendWelcomeEmail } = await import('@/lib/email/resend')
        await sendWelcomeEmail({ to: email, firstName })
      } catch (emailErr) {
        console.warn('[SIGNUP] Welcome email error:', emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.',
      userId: data.user.id,
      requiresEmailConfirmation: !data.session, // true si email de confirmation requis
    })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
