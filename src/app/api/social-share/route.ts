// src/app/api/social-share/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Endpoint appelé par Sanity via un webhook GROQ-triggered ou manuellement
// Déclenche un webhook Make / n8n avec les données de l'article

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { _type, _id, title, slug, excerpt, publishedAt, shareOnSocials } = body

    // Vérification sécurité — token secret
    const authHeader = req.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.WEBHOOK_SECRET}`
    if (process.env.WEBHOOK_SECRET && authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Ne partager que si le flag est activé dans Sanity
    if (!shareOnSocials) {
      return NextResponse.json({ skipped: true, reason: 'shareOnSocials is false' })
    }

    const webhookUrl = process.env.SOCIAL_SHARE_WEBHOOK_URL
    if (!webhookUrl) {
      console.log('[SOCIAL-SHARE] No webhook URL configured. Payload:', { _id, title })
      return NextResponse.json({ success: true, note: 'No webhook configured' })
    }

    // Envoyer les données au webhook Make / n8n
    const payload = {
      type: _type,
      id: _id,
      title,
      slug: slug?.current,
      excerpt,
      publishedAt,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug?.current}`,
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error(`Webhook responded with ${res.status}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SOCIAL-SHARE ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
