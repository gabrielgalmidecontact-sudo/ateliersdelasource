// src/app/api/admin/setup/route.ts
// Route sécurisée pour créer/promouvoir Gabriel comme admin
// Protégée par NEXTAUTH_SECRET — à appeler UNE SEULE FOIS après déploiement
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { secret, email, password } = await req.json()

    // Vérification du secret de sécurité
    const expectedSecret = process.env.SETUP_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Secret invalide' }, { status: 403 })
    }

    const supabase = createServerClient()
    const adminEmail = email || 'gabrielgalmide.contact@gmail.com'

    // Créer le compte Supabase Auth
    let userId: string
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: password || undefined,
      email_confirm: true,
      user_metadata: { first_name: 'Gabriel', last_name: 'Galmide' },
    })

    if (signUpError) {
      if (
        signUpError.message.includes('already been registered') ||
        signUpError.message.includes('already exists')
      ) {
        // Utilisateur existe — récupérer son ID
        const { data: users } = await supabase.auth.admin.listUsers()
        const existing = users?.users?.find((u) => u.email === adminEmail)
        if (!existing) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
        userId = existing.id
      } else {
        return NextResponse.json({ error: signUpError.message }, { status: 400 })
      }
    } else {
      userId = signUpData.user!.id
    }

    // Promouvoir en admin dans la table profiles
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: adminEmail,
      first_name: 'Gabriel',
      last_name: 'Galmide',
      role: 'admin',
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `✅ Compte admin prêt pour ${adminEmail}`,
      userId,
    })
  } catch (err) {
    console.error('Setup error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
