// src/app/api/email/send/route.ts
// Route email générique — utilisée par Make/n8n ou webhooks internes
// Protégée par RESEND_WEBHOOK_SECRET
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  try {
    // Vérification du secret si présent
    const secret = req.headers.get('x-webhook-secret')
    const expectedSecret = process.env.RESEND_WEBHOOK_SECRET
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Secret invalide' }, { status: 403 })
    }

    const body = await req.json()
    const { to, subject, html, replyTo } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Champs requis : to, subject, html' },
        { status: 400 }
      )
    }

    // Vérifier que RESEND_API_KEY est configurée
    if (!process.env.RESEND_API_KEY) {
      // En développement sans Resend : simuler l'envoi
      console.log('[EMAIL SIMULÉ]', { to, subject })
      return NextResponse.json({ success: true, simulated: true })
    }

    const result = await sendEmail({ to, subject, html, replyTo })
    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (err) {
    console.error('[EMAIL SEND ERROR]', err)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 })
  }
}
