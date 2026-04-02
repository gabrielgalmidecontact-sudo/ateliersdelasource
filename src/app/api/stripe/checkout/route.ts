// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'

// NOTE: Stripe checkout is prepared but NOT exposed publicly.
// It will be activated when siteSettings.publicPaymentsEnabled = true
// and when Stripe is fully configured with proper keys.

export async function POST(req: NextRequest) {
  try {
    // Check if public payments are enabled (read from CMS or env)
    const paymentsEnabled = process.env.PUBLIC_PAYMENTS_ENABLED === 'true'
    if (!paymentsEnabled) {
      return NextResponse.json({ error: 'Paiements non activés' }, { status: 403 })
    }

    const body = await req.json()
    const { priceId, eventSlug, quantity = 1 } = body

    if (!priceId) {
      return NextResponse.json({ error: 'PriceId manquant' }, { status: 400 })
    }

    // TODO: Uncomment when Stripe is configured
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' })
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{ price: priceId, quantity }],
    //   mode: 'payment',
    //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/evenements/${eventSlug}?success=true`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/evenements/${eventSlug}?cancelled=true`,
    //   metadata: { eventSlug },
    // })
    // return NextResponse.json({ url: session.url })

    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 501 })
  } catch (err) {
    console.error('[STRIPE CHECKOUT ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
