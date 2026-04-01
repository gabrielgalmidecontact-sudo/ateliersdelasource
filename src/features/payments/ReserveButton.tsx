'use client'
// src/features/payments/ReserveButton.tsx
// Ce composant est préparé mais JAMAIS affiché publiquement
// tant que publicPaymentsEnabled = false dans les réglages du site.

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Lock } from 'lucide-react'

interface ReserveButtonProps {
  eventSlug: string
  priceId?: string
  label?: string
  publicPaymentsEnabled?: boolean
  registrationEnabled?: boolean
}

export function ReserveButton({
  eventSlug,
  priceId,
  label = 'Réserver ma place',
  publicPaymentsEnabled = false,
  registrationEnabled = false,
}: ReserveButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Double guard : si les paiements ne sont pas activés, on n'affiche rien
  if (!publicPaymentsEnabled || !registrationEnabled) {
    return null
  }

  async function handleClick() {
    if (!priceId) {
      setError('Configuration de paiement manquante.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, eventSlug }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Erreur lors de la création du paiement.')
      }
    } catch {
      setError('Une erreur est survenue. Réessayez ou contactez-nous.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="secondary"
        size="md"
        onClick={handleClick}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        <Lock size={14} />
        {loading ? 'Redirection vers le paiement…' : label}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-red-600 font-sans">{error}</p>
      )}
    </div>
  )
}
