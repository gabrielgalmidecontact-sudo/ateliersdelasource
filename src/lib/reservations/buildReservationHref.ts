export type ReservationHrefInput = {
  eventTitle?: string | null
  eventSlug?: string | null
  eventType?: string | null
  eventDate?: string | null
}

function normalizeDate(value?: string | null) {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function buildReservationHref(input: ReservationHrefInput) {
  const params = new URLSearchParams()

  if (input.eventTitle?.trim()) params.set('event_title', input.eventTitle.trim())
  if (input.eventSlug?.trim()) params.set('event_slug', input.eventSlug.trim())
  if (input.eventType?.trim()) params.set('event_type', input.eventType.trim())

  const normalizedDate = normalizeDate(input.eventDate)
  if (normalizedDate) params.set('event_date', normalizedDate)

  const query = params.toString()
  return query ? `/espace-membre/reservations?${query}` : '/espace-membre/reservations'
}
