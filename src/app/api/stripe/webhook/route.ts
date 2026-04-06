// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'

// NOTE: Ce webhook Stripe est préparé mais inactif.
// Il sera activé lorsque :
// 1. STRIPE_SECRET_KEY est configuré dans .env.local
// 2. STRIPE_WEBHOOK_SECRET est récupéré via `stripe listen` ou dashboard Stripe
// 3. siteSettings.publicPaymentsEnabled = true dans Sanity

export async function POST(req: NextRequest) {
  // Check if payments are enabled
  const paymentsEnabled = process.env.PUBLIC_PAYMENTS_ENABLED === 'true'
  if (!paymentsEnabled) {
    return NextResponse.json({ error: 'Paiements non activés' }, { status: 403 })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') ?? ''

    // TODO: Décommenter quand Stripe est configuré
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' })
    // let event: Stripe.Event
    // try {
    //   event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    // } catch (err) {
    //   return NextResponse.json({ error: 'Signature webhook invalide' }, { status: 400 })
    // }
    //
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     const session = event.data.object as Stripe.Checkout.Session
    //     // Enregistrer la réservation en base / envoyer un email de confirmation
    //     console.log('[STRIPE] Paiement reçu:', session.id)
    //     break
    //   case 'payment_intent.payment_failed':
    //     console.log('[STRIPE] Paiement échoué')
    //     break
    // }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[STRIPE WEBHOOK ERROR]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
