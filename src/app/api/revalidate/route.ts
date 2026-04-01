// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

// Sanity webhook → déclenche la revalidation du cache Next.js
// Configurer dans Sanity : Settings → API → Webhooks
// URL : https://votre-site.fr/api/revalidate
// Secret : SANITY_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret')

    if (process.env.SANITY_WEBHOOK_SECRET && secret !== process.env.SANITY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const body = await req.json()
    const { _type } = body

    // Revalidate selon le type de document Sanity modifié
    switch (_type) {
      case 'activity':
        revalidateTag('activities')
        revalidatePath('/activites', 'page')
        revalidatePath('/activites/[slug]', 'page')
        break
      case 'event':
        revalidateTag('events')
        revalidatePath('/evenements', 'page')
        revalidatePath('/evenements/[slug]', 'page')
        revalidatePath('/', 'page') // homepage featured events
        break
      case 'post':
        revalidateTag('posts')
        revalidatePath('/blog', 'page')
        revalidatePath('/blog/[slug]', 'page')
        break
      case 'siteSettings':
        revalidatePath('/', 'layout')
        break
      default:
        revalidatePath('/', 'layout')
    }

    return NextResponse.json({ revalidated: true, type: _type, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('[REVALIDATE ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
