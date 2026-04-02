// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Log toujours (utile pour le debug)
    console.log('[CONTACT FORM]', { name, email, subject: body.subject, phone: body.phone, message })

    // Envoi avec Resend si la clé est configurée
    if (process.env.RESEND_API_KEY) {
      try {
        const { sendContactNotification, sendContactConfirmation } = await import('@/lib/email/resend')

        // Email à Gabriel
        await sendContactNotification({
          name,
          email,
          phone: body.phone,
          subject: body.subject,
          message,
        })

        // Email de confirmation au visiteur
        await sendContactConfirmation({ to: email, name })
      } catch (emailErr) {
        // Ne pas bloquer la réponse si l'email échoue
        console.error('[CONTACT EMAIL ERROR]', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CONTACT ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
