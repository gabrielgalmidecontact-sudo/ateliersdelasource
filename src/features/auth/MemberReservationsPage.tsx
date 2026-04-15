'use client'
// src/features/auth/MemberReservationsPage.tsx — connectée à Supabase (Bearer token)
import { useEffect, useState, useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { ArrowLeft, Calendar, CheckCircle, Clock, XCircle, AlertCircle, Loader2, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Reservation } from '@/lib/supabase/types'

type ProfileReservationDefaults = {
  first_name?: string | null
  last_name?: string | null
  diet_type?: string | null
  food_allergies?: string | null
  food_intolerances?: string | null
  diet_notes?: string | null
  logistics_notes?: string | null
}

type MemberReview = {
  id: string
  reservation_id: string | null
  content_slug: string
  content_title: string
  is_published: boolean
  created_at: string
}

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

const ACCOMMODATION_OPTIONS = [
  { value: '', label: 'Sans hébergement précisé' },
  { value: 'shared', label: 'Chambre partagée' },
  { value: 'private', label: 'Chambre individuelle' },
  { value: 'external', label: 'Hébergement externe' },
]

const TRANSPORT_OPTIONS = [
  { value: '', label: 'Sélectionner un mode de transport' },
  { value: 'train', label: 'Train' },
  { value: 'avion', label: 'Avion' },
  { value: 'voiture', label: 'Voiture' },
  { value: 'bus', label: 'Bus' },
]

const DIET_OPTIONS = [
  { value: '', label: 'Sélectionner un régime' },
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Végétarien' },
  { value: 'vegan', label: 'Végan' },
  { value: 'pescatarian', label: 'Pescétarien' },
  { value: 'no_preference', label: 'Sans préférence' },
  { value: 'other', label: 'Autre' },
]

function formatAccommodation(value: string | null | undefined) {
  switch (value) {
    case 'shared':
      return 'Chambre partagée'
    case 'private':
      return 'Chambre individuelle'
    case 'external':
      return 'Hébergement externe'
    default:
      return '—'
  }
}

function normalizeDateForInput(value?: string | null) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toISOString().slice(0, 10)
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange?: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`${n <= value ? 'text-[#C8912A]' : 'text-[#D4C4A8]'} ${onChange ? 'cursor-pointer hover:text-[#C8912A]' : 'cursor-default'}`}
        >
          <Star size={18} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export function MemberReservationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [memberReviews, setMemberReviews] = useState<MemberReview[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(true)
  const [formSuccess, setFormSuccess] = useState('')
  const [formError, setFormError] = useState('')
  const [profileDefaults, setProfileDefaults] = useState<ProfileReservationDefaults | null>(null)
  const [hasAppliedQueryPrefill, setHasAppliedQueryPrefill] = useState(false)
  const [openReviewId, setOpenReviewId] = useState<string | null>(null)
  const [reviewSubmittingFor, setReviewSubmittingFor] = useState<string | null>(null)
  const [reviewMessage, setReviewMessage] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({})
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { firstName: string; email: string; rating: number; comment: string }>>({})
  const [form, setForm] = useState({
    event_title: '',
    event_slug: '',
    event_date: '',
    accommodation_type: '',
    transport_mode: '',
    arrival_location: '',
    needs_transfer: false,
    arrival_time: '',
    departure_time: '',
    diet_type: '',
    food_allergies: '',
    food_intolerances: '',
    logistics_notes: '',
    notes: '',
  })

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : '/espace-membre/reservations'
      router.push(`/connexion?callbackUrl=${encodeURIComponent(currentPath)}`)
    }
  }, [user, isLoading, router])

  const loadProfileDefaults = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/member/profile', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      if (!res.ok) return
      const data = await res.json().catch(() => ({}))
      const profile = data?.profile
      if (!profile) return

      const defaults: ProfileReservationDefaults = {
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        diet_type: profile.diet_type || null,
        food_allergies: profile.food_allergies || null,
        food_intolerances: profile.food_intolerances || null,
        diet_notes: profile.diet_notes || null,
        logistics_notes: profile.logistics_notes || null,
      }

      setProfileDefaults(defaults)
      setForm((prev) => ({
        ...prev,
        diet_type: prev.diet_type || defaults.diet_type || '',
        food_allergies: prev.food_allergies || defaults.food_allergies || '',
        food_intolerances: prev.food_intolerances || defaults.food_intolerances || '',
        logistics_notes: prev.logistics_notes || defaults.logistics_notes || '',
      }))
    } catch {
      // silencieux
    }
  }, [user])

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

  const loadMemberReviews = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/member/reviews', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      if (!res.ok) return
      const data = await res.json().catch(() => ({}))
      setMemberReviews(data.reviews || [])
    } catch {
      // silencieux
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadReservations()
      loadProfileDefaults()
      loadMemberReviews()
    }
  }, [user, loadReservations, loadProfileDefaults, loadMemberReviews])

  useEffect(() => {
    if (!searchParams || hasAppliedQueryPrefill) return

    const nextEventTitle = searchParams.get('event_title') || ''
    const nextEventSlug = searchParams.get('event_slug') || ''
    const nextEventDate = normalizeDateForInput(searchParams.get('event_date'))

    if (!nextEventTitle && !nextEventSlug && !nextEventDate) {
      setHasAppliedQueryPrefill(true)
      return
    }

    setForm((prev) => ({
      ...prev,
      event_title: prev.event_title || nextEventTitle,
      event_slug: prev.event_slug || nextEventSlug,
      event_date: prev.event_date || nextEventDate,
    }))
    setHasAppliedQueryPrefill(true)
  }, [searchParams, hasAppliedQueryPrefill])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox'
      ? target.checked
      : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  function getReservationReview(reservation: Reservation) {
    return memberReviews.find((review) =>
      review.reservation_id === reservation.id ||
      review.content_slug === reservation.event_slug
    )
  }

  function openReviewForm(reservation: Reservation) {
    const existing = reviewDrafts[reservation.id]
    if (!existing) {
      setReviewDrafts((prev) => ({
        ...prev,
        [reservation.id]: {
          firstName: profileDefaults?.first_name || '',
          email: user?.email || '',
          rating: 5,
          comment: '',
        },
      }))
    }
    setReviewMessage((prev) => ({ ...prev, [reservation.id]: undefined as never }))
    setOpenReviewId(reservation.id)
  }

  function updateReviewDraft(
    reservationId: string,
    patch: Partial<{ firstName: string; email: string; rating: number; comment: string }>
  ) {
    setReviewDrafts((prev) => ({
      ...prev,
      [reservationId]: {
        firstName: prev[reservationId]?.firstName || profileDefaults?.first_name || '',
        email: prev[reservationId]?.email || user?.email || '',
        rating: prev[reservationId]?.rating || 5,
        comment: prev[reservationId]?.comment || '',
        ...patch,
      },
    }))
  }

  async function submitReview(reservation: Reservation) {
    if (!user) return

    const draft = reviewDrafts[reservation.id] || {
      firstName: profileDefaults?.first_name || '',
      email: user.email || '',
      rating: 5,
      comment: '',
    }

    if (!draft.firstName.trim()) {
      setReviewMessage((prev) => ({
        ...prev,
        [reservation.id]: { type: 'error', text: 'Le prénom est requis.' },
      }))
      return
    }

    if (!draft.email.trim() || !draft.email.includes('@')) {
      setReviewMessage((prev) => ({
        ...prev,
        [reservation.id]: { type: 'error', text: 'Un email valide est requis.' },
      }))
      return
    }

    if (!draft.comment.trim() || draft.comment.trim().length < 10) {
      setReviewMessage((prev) => ({
        ...prev,
        [reservation.id]: { type: 'error', text: 'Votre commentaire doit contenir au moins 10 caractères.' },
      }))
      return
    }

    setReviewSubmittingFor(reservation.id)
    setReviewMessage((prev) => ({ ...prev, [reservation.id]: undefined as never }))

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          contentType: 'event',
          contentSlug: reservation.event_slug,
          contentTitle: reservation.event_title,
          firstName: draft.firstName.trim(),
          email: draft.email.trim(),
          rating: draft.rating,
          comment: draft.comment.trim(),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de l’envoi de l’avis.')
      }

      setReviewMessage((prev) => ({
        ...prev,
        [reservation.id]: {
          type: 'success',
          text: 'Merci. Votre avis a bien été enregistré et sera publié après validation.',
        },
      }))
      setOpenReviewId(null)
      await loadMemberReviews()
    } catch (error) {
      setReviewMessage((prev) => ({
        ...prev,
        [reservation.id]: {
          type: 'error',
          text: error instanceof Error ? error.message : 'Erreur lors de l’envoi de l’avis.',
        },
      }))
    } finally {
      setReviewSubmittingFor(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || submitting) return

    setSubmitting(true)
    setFormError('')
    setFormSuccess('')

    try {
      const res = await fetch('/api/member/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          event_title: form.event_title.trim(),
          event_slug: form.event_slug.trim(),
          event_date: form.event_date,
          accommodation_type: form.accommodation_type || null,
          transport_mode: form.transport_mode || null,
          arrival_location: form.arrival_location.trim() || null,
          needs_transfer: form.needs_transfer,
          arrival_time: form.arrival_time.trim() || null,
          departure_time: form.departure_time.trim() || null,
          diet_type: form.diet_type || null,
          food_allergies: form.food_allergies.trim() || null,
          food_intolerances: form.food_intolerances.trim() || null,
          logistics_notes: form.logistics_notes.trim() || null,
          notes: form.notes.trim() || null,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setFormError(data?.error || 'Impossible de créer la réservation')
        return
      }

      setForm({
        event_title: '',
        event_slug: '',
        event_date: '',
        accommodation_type: '',
        transport_mode: '',
        arrival_location: '',
        needs_transfer: false,
        arrival_time: '',
        departure_time: '',
        diet_type: '',
        food_allergies: '',
        food_intolerances: '',
        logistics_notes: '',
        notes: '',
      })
      setFormSuccess('Votre demande de réservation a bien été enregistrée. Vous recevrez un email avec les informations pratiques d’accès.')
      await loadReservations()
    } catch {
      setFormError('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

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
            className="space-y-8"
          >
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-8">
              <div className="mb-6">
                <h2 className="font-serif text-2xl text-[#5C3D2E] mb-2">Demande de réservation</h2>
                <p className="text-sm font-sans text-[#7A6355] leading-relaxed">
                  Indiquez l’atelier ou le stage souhaité ainsi que vos informations d’organisation.
                  Si vous arrivez depuis une page activité ou événement, certaines informations sont déjà préremplies.
                  Vos préférences alimentaires enregistrées dans votre profil sont reprises automatiquement,
                  puis vous complétez les informations de transport et d’hébergement pour chaque réservation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Nom de l’atelier / stage"
                    name="event_title"
                    value={form.event_title}
                    onChange={handleChange}
                    placeholder="Ex. Théâtre des Doubles Karmiques"
                    required
                    className="bg-[#FAF6EF]"
                  />
                  <Input
                    label="Slug de l’événement"
                    name="event_slug"
                    value={form.event_slug}
                    onChange={handleChange}
                    placeholder="ex. theatre-des-doubles-karmiques"
                    required
                    className="bg-[#FAF6EF]"
                    hint="Prérempli automatiquement si vous arrivez depuis une page activité ou événement."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="event_date"
                      className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5"
                    >
                      Date souhaitée
                    </label>
                    <input
                      id="event_date"
                      name="event_date"
                      type="date"
                      value={form.event_date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-sm border border-[#D4C4A8] bg-[#FAF6EF] px-4 py-3 font-sans text-sm text-[#2D1F14] transition-colors duration-200 focus:outline-none focus:border-[#C8912A] focus:ring-1 focus:ring-[#C8912A]/30"
                    />
                  </div>

                  {profileDefaults && (
                    <div className="rounded-sm border border-[#E8D8B8] bg-white px-4 py-3">
                      <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-1">Informations déjà enregistrées dans votre profil</p>
                      <p className="text-sm font-sans text-[#5C3D2E]">
                        Régime : {profileDefaults.diet_type ? DIET_OPTIONS.find((option) => option.value === profileDefaults.diet_type)?.label || profileDefaults.diet_type : 'Non renseigné'}
                      </p>
                      <p className="text-sm font-sans text-[#7A6355] mt-1">
                        Vous pouvez ajuster ces informations pour cette réservation si nécessaire.
                      </p>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="accommodation_type"
                      className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5"
                    >
                      Hébergement *
                    </label>
                    <select
                      id="accommodation_type"
                      name="accommodation_type"
                      value={form.accommodation_type}
                      onChange={handleChange}
                      required
                      className="w-full rounded-sm border border-[#D4C4A8] bg-[#FAF6EF] px-4 py-3 font-sans text-sm text-[#2D1F14] transition-colors duration-200 focus:outline-none focus:border-[#C8912A] focus:ring-1 focus:ring-[#C8912A]/30"
                    >
                      {ACCOMMODATION_OPTIONS.map((option) => (
                        <option key={option.value || 'empty'} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border border-[#E8D8B8] bg-[#FCF8F1] rounded-sm p-5 space-y-4">
                  <div>
                    <p className="text-[11px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Informations logistiques</p>
                    <p className="text-sm font-sans text-[#7A6355]">Ces informations sont essentielles pour organiser votre accueil dans les meilleures conditions.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="transport_mode" className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5">
                        Mode de transport *
                      </label>
                      <select
                        id="transport_mode"
                        name="transport_mode"
                        value={form.transport_mode}
                        onChange={handleChange}
                        required
                        className="w-full rounded-sm border border-[#D4C4A8] bg-white px-4 py-3 font-sans text-sm text-[#2D1F14] transition-colors duration-200 focus:outline-none focus:border-[#C8912A] focus:ring-1 focus:ring-[#C8912A]/30"
                      >
                        {TRANSPORT_OPTIONS.map((option) => (
                          <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Lieu d’arrivée *"
                      name="arrival_location"
                      value={form.arrival_location}
                      onChange={handleChange}
                      placeholder="Ex. Toulouse Matabiau, Toulouse Blagnac"
                      required
                      className="bg-white"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-sm border border-[#E8D8B8] bg-white px-4 py-3 text-sm font-sans text-[#2D1F14]">
                    <input
                      type="checkbox"
                      name="needs_transfer"
                      checked={form.needs_transfer}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-[#C8A888] text-[#5C3D2E] focus:ring-[#C8912A]"
                    />
                    J’aurai besoin d’une navette ou d’une aide de transfert
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Heure d’arrivée *"
                      name="arrival_time"
                      value={form.arrival_time}
                      onChange={handleChange}
                      placeholder="Ex. 18h00"
                      required
                      className="bg-white"
                    />
                    <Input
                      label="Heure de départ (optionnel)"
                      name="departure_time"
                      value={form.departure_time}
                      onChange={handleChange}
                      placeholder="Ex. 15h30"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="border border-[#E8D8B8] bg-[#FCF8F1] rounded-sm p-5 space-y-4">
                  <div>
                    <p className="text-[11px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Alimentation</p>
                    <p className="text-sm font-sans text-[#7A6355]">Ces informations sont préremplies depuis votre profil si elles sont déjà connues.</p>
                  </div>

                  {profileDefaults && (
                    <div className="rounded-sm border border-[#E8D8B8] bg-white px-4 py-3">
                      <p className="text-xs font-sans uppercase tracking-wider text-[#7A6355] mb-1">Informations déjà enregistrées dans votre profil</p>
                      <p className="text-sm font-sans text-[#5C3D2E]">
                        Régime : {profileDefaults.diet_type ? DIET_OPTIONS.find((option) => option.value === profileDefaults.diet_type)?.label || profileDefaults.diet_type : 'Non renseigné'}
                      </p>
                      <p className="text-sm font-sans text-[#7A6355] mt-1">
                        Vous pouvez ajuster ces informations pour cette réservation si nécessaire.
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="diet_type" className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5">
                      Type de régime
                    </label>
                    <select
                      id="diet_type"
                      name="diet_type"
                      value={form.diet_type}
                      onChange={handleChange}
                      className="w-full rounded-sm border border-[#D4C4A8] bg-white px-4 py-3 font-sans text-sm text-[#2D1F14] transition-colors duration-200 focus:outline-none focus:border-[#C8912A] focus:ring-1 focus:ring-[#C8912A]/30"
                    >
                      {DIET_OPTIONS.map((option) => (
                        <option key={option.value || 'empty'} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Textarea
                      label="Allergies"
                      name="food_allergies"
                      value={form.food_allergies}
                      onChange={handleChange}
                      placeholder="Ex. arachides, fruits à coque..."
                      rows={4}
                      className="bg-white"
                    />
                    <Textarea
                      label="Intolérances"
                      name="food_intolerances"
                      value={form.food_intolerances}
                      onChange={handleChange}
                      placeholder="Ex. gluten, lactose..."
                      rows={4}
                      className="bg-white"
                    />
                  </div>
                </div>

                <Textarea
                  label="Notes logistiques"
                  name="logistics_notes"
                  value={form.logistics_notes}
                  onChange={handleChange}
                  placeholder="Précisions utiles pour votre arrivée, votre départ ou l’organisation sur place..."
                  rows={4}
                  className="bg-[#FAF6EF]"
                />

                <Textarea
                  label="Remarques complémentaires"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Questions, contraintes particulières, précisions utiles..."
                  rows={4}
                  className="bg-[#FAF6EF]"
                />

                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-sm">
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                    <p className="text-sm font-sans text-red-600">{formError}</p>
                  </div>
                )}

                {formSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-[#F0F5EC] border border-[#B8D4A8] rounded-sm">
                    <CheckCircle size={16} className="text-[#4A5E3A] flex-shrink-0" />
                    <p className="text-sm font-sans text-[#4A5E3A]">{formSuccess}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                  <Button type="submit" variant="primary" size="md" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Envoyer ma demande'
                    )}
                  </Button>
                  <p className="text-xs font-sans text-[#7A6355]">
                    Les informations de repas et d’accueil proviennent de votre profil.
                  </p>
                </div>
              </form>
            </div>

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
              </>
            ) : (
              <div className="space-y-4">
                {reservations.map((res) => {
                  const statusConfig = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending
                  const paymentConfig = PAYMENT_CONFIG[res.payment_status] || PAYMENT_CONFIG.free
                  const eventDate = new Date(res.event_date)
                  const isPast = eventDate < new Date()
                  const existingReview = getReservationReview(res)
                  const reviewDraft = reviewDrafts[res.id] || {
                    firstName: profileDefaults?.first_name || '',
                    email: user.email || '',
                    rating: 5,
                    comment: '',
                  }
                  const reviewStatusMessage = reviewMessage[res.id]

                  return (
                    <div
                      key={res.id}
                      className={`bg-white rounded-sm border p-5 flex items-start gap-4 flex-wrap ${isPast ? 'border-[#D4C4A8]/50 opacity-80' : 'border-[#D4C4A8]'}`}
                    >
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

                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h3 className="font-serif text-base text-[#5C3D2E] mb-1">{res.event_title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="inline-flex items-center gap-1 text-xs font-sans px-2 py-0.5 rounded-full"
                              style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
                            >
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                            <span
                              className="text-xs font-sans"
                              style={{ color: paymentConfig.color }}
                            >
                              {paymentConfig.label}
                              {res.amount_cents ? ` (${(res.amount_cents / 100).toFixed(0)} €)` : ''}
                            </span>

                            {existingReview ? (
                              <span
                                className="inline-flex items-center gap-1 text-xs font-sans px-2 py-0.5 rounded-full"
                                style={{
                                  color: existingReview.is_published ? '#065F46' : '#92400E',
                                  backgroundColor: existingReview.is_published ? '#D1FAE5' : '#FEF3C7',
                                }}
                              >
                                {existingReview.is_published ? 'Avis publié' : 'Avis envoyé — en attente'}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="bg-[#FAF6EF] border border-[#D4C4A8]/50 rounded-sm p-4 space-y-2">
                          <p className="text-xs uppercase tracking-wider text-[#7A6355]">
                            Organisation enregistrée
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                            <div>
                              <span className="text-[#7A6355]">Hébergement :</span>{' '}
                              <span className="text-[#2D1F14]">{formatAccommodation(res.accommodation_type)}</span>
                            </div>
                            <div>
                              <span className="text-[#7A6355]">Arrivée :</span>{' '}
                              <span className="text-[#2D1F14]">{res.arrival_time || '—'}</span>
                            </div>
                            <div>
                              <span className="text-[#7A6355]">Départ :</span>{' '}
                              <span className="text-[#2D1F14]">{res.departure_time || '—'}</span>
                            </div>
                            <div>
                              <span className="text-[#7A6355]">Régime enregistré :</span>{' '}
                              <span className="text-[#2D1F14]">{res.diet_type || '—'}</span>
                            </div>
                          </div>
                          {res.notes && (
                            <p className="text-xs font-sans text-[#7A6355] italic">{res.notes}</p>
                          )}
                        </div>

                        {res.status === 'completed' && !existingReview ? (
                          <div className="border border-[#E8D8B8] bg-[#FCF8F1] rounded-sm p-4">
                            {openReviewId === res.id ? (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-[11px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Votre avis</p>
                                  <p className="text-sm font-sans text-[#7A6355]">
                                    Partagez votre ressenti sur cette expérience. Votre avis sera relu avant publication.
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <Input
                                    label="Prénom"
                                    value={reviewDraft.firstName}
                                    onChange={(e) => updateReviewDraft(res.id, { firstName: e.target.value })}
                                    className="bg-white"
                                  />
                                  <Input
                                    label="Email"
                                    type="email"
                                    value={reviewDraft.email}
                                    onChange={(e) => updateReviewDraft(res.id, { email: e.target.value })}
                                    className="bg-white"
                                  />
                                </div>

                                <div>
                                  <p className="block text-sm font-sans font-medium text-[#5C3D2E] mb-2">Votre note</p>
                                  <StarRating
                                    value={reviewDraft.rating}
                                    onChange={(value) => updateReviewDraft(res.id, { rating: value })}
                                  />
                                </div>

                                <Textarea
                                  label="Votre commentaire"
                                  value={reviewDraft.comment}
                                  onChange={(e) => updateReviewDraft(res.id, { comment: e.target.value })}
                                  rows={5}
                                  placeholder="Ce que vous avez vécu, ressenti, ou ce que cette expérience vous a apporté..."
                                  className="bg-white"
                                />

                                {reviewStatusMessage ? (
                                  <div className={`flex items-center gap-2 p-3 rounded-sm border ${
                                    reviewStatusMessage.type === 'success'
                                      ? 'bg-[#F0F5EC] border-[#B8D4A8]'
                                      : 'bg-[#FEF2F2] border-[#FECACA]'
                                  }`}>
                                    {reviewStatusMessage.type === 'success' ? (
                                      <CheckCircle size={16} className="text-[#4A5E3A] flex-shrink-0" />
                                    ) : (
                                      <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                                    )}
                                    <p className={`text-sm font-sans ${
                                      reviewStatusMessage.type === 'success' ? 'text-[#4A5E3A]' : 'text-red-600'
                                    }`}>
                                      {reviewStatusMessage.text}
                                    </p>
                                  </div>
                                ) : null}

                                <div className="flex flex-wrap items-center gap-3">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    disabled={reviewSubmittingFor === res.id}
                                    onClick={() => submitReview(res)}
                                  >
                                    {reviewSubmittingFor === res.id ? (
                                      <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Envoi...
                                      </>
                                    ) : (
                                      'Envoyer mon avis'
                                    )}
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    onClick={() => setOpenReviewId(null)}
                                  >
                                    Annuler
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="font-serif text-base text-[#5C3D2E]">Vous souhaitez partager votre ressenti ?</p>
                                  <p className="text-sm font-sans text-[#7A6355]">
                                    Votre témoignage peut aider d’autres personnes à découvrir cette proposition.
                                  </p>
                                </div>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="md"
                                  onClick={() => openReviewForm(res)}
                                >
                                  Laisser un avis
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>

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
