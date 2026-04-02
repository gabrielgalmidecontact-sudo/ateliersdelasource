'use client'
// src/features/auth/MemberReservationsPage.tsx — connectée à Supabase (Bearer token)
import { useEffect, useState, useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Reservation } from '@/lib/supabase/types'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pending: {
    label: 'En attente',
    icon: <Clock size={14} />,
    color: '#92400E',
    bg: '#FEF3C7',
  },
  confirmed: {
    label: 'Confirmée',
    icon: <CheckCircle size={14} />,
    color: '#065F46',
    bg: '#D1FAE5',
  },
  cancelled: {
    label: 'Annulée',
    icon: <XCircle size={14} />,
    color: '#9CA3AF',
    bg: '#F3F4F6',
  },
  completed: {
    label: 'Terminée',
    icon: <CheckCircle size={14} />,
    color: '#4A5E3A',
    bg: '#F0F5EC',
  },
}

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  free: { label: 'Gratuit', color: '#4A5E3A' },
  pending: { label: 'Paiement en attente', color: '#92400E' },
  paid: { label: 'Payé', color: '#065F46' },
  refunded: { label: 'Remboursé', color: '#6B7280' },
}

export function MemberReservationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion?callbackUrl=/espace-membre/reservations')
    }
  }, [user, isLoading, router])

  const loadReservations = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/member/reservations', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setReservations(data.reservations || [])
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadReservations()
  }, [user, loadReservations])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="pt-32 pb-12 bg-[#5C3D2E]">
        <Container>
          <Link
            href="/espace-membre"
            className="text-[#C8A888] hover:text-[#F5EDD8] transition-colors text-sm font-sans flex items-center gap-1 mb-3"
          >
            <ArrowLeft size={14} /> Espace membre
          </Link>
          <h1 className="font-serif text-3xl text-[#F5EDD8]">Mes réservations</h1>
          <p className="text-sm font-sans text-[#C8A888] mt-1">
            {reservations.length > 0
              ? `${reservations.length} réservation${reservations.length > 1 ? 's' : ''}`
              : 'Historique de vos inscriptions'}
          </p>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16">
        <Container size="md">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reservations.length === 0 ? (
              <>
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F5EDD8] flex items-center justify-center mx-auto mb-5">
                    <Calendar size={28} className="text-[#C8912A]" />
                  </div>
                  <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">
                    Aucune réservation pour le moment
                  </h2>
                  <p className="text-sm font-sans text-[#7A6355] max-w-xs mx-auto mb-6 leading-relaxed">
                    Vos futures réservations de stages, ateliers et spectacles apparaîtront ici.
                  </p>
                  <Button href="/evenements" variant="outline" size="md">
                    Voir les prochains stages
                  </Button>
                </div>

                <div className="mt-6 p-5 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-sans text-[#7A6355]">
                      <span className="font-medium text-[#5C3D2E]">Pour vous inscrire à un stage : </span>
                      Utilisez le formulaire de contact sur chaque page de stage, ou contactez directement Gabriel ou Amélie.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {reservations.map((res) => {
                  const statusConfig = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending
                  const paymentConfig = PAYMENT_CONFIG[res.payment_status] || PAYMENT_CONFIG.free
                  const eventDate = new Date(res.event_date)
                  const isPast = eventDate < new Date()

                  return (
                    <div
                      key={res.id}
                      className={`bg-white rounded-sm border p-5 flex items-center gap-4 flex-wrap ${isPast ? 'border-[#D4C4A8]/50 opacity-80' : 'border-[#D4C4A8]'}`}
                    >
                      {/* Date badge */}
                      <div
                        className="w-14 h-14 rounded-sm flex flex-col items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: isPast ? '#7A6355' : '#5C3D2E' }}
                      >
                        <span className="font-serif text-xl font-bold leading-none">
                          {eventDate.getDate()}
                        </span>
                        <span className="text-[10px] font-sans text-[#C8912A] uppercase tracking-wide">
                          {eventDate.toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                        <span className="text-[10px] font-sans text-white/60">
                          {eventDate.getFullYear()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base text-[#5C3D2E] mb-1">{res.event_title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Status badge */}
                          <span
                            className="inline-flex items-center gap-1 text-xs font-sans px-2 py-0.5 rounded-full"
                            style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                          {/* Payment badge */}
                          <span
                            className="text-xs font-sans"
                            style={{ color: paymentConfig.color }}
                          >
                            {paymentConfig.label}
                            {res.amount_cents ? ` (${(res.amount_cents / 100).toFixed(0)} €)` : ''}
                          </span>
                        </div>
                        {res.notes && (
                          <p className="text-xs font-sans text-[#7A6355] mt-1 italic">{res.notes}</p>
                        )}
                      </div>

                      {/* Date inscription */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-sans text-[#7A6355]">Inscrit le</p>
                        <p className="text-xs font-sans text-[#5C3D2E] font-medium">
                          {new Date(res.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Container>
      </div>
    </>
  )
}
