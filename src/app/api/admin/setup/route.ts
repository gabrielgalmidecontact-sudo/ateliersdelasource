// src/app/api/admin/setup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { secret, email, password } = await req.json()

    const expectedSecret = process.env.SETUP_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Secret invalide' }, { status: 403 })
    }

    const supabase = createServerClient()
    const adminEmail = email || 'gabrielgalmide.contact@gmail.com'
    const adminPassword = password || 'VotreMotDePasse2025!'

    let userId: string

    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { first_name: 'Gabriel', last_name: 'Galmide' },
    })

    if (signUpError) {
      if (
        signUpError.message.includes('already been registered') ||
        signUpError.message.includes('already exists')
      ) {
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
        if (usersError) {
          return NextResponse.json({ error: usersError.message }, { status: 400 })
        }

        const existing = usersData?.users?.find((u) => u.email === adminEmail)
        if (!existing) {
          return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
        }

        userId = existing.id

        const { error: updateUserError } = await supabase.auth.admin.updateUserById(userId, {
          password: adminPassword,
          email_confirm: true,
          user_metadata: { first_name: 'Gabriel', last_name: 'Galmide' },
        })

        if (updateUserError) {
          return NextResponse.json({ error: updateUserError.message }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: signUpError.message }, { status: 400 })
      }
    } else {
      userId = signUpData.user!.id
    }

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
