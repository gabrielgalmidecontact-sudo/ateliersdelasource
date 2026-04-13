'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Download,
  Loader2,
  Save,
  Search,
  Users,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateReservationGroupPdf } from '@/lib/pdf/generateReservationGroupPdf'

type ReservationParticipant = {
  reservation_id: string
  member_id: string
  full_name: string
  email: string
  phone: string | null
  city: string | null
  status: string
  payment_status: string
  notes: string | null
  amount_cents?: number | null
  diet_type: string | null
  food_allergies: string | null
  food_intolerances: string | null
  diet_notes: string | null
  logistics_notes: string | null
  accommodation_type: string | null
  arrival_time: string | null
  departure_time: string | null
  created_at: string
}

type ReservationGroup = {
  group_key: string
  event_slug: string
  event_title: string
  event_date: string
  reservations_count: number
  confirmed_count: number
  pending_count: number
  cancelled_count: number
  completed_count: number
  participants: ReservationParticipant[]
}

type EditableReservation = {
  status: string
  payment_status: string
  amount_eur: string
  notes: string
}

const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

const RESERVATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'completed', label: 'Terminée' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: 'free', label: 'Gratuit' },
  { value: 'pending', label: 'Paiement en attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'refunded', label: 'Remboursé' },
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function formatDietType(value: string | null | undefined) {
  switch (value) {
    case 'omnivore':
      return 'Omnivore'
    case 'vegetarian':
      return 'Végétarien'
    case 'vegan':
      return 'Végan'
    case 'pescatarian':
      return 'Pescétarien'
    case 'no_preference':
      return 'Sans préférence'
    case 'other':
      return 'Autre'
    default:
      return '—'
  }
}

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

function reservationStatusLabel(value: string) {
  return (
    RESERVATION_STATUS_OPTIONS.find((option) => option.value === value)?.label || value || '—'
  )
}

function paymentStatusLabel(value: string) {
  return PAYMENT_STATUS_OPTIONS.find((option) => option.value === value)?.label || value || '—'
}

function getReservationBadgeClass(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-[#D1FAE5] text-[#065F46]'
    case 'pending':
      return 'bg-[#FEF3C7] text-[#92400E]'
    case 'cancelled':
      return 'bg-[#F3F4F6] text-[#6B7280]'
    case 'completed':
      return 'bg-[#F0F5EC] text-[#4A5E3A]'
    default:
      return 'bg-[#F5EDD8] text-[#5C3D2E]'
  }
}

function getPaymentBadgeClass(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-[#D1FAE5] text-[#065F46]'
    case 'pending':
      return 'bg-[#FEF3C7] text-[#92400E]'
    case 'refunded':
      return 'bg-[#F3F4F6] text-[#6B7280]'
    case 'free':
      return 'bg-[#F5EDD8] text-[#5C3D2E]'
    default:
      return 'bg-[#F5EDD8] text-[#5C3D2E]'
  }
}

function toEditable(participant: ReservationParticipant): EditableReservation {
  return {
    status: participant.status || 'pending',
    payment_status: participant.payment_status || 'free',
    amount_eur:
      typeof participant.amount_cents === 'number' && Number.isFinite(participant.amount_cents)
        ? String(participant.amount_cents / 100)
        : '',
    notes: participant.notes || '',
  }
}

export function AdminReservationGroupsPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  const [groups, setGroups] = useState<ReservationGroup[]>([])
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)

  const [editState, setEditState] = useState<Record<string, EditableReservation>>({})
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [successIds, setSuccessIds] = useState<Record<string, boolean>>({})
  const [errorIds, setErrorIds] = useState<Record<string, string>>({})

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const loadGroups = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const query = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''
      const res = await fetch(`/api/admin/reservation-groups${query}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        const nextGroups = (data.groups || []) as ReservationGroup[]
        setGroups(nextGroups)

        if (nextGroups.length > 0) {
          setSelectedKey((current) =>
            current && nextGroups.some((g) => g.group_key === current) ? current : nextGroups[0].group_key
          )
        } else {
          setSelectedKey('')
        }

        const nextEditState: Record<string, EditableReservation> = {}
        for (const group of nextGroups) {
          for (const participant of group.participants) {
            nextEditState[participant.reservation_id] = toEditable(participant)
          }
        }
        setEditState(nextEditState)
      }
    } finally {
      setLoading(false)
    }
  }, [user, search])

  useEffect(() => {
    if (user && isAdmin) loadGroups()
  }, [user, isAdmin, loadGroups])

  const selectedGroup = useMemo(
    () => groups.find((group) => group.group_key === selectedKey) || null,
    [groups, selectedKey]
  )

  async function handleDownloadPdf() {
    if (!selectedGroup || pdfLoading) return
    try {
      setPdfLoading(true)
      await generateReservationGroupPdf(selectedGroup)
    } finally {
      setPdfLoading(false)
    }
  }

  function updateParticipantField(
    reservationId: string,
    field: keyof EditableReservation,
    value: string
  ) {
    setEditState((prev) => ({
      ...prev,
      [reservationId]: {
        ...(prev[reservationId] || {
          status: 'pending',
          payment_status: 'free',
          amount_eur: '',
          notes: '',
        }),
        [field]: value,
      },
    }))
    setErrorIds((prev) => ({ ...prev, [reservationId]: '' }))
    setSuccessIds((prev) => ({ ...prev, [reservationId]: false }))
  }

  async function saveReservation(reservationId: string) {
    if (!user) return

    const draft = editState[reservationId]
    if (!draft) return

    setSavingIds((prev) => ({ ...prev, [reservationId]: true }))
    setErrorIds((prev) => ({ ...prev, [reservationId]: '' }))
    setSuccessIds((prev) => ({ ...prev, [reservationId]: false }))

    try {
      const normalizedAmount =
        draft.amount_eur.trim() === ''
          ? null
          : Math.round(Number(draft.amount_eur.replace(',', '.')) * 100)

      if (draft.amount_eur.trim() !== '' && !Number.isFinite(normalizedAmount)) {
        setErrorIds((prev) => ({ ...prev, [reservationId]: 'Montant invalide' }))
        return
      }

      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          status: draft.status,
          payment_status: draft.payment_status,
          amount_cents: normalizedAmount,
          notes: draft.notes,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setErrorIds((prev) => ({
          ...prev,
          [reservationId]: data?.error || 'Impossible de sauvegarder',
        }))
        return
      }

      setSuccessIds((prev) => ({ ...prev, [reservationId]: true }))
      await loadGroups()

      setTimeout(() => {
        setSuccessIds((prev) => ({ ...prev, [reservationId]: false }))
      }, 2500)
    } catch {
      setErrorIds((prev) => ({
        ...prev,
        [reservationId]: 'Erreur de connexion',
      }))
    } finally {
      setSavingIds((prev) => ({ ...prev, [reservationId]: false }))
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
    <div className="min-h-screen bg-[#FAF6EF]">
      <div className="bg-[#3B2315] border-b border-[#5C3D2E]">
        <Container>
          <div className="flex items-center gap-3 py-4 flex-wrap">
            <Link href="/admin" className="text-[#C8A888] hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <Link href="/" className="font-serif text-lg text-[#F5EDD8] hover:text-[#C8912A] transition-colors">
              Les Ateliers de la Source
            </Link>
            <span className="text-[#7A6355]">/</span>
            <Link href="/admin" className="text-sm font-sans text-[#C8A888] hover:text-white transition-colors">
              Admin
            </Link>
            <span className="text-[#7A6355]">/</span>
            <span className="text-sm font-sans text-white">Événements & inscriptions</span>
          </div>
        </Container>
      </div>

      <div className="py-10">
        <Container>
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">
                  Organisation
                </p>
                <h1 className="font-serif text-3xl text-[#5C3D2E]">Groupes de réservation</h1>
                <p className="text-sm font-sans text-[#7A6355] mt-1">
                  Vue simple des groupes formés automatiquement par stage et par date.
                </p>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6355]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un stage, une date, un membre…"
                  className="pl-9 pr-4 py-2 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-white focus:outline-none focus:border-[#C8912A] w-[320px] max-w-full"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
                <Calendar size={40} className="text-[#D4C4A8] mx-auto mb-4" />
                <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">Aucun groupe pour le moment</h2>
                <p className="text-sm font-sans text-[#7A6355]">
                  Les groupes apparaîtront ici dès qu’au moins une réservation sera enregistrée.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
                <div className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#F0E8DA]">
                    <h2 className="font-serif text-lg text-[#5C3D2E]">Groupes détectés</h2>
                  </div>

                  <div className="divide-y divide-[#F0E8DA]">
                    {groups.map((group) => {
                      const active = group.group_key === selectedKey
                      return (
                        <button
                          key={group.group_key}
                          onClick={() => setSelectedKey(group.group_key)}
                          className={`w-full text-left px-5 py-4 transition-colors ${
                            active ? 'bg-[#FAF6EF]' : 'bg-white hover:bg-[#FCFAF5]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={`font-serif text-lg ${active ? 'text-[#C8912A]' : 'text-[#5C3D2E]'}`}>
                                {group.event_title}
                              </p>
                              <p className="text-xs font-sans text-[#7A6355] mt-1">
                                {formatDate(group.event_date)}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                <span className="inline-flex items-center gap-1 text-xs font-sans px-2 py-0.5 rounded-full bg-[#F5EDD8] text-[#5C3D2E]">
                                  <Users size={12} />
                                  {group.reservations_count} inscrit{group.reservations_count > 1 ? 's' : ''}
                                </span>
                                {group.pending_count > 0 && (
                                  <span className="text-xs font-sans text-[#92400E]">
                                    {group.pending_count} en attente
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={16} className={active ? 'text-[#C8912A]' : 'text-[#D4C4A8]'} />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedGroup && (
                    <>
                      <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">
                              Groupe formé
                            </p>
                            <h2 className="font-serif text-2xl text-[#5C3D2E]">
                              {selectedGroup.event_title}
                            </h2>
                            <p className="text-sm font-sans text-[#7A6355] mt-1">
                              {formatDate(selectedGroup.event_date)} · slug : {selectedGroup.event_slug}
                            </p>
                          </div>

                          <Button variant="outline" size="sm" disabled={pdfLoading} onClick={handleDownloadPdf}>
                            {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            {pdfLoading ? 'Génération...' : 'Télécharger le PDF groupe'}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                          {[
                            { label: 'Inscrits', value: selectedGroup.reservations_count },
                            { label: 'Confirmés', value: selectedGroup.confirmed_count },
                            { label: 'En attente', value: selectedGroup.pending_count },
                            {
                              label: 'Terminés / annulés',
                              value: selectedGroup.completed_count + selectedGroup.cancelled_count,
                            },
                          ].map((item) => (
                            <div key={item.label} className="bg-[#FAF6EF] border border-[#E8D8B8] rounded-sm p-4">
                              <div className="font-serif text-2xl text-[#5C3D2E]">{item.value}</div>
                              <div className="text-xs font-sans text-[#7A6355] mt-1">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#F0E8DA]">
                          <h3 className="font-serif text-lg text-[#5C3D2E]">Participants</h3>
                        </div>

                        <div className="divide-y divide-[#F0E8DA]">
                          {selectedGroup.participants.map((participant) => {
                            const draft = editState[participant.reservation_id] || toEditable(participant)
                            const isSaving = !!savingIds[participant.reservation_id]
                            const saveError = errorIds[participant.reservation_id]
                            const saveSuccess = !!successIds[participant.reservation_id]

                            return (
                              <div key={participant.reservation_id} className="px-5 py-5">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                  <div>
                                    <p className="font-serif text-lg text-[#5C3D2E]">{participant.full_name}</p>
                                    <p className="text-sm font-sans text-[#7A6355]">{participant.email}</p>
                                    <div className="flex items-center gap-2 flex-wrap mt-2">
                                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-sans ${getReservationBadgeClass(draft.status)}`}>
                                        {reservationStatusLabel(draft.status)}
                                      </span>
                                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-sans ${getPaymentBadgeClass(draft.payment_status)}`}>
                                        {paymentStatusLabel(draft.payment_status)}
                                      </span>
                                    </div>
                                    {participant.phone && (
                                      <p className="text-xs font-sans text-[#7A6355] mt-2">{participant.phone}</p>
                                    )}
                                  </div>

                                  <Link
                                    href={`/admin/membres/${participant.member_id}`}
                                    className="text-sm font-sans text-[#C8912A] hover:underline"
                                  >
                                    Voir la fiche membre
                                  </Link>
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-sans">
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-1">Régime</p>
                                    <p className="text-[#2D1F14]">{formatDietType(participant.diet_type)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-1">Allergies</p>
                                    <p className="text-[#2D1F14]">{participant.food_allergies || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-1">Intolérances</p>
                                    <p className="text-[#2D1F14]">{participant.food_intolerances || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-1">Hébergement</p>
                                    <p className="text-[#2D1F14]">{formatAccommodation(participant.accommodation_type)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-1">Arrivée</p>
                                    <p className="text-[#2D1F14]">{participant.arrival_time || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-[#7A6355] mb-1">Départ</p>
                                    <p className="text-[#2D1F14]">{participant.departure_time || '—'}</p>
                                  </div>
                                </div>

                                {(participant.diet_notes || participant.logistics_notes || participant.notes) && (
                                  <div className="mt-4 bg-[#FAF6EF] border border-[#E8D8B8] rounded-sm p-4 space-y-2">
                                    {participant.diet_notes && (
                                      <p className="text-sm font-sans text-[#5C3D2E]">
                                        <span className="text-[#7A6355]">Précisions alimentaires :</span> {participant.diet_notes}
                                      </p>
                                    )}
                                    {participant.logistics_notes && (
                                      <p className="text-sm font-sans text-[#5C3D2E]">
                                        <span className="text-[#7A6355]">Logistique :</span> {participant.logistics_notes}
                                      </p>
                                    )}
                                    {participant.notes && (
                                      <p className="text-sm font-sans text-[#5C3D2E]">
                                        <span className="text-[#7A6355]">Remarque réservation :</span> {participant.notes}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="mt-5 pt-5 border-t border-[#F0E8DA]">
                                  <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-3">
                                    Pilotage admin
                                  </p>

                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                    <div>
                                      <label
                                        htmlFor={`status-${participant.reservation_id}`}
                                        className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5"
                                      >
                                        Statut réservation
                                      </label>
                                      <select
                                        id={`status-${participant.reservation_id}`}
                                        value={draft.status}
                                        onChange={(e) =>
                                          updateParticipantField(participant.reservation_id, 'status', e.target.value)
                                        }
                                        className="w-full rounded-sm border border-[#D4C4A8] bg-[#FAF6EF] px-4 py-3 font-sans text-sm text-[#2D1F14] focus:outline-none focus:border-[#C8912A] focus:ring-1 focus:ring-[#C8912A]/30"
                                      >
                                        {RESERVATION_STATUS_OPTIONS.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label
                                        htmlFor={`payment-${participant.reservation_id}`}
                                        className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5"
                                      >
                                        Statut paiement
                                      </label>
                                      <select
                                        id={`payment-${participant.reservation_id}`}
                                        value={draft.payment_status}
                                        onChange={(e) =>
                                          updateParticipantField(
                                            participant.reservation_id,
                                            'payment_status',
                                            e.target.value
                                          )
                                        }
                                        className="w-full rounded-sm border border-[#D4C4A8] bg-[#FAF6EF] px-4 py-3 font-sans text-sm text-[#2D1F14] focus:outline-none focus:border-[#C8912A] focus:ring-1 focus:ring-[#C8912A]/30"
                                      >
                                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <Input
                                      label="Montant (€)"
                                      type="text"
                                      value={draft.amount_eur}
                                      onChange={(e) =>
                                        updateParticipantField(
                                          participant.reservation_id,
                                          'amount_eur',
                                          e.target.value
                                        )
                                      }
                                      placeholder="Ex. 180"
                                      className="bg-[#FAF6EF]"
                                    />

                                    <Input
                                      label="Note admin / réservation"
                                      type="text"
                                      value={draft.notes}
                                      onChange={(e) =>
                                        updateParticipantField(participant.reservation_id, 'notes', e.target.value)
                                      }
                                      placeholder="Note interne ou réservation"
                                      className="bg-[#FAF6EF]"
                                    />
                                  </div>

                                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                                    <Button
                                      type="button"
                                      variant="primary"
                                      size="sm"
                                      onClick={() => saveReservation(participant.reservation_id)}
                                      disabled={isSaving}
                                    >
                                      {isSaving ? (
                                        <>
                                          <Loader2 size={14} className="animate-spin" />
                                          Enregistrement...
                                        </>
                                      ) : (
                                        <>
                                          <Save size={14} />
                                          Enregistrer
                                        </>
                                      )}
                                    </Button>

                                    {saveSuccess && (
                                      <span className="inline-flex items-center gap-1 text-sm font-sans text-[#4A5E3A]">
                                        <CheckCircle size={14} />
                                        Sauvegardé
                                      </span>
                                    )}

                                    {saveError && (
                                      <span className="text-sm font-sans text-red-600">{saveError}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  )
}
