// src/lib/pdf/generateReservationGroupPdf.ts
import type { jsPDF } from 'jspdf'

export type ReservationGroupParticipant = {
  reservation_id: string
  member_id: string
  full_name: string
  email: string
  phone: string | null
  city: string | null
  status: string
  payment_status: string
  notes: string | null
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

export type ReservationGroupPdfData = {
  group_key: string
  event_slug: string
  event_title: string
  event_date: string
  reservations_count: number
  confirmed_count: number
  pending_count: number
  cancelled_count: number
  completed_count: number
  participants: ReservationGroupParticipant[]
}

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function slugifyFilePart(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '')
  return [
    parseInt(cleaned.slice(0, 2), 16),
    parseInt(cleaned.slice(2, 4), 16),
    parseInt(cleaned.slice(4, 6), 16),
  ]
}

export async function generateReservationGroupPdf(data: ReservationGroupPdfData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc: jsPDF = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const MARGIN = 16
  const CONTENT_W = W - MARGIN * 2

  const COLORS = {
    brown: '#3B2315',
    midBrown: '#5C3D2E',
    lightBrown: '#7A6355',
    gold: '#C8912A',
    cream: '#FAF6EF',
    creamDark: '#F5EDD8',
    border: '#D4C4A8',
    green: '#4A5E3A',
    softGreen: '#F0F5EC',
    softGold: '#FFF8E8',
    softGray: '#F5F5F5',
    text: '#2D1F14',
  }

  let y = MARGIN

  function setText(hex: string) {
    doc.setTextColor(...hexToRgb(hex))
  }

  function setFill(hex: string) {
    doc.setFillColor(...hexToRgb(hex))
  }

  function setDraw(hex: string) {
    doc.setDrawColor(...hexToRgb(hex))
  }

  function footer() {
    setText('#C8A888')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Les Ateliers de la Source — Groupe de réservation', MARGIN, H - 7)
    doc.text(`Page ${doc.getNumberOfPages()}`, W - MARGIN, H - 7, { align: 'right' })
  }

  function addPage() {
    footer()
    doc.addPage()
    y = MARGIN
  }

  function checkPageBreak(needed: number) {
    if (y + needed > H - 18) {
      addPage()
    }
  }

  function labelValueBlock(
    x: number,
    top: number,
    width: number,
    label: string,
    value: string,
    fill = COLORS.cream
  ) {
    setFill(fill)
    setDraw(COLORS.border)
    doc.roundedRect(x, top, width, 18, 1, 1, 'FD')

    setText(COLORS.lightBrown)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(label.toUpperCase(), x + 4, top + 6)

    setText(COLORS.midBrown)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(String(value), x + 4, top + 13)
  }

  function multiLineText(
    text: string,
    x: number,
    top: number,
    maxWidth: number,
    fontSize = 9,
    color = COLORS.text,
    style: 'normal' | 'bold' | 'italic' = 'normal',
    maxLines = 20
  ) {
    setText(color)
    doc.setFont('helvetica', style)
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text || '—', maxWidth)
    const clipped = lines.slice(0, maxLines)
    doc.text(clipped, x, top)
    return clipped.length
  }

  // Page de garde
  setFill(COLORS.brown)
  doc.rect(0, 0, W, H, 'F')

  setDraw(COLORS.gold)
  doc.setLineWidth(0.6)
  doc.line(MARGIN, 34, W - MARGIN, 34)

  setText(COLORS.gold)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('LES ATELIERS DE LA SOURCE', W / 2, 26, { align: 'center' })

  setText('#F5EDD8')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('Groupe de réservation', W / 2, 80, { align: 'center' })

  setText(COLORS.gold)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(data.event_title, W / 2, 96, { align: 'center', maxWidth: CONTENT_W })

  setText('#C8A888')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(formatDate(data.event_date), W / 2, 108, { align: 'center' })
  doc.text(`Slug : ${data.event_slug}`, W / 2, 116, { align: 'center' })

  setDraw(COLORS.gold)
  doc.line(MARGIN, 128, W - MARGIN, 128)

  setText('#C8A888')
  doc.setFontSize(9)
  doc.text(`Exporté le ${formatDate(new Date().toISOString())}`, W / 2, H - 20, { align: 'center' })

  // Nouvelle page
  addPage()

  // Entête
  setText(COLORS.gold)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('SYNTHÈSE DU GROUPE', MARGIN, y)
  y += 8

  setText(COLORS.midBrown)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(data.event_title, MARGIN, y)
  y += 8

  setText(COLORS.lightBrown)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`${formatDate(data.event_date)} · ${data.event_slug}`, MARGIN, y)
  y += 10

  // Stats
  const statW = (CONTENT_W - 9) / 4
  labelValueBlock(MARGIN, y, statW, 'Inscrits', String(data.reservations_count))
  labelValueBlock(MARGIN + statW + 3, y, statW, 'Confirmés', String(data.confirmed_count))
  labelValueBlock(MARGIN + (statW + 3) * 2, y, statW, 'En attente', String(data.pending_count), COLORS.softGold)
  labelValueBlock(MARGIN + (statW + 3) * 3, y, statW, 'Terminés / annulés', String(data.completed_count + data.cancelled_count), COLORS.softGray)
  y += 26

  // Liste participants
  setText(COLORS.gold)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('PARTICIPANTS', MARGIN, y)
  y += 8

  data.participants.forEach((participant, index) => {
    const notesParts = [
      participant.diet_notes ? `Précisions alimentaires : ${participant.diet_notes}` : '',
      participant.logistics_notes ? `Logistique : ${participant.logistics_notes}` : '',
      participant.notes ? `Remarque réservation : ${participant.notes}` : '',
    ].filter(Boolean)

    const notesText = notesParts.join('\n')
    const noteLines = notesText ? doc.splitTextToSize(notesText, CONTENT_W - 16) : []
    const noteBlockHeight = noteLines.length > 0 ? Math.max(14, noteLines.length * 4.5 + 6) : 0
    const cardHeight = 44 + noteBlockHeight

    checkPageBreak(cardHeight + 6)

    setFill(index % 2 === 0 ? '#FFFFFF' : COLORS.cream)
    setDraw(COLORS.border)
    doc.roundedRect(MARGIN, y, CONTENT_W, cardHeight, 1, 1, 'FD')

    setText(COLORS.midBrown)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text(participant.full_name, MARGIN + 5, y + 8)

    setText(COLORS.lightBrown)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(participant.email || '—', MARGIN + 5, y + 14)

    if (participant.phone) {
      doc.text(participant.phone, MARGIN + 5, y + 20)
    }
    if (participant.city) {
      doc.text(participant.city, MARGIN + 60, y + 20)
    }

    const col1 = MARGIN + 5
    const col2 = MARGIN + 62
    const col3 = MARGIN + 119
    const top = y + 28

    setText(COLORS.lightBrown)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)

    doc.text('RÉGIME', col1, top)
    doc.text('ALLERGIES', col2, top)
    doc.text('INTOLÉRANCES', col3, top)

    setText(COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(formatDietType(participant.diet_type), col1, top + 6)
    doc.text(participant.food_allergies || '—', col2, top + 6)
    doc.text(participant.food_intolerances || '—', col3, top + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setText(COLORS.lightBrown)
    doc.text('HÉBERGEMENT', col1, top + 14)
    doc.text('ARRIVÉE', col2, top + 14)
    doc.text('DÉPART', col3, top + 14)

    setText(COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(formatAccommodation(participant.accommodation_type), col1, top + 20)
    doc.text(participant.arrival_time || '—', col2, top + 20)
    doc.text(participant.departure_time || '—', col3, top + 20)

    if (noteLines.length > 0) {
      const boxY = y + 44
      setFill(COLORS.creamDark)
      setDraw(COLORS.border)
      doc.roundedRect(MARGIN + 5, boxY, CONTENT_W - 10, noteBlockHeight, 1, 1, 'FD')
      multiLineText(notesText, MARGIN + 9, boxY + 6, CONTENT_W - 18, 8.5, COLORS.midBrown, 'normal', 10)
    }

    y += cardHeight + 6
  })

  footer()

  const fileName = `groupe-reservation-${slugifyFilePart(data.event_title)}-${data.event_date}.pdf`
  doc.save(fileName)
}
