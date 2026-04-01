// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    // TODO: Connect email provider (Resend, SendGrid, etc.)
    // For now, log to console. In production, send email here.
    console.log('[CONTACT FORM]', { name, email, subject: body.subject, phone: body.phone, message })

    // Example with Resend (uncomment when configured):
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'noreply@ateliersdelasource.fr',
    //   to: process.env.CONTACT_EMAIL!,
    //   subject: `Nouveau message de ${name}`,
    //   html: `<p><strong>Nom:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    // })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CONTACT ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
