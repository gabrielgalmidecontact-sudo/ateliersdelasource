// src/lib/pdf/generateBookPdf.ts
// Génération du PDF "Mon Livre de Bord" côté client avec jsPDF
// Appelé depuis le dashboard membre après récupération des données via /api/member/pdf-export

import type { Profile, StageLog, TrainerNote, MemberCompetency, GlobalNote } from '@/lib/supabase/types'

export interface BookData {
  profile: Profile
  stages: (StageLog & { member_notes?: { title: string; content: string }[] })[]
  trainerNotes: TrainerNote[]
  competencies: (MemberCompetency & { competency?: { name: string; icon?: string | null } })[]
  journalNotes: GlobalNote[]
  exportedAt: string
}

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
]

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function truncate(str: string, max: number): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

export async function generateBookPdf(data: BookData): Promise<void> {
  // Import dynamique pour éviter les erreurs SSR
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const MARGIN = 20
  const COL = W - MARGIN * 2

  // Couleurs brand
  const BROWN = '#3B2315'
  const GOLD = '#C8912A'
  const CREAM = '#FAF6EF'
  const MID_BROWN = '#5C3D2E'
  const LIGHT_BROWN = '#7A6355'
  const GREEN = '#4A5E3A'

  let y = MARGIN

  function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
  }

  function setFill(hex: string) {
    doc.setFillColor(...hexToRgb(hex))
  }
  function setDraw(hex: string) {
    doc.setDrawColor(...hexToRgb(hex))
  }
  function setTxt(hex: string) {
    doc.setTextColor(...hexToRgb(hex))
  }

  function addPage() {
    doc.addPage()
    y = MARGIN
    // Pied de page
    setTxt('#C8A888')
    doc.setFontSize(8)
    doc.text('Les Ateliers de la Source — Mon Livre de Bord', MARGIN, H - 8)
    doc.text(`Page ${doc.getNumberOfPages()}`, W - MARGIN, H - 8, { align: 'right' })
    y = MARGIN
  }

  function checkPageBreak(needed: number) {
    if (y + needed > H - 20) { addPage() }
  }

  // ── PAGE DE GARDE ──────────────────────────────────────────────
  setFill(BROWN)
  doc.rect(0, 0, W, H, 'F')

  // Trait décoratif doré
  setDraw(GOLD)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, MARGIN + 30, W - MARGIN, MARGIN + 30)

  setTxt(GOLD)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('LES ATELIERS DE LA SOURCE', W / 2, MARGIN + 22, { align: 'center' })

  setTxt('#F5EDD8')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text('Mon Livre de Bord', W / 2, H / 2 - 15, { align: 'center' })

  setTxt(GOLD)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  const memberName = [data.profile.first_name, data.profile.last_name].filter(Boolean).join(' ') || data.profile.email
  doc.text(memberName, W / 2, H / 2 + 5, { align: 'center' })

  setTxt('#C8A888')
  doc.setFontSize(9)
  const since = `Membre depuis ${new Date(data.profile.created_at).getFullYear()}`
  doc.text(since, W / 2, H / 2 + 18, { align: 'center' })

  setDraw(GOLD)
  doc.line(MARGIN, H / 2 + 28, W - MARGIN, H / 2 + 28)

  setTxt('#C8A888')
  doc.setFontSize(8)
  doc.text(`Exporté le ${formatDate(data.exportedAt)}`, W / 2, H - 20, { align: 'center' })

  // ── SECTION PROFIL ─────────────────────────────────────────────
  addPage()

  setTxt(GOLD)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('PROFIL', MARGIN, y)
  y += 8

  setTxt(MID_BROWN)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(memberName, MARGIN, y)
  y += 8

  setTxt(LIGHT_BROWN)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(data.profile.email, MARGIN, y)
  y += 5

  if (data.profile.city) {
    doc.text(`📍 ${data.profile.city}`, MARGIN, y)
    y += 5
  }
  if (data.profile.phone) {
    doc.text(`Tél : ${data.profile.phone}`, MARGIN, y)
    y += 5
  }
  y += 4

  if (data.profile.motivation) {
    setFill('#FFF8E8')
    doc.roundedRect(MARGIN, y, COL, 18, 2, 2, 'F')
    setTxt(GOLD)
    doc.setFontSize(7)
    doc.text('MON INTENTION', MARGIN + 4, y + 5)
    setTxt(MID_BROWN)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(`"${data.profile.motivation}"`, COL - 8)
    doc.text(lines.slice(0, 2), MARGIN + 4, y + 10)
    y += 22
    doc.setFont('helvetica', 'normal')
  }

  if (data.profile.bio) {
    checkPageBreak(20)
    setTxt(LIGHT_BROWN)
    doc.setFontSize(7)
    doc.text('BIO', MARGIN, y + 4)
    y += 7
    setTxt('#2D1F14')
    doc.setFontSize(9)
    const bioLines = doc.splitTextToSize(data.profile.bio, COL)
    doc.text(bioLines.slice(0, 4), MARGIN, y)
    y += Math.min(bioLines.length, 4) * 5 + 4
  }

  // Stats rapides
  checkPageBreak(25)
  y += 6
  const statsData = [
    { label: 'Expériences', value: String(data.stages.length) },
    { label: 'Compétences', value: String(data.competencies.length) },
    { label: 'Notes', value: String(data.journalNotes.length) },
    { label: 'Guidances visibles', value: String(data.trainerNotes.filter(n => n.is_visible_to_member).length) },
  ]
  const blockW = COL / 4
  statsData.forEach((s, i) => {
    const bx = MARGIN + i * blockW
    setFill('#F5EDD8')
    doc.roundedRect(bx, y, blockW - 3, 18, 1, 1, 'F')
    setTxt(MID_BROWN)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(s.value, bx + (blockW - 3) / 2, y + 10, { align: 'center' })
    setTxt(LIGHT_BROWN)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(s.label, bx + (blockW - 3) / 2, y + 15.5, { align: 'center' })
  })
  y += 24

  // ── SECTION COMPÉTENCES ───────────────────────────────────────
  if (data.competencies.length > 0) {
    checkPageBreak(30)
    setTxt(GOLD)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('COMPÉTENCES', MARGIN, y)
    y += 8

    data.competencies.forEach(mc => {
      checkPageBreak(14)
      const compName = mc.competency?.name || '—'
      const icon = mc.competency?.icon ? mc.competency.icon + ' ' : ''
      setTxt(MID_BROWN)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(`${icon}${compName}`, MARGIN, y)
      setTxt(LIGHT_BROWN)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(`${mc.level}%${mc.is_validated ? ' ✓ Validée' : ''}`, W - MARGIN, y, { align: 'right' })
      // Barre
      const barW = COL
      setFill('#F0E8DA')
      doc.rect(MARGIN, y + 2, barW, 3, 'F')
      setFill(mc.is_validated ? GREEN : GOLD)
      doc.rect(MARGIN, y + 2, barW * mc.level / 100, 3, 'F')
      y += 10
    })
    y += 4
  }

  // ── SECTION PARCOURS ──────────────────────────────────────────
  if (data.stages.length > 0) {
    checkPageBreak(20)
    setTxt(GOLD)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('PARCOURS', MARGIN, y)
    y += 8

    data.stages.forEach(stage => {
      checkPageBreak(30)
      const statusLabel = stage.status === 'completed' ? 'Effectué' : stage.status === 'upcoming' ? 'À venir' : 'Annulé'
      const statusColor = stage.status === 'completed' ? GREEN : stage.status === 'upcoming' ? GOLD : LIGHT_BROWN

      setFill('#FAF6EF')
      const blockH = stage.reflection_after ? 35 : (stage.key_insight ? 30 : 22)
      checkPageBreak(blockH + 4)
      doc.roundedRect(MARGIN, y, COL, blockH, 1, 1, 'F')

      setTxt(MID_BROWN)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(truncate(stage.stage_title, 55), MARGIN + 4, y + 7)

      setTxt(statusColor)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(statusLabel, W - MARGIN - 4, y + 7, { align: 'right' })

      setTxt(LIGHT_BROWN)
      doc.setFontSize(8)
      doc.text(`${formatDate(stage.stage_date)} · ${stage.trainer}`, MARGIN + 4, y + 12.5)

      if (stage.intention_before) {
        setTxt(GOLD)
        doc.setFontSize(7)
        doc.text('Intention :', MARGIN + 4, y + 18)
        setTxt('#2D1F14')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        const intentLines = doc.splitTextToSize(stage.intention_before, COL - 30)
        doc.text(intentLines.slice(0, 1), MARGIN + 22, y + 18)
        doc.setFont('helvetica', 'normal')
      }

      if (stage.key_insight) {
        const iy = stage.intention_before ? y + 23 : y + 18
        setTxt(GOLD)
        doc.setFontSize(7)
        doc.text('Insight :', MARGIN + 4, iy)
        setTxt(MID_BROWN)
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(8)
        const insLines = doc.splitTextToSize(`« ${stage.key_insight} »`, COL - 26)
        doc.text(insLines.slice(0, 1), MARGIN + 22, iy)
        doc.setFont('helvetica', 'normal')
      }

      y += blockH + 4
    })
  }

  // ── SECTION GUIDANCES VISIBLES ────────────────────────────────
  const visibleGuidances = data.trainerNotes.filter(n => n.is_visible_to_member)
  if (visibleGuidances.length > 0) {
    checkPageBreak(20)
    setTxt(GOLD)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('GUIDANCES DE MON ACCOMPAGNANT', MARGIN, y)
    y += 8

    visibleGuidances.forEach(note => {
      const lines = doc.splitTextToSize(note.content, COL - 8)
      const needed = Math.min(lines.length, 4) * 4.5 + 14
      checkPageBreak(needed)
      setFill('#F5EDD8')
      doc.roundedRect(MARGIN, y, COL, needed, 1, 1, 'F')
      setTxt(MID_BROWN)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(note.trainer_name, MARGIN + 4, y + 6)
      setTxt(LIGHT_BROWN)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(formatDate(note.created_at), W - MARGIN - 4, y + 6, { align: 'right' })
      setTxt('#2D1F14')
      doc.setFontSize(8)
      doc.text(lines.slice(0, 4), MARGIN + 4, y + 11)
      y += needed + 3
    })
  }

  // ── SECTION JOURNAL LIBRE ──────────────────────────────────────
  if (data.journalNotes.length > 0) {
    checkPageBreak(20)
    setTxt(GOLD)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('JOURNAL LIBRE', MARGIN, y)
    y += 8

    data.journalNotes.slice(0, 10).forEach(note => {
      const lines = doc.splitTextToSize(note.content, COL - 8)
      const needed = Math.min(lines.length, 4) * 4.5 + 12
      checkPageBreak(needed)
      setFill('#FAF6EF')
      doc.roundedRect(MARGIN, y, COL, needed, 1, 1, 'F')
      setTxt(LIGHT_BROWN)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(formatDate(note.created_at), MARGIN + 4, y + 5)
      setTxt('#2D1F14')
      doc.setFontSize(8)
      doc.text(lines.slice(0, 4), MARGIN + 4, y + 10)
      y += needed + 3
    })
  }

  // Sauvegarde
  const filename = `livre-de-bord-${memberName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
