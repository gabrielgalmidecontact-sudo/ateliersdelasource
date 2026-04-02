// src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, firstName } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
    }

    // TODO: Connecter votre fournisseur newsletter (Brevo, Mailchimp, Mailerlite, etc.)
    // Exemple avec Brevo (Sendinblue) :
    // const res = await fetch('https://api.brevo.com/v3/contacts', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'api-key': process.env.BREVO_API_KEY!,
    //   },
    //   body: JSON.stringify({
    //     email,
    //     attributes: { FIRSTNAME: firstName },
    //     listIds: [parseInt(process.env.BREVO_LIST_ID!)],
    //     updateEnabled: true,
    //   }),
    // })
    // if (!res.ok) throw new Error('Brevo error')

    console.log('[NEWSLETTER] Inscription:', { email, firstName })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[NEWSLETTER ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
