// src/app/api/social-share/route.ts
import { NextRequest, NextResponse } from 'next/server'

function getSlugValue(slug: unknown): string {
  if (typeof slug === 'string') return slug
  if (slug && typeof slug === 'object' && 'current' in slug) {
    const current = (slug as { current?: unknown }).current
    return typeof current === 'string' ? current : ''
  }
  return ''
}

function getContentPath(type: string, slug: string): string | null {
  if (!slug) return null

  switch (type) {
    case 'post':
      return `/blog/${slug}`
    case 'activity':
      return `/activites/${slug}`
    case 'event':
      return `/evenements/${slug}`
    default:
      return null
  }
}

// Endpoint appelé par Sanity via webhook ou manuellement.
// Déclenche un webhook Make / n8n avec les données du contenu à partager.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { _type, _id, title, slug, excerpt, publishedAt, shareOnSocials } = body

    const authHeader = req.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.WEBHOOK_SECRET}`
    if (process.env.WEBHOOK_SECRET && authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!shareOnSocials) {
      return NextResponse.json({ skipped: true, reason: 'shareOnSocials is false' })
    }

    const webhookUrl = process.env.SOCIAL_SHARE_WEBHOOK_URL
    if (!webhookUrl) {
      console.log('[SOCIAL-SHARE] No webhook URL configured. Payload:', { _id, title, _type })
      return NextResponse.json({ success: true, note: 'No webhook configured' })
    }

    const slugValue = getSlugValue(slug)
    const contentPath = getContentPath(_type, slugValue)
    if (!contentPath) {
      return NextResponse.json(
        { error: `Type de contenu non supporté pour le partage: ${_type}` },
        { status: 400 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'

    const payload = {
      type: _type,
      id: _id,
      title,
      slug: slugValue,
      excerpt,
      publishedAt,
      url: `${siteUrl}${contentPath}`,
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error(`Webhook responded with ${res.status}`)
    }

    return NextResponse.json({ success: true, payload })
  } catch (err) {
    console.error('[SOCIAL-SHARE ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
