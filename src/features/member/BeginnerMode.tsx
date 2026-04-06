'use client'
// src/features/member/BeginnerMode.tsx
// Panneau "Mode débutant" — aide contextuelle premium pour les membres

import { useState } from 'react'
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react'

interface HelpItem {
  icon: string
  title: string
  description: string
}

interface BeginnerModeProps {
  context: 'member-dashboard' | 'member-journal' | 'member-suivi' | 'member-profil'
}

const HELP_CONTENT: Record<BeginnerModeProps['context'], { title: string; intro: string; items: HelpItem[] }> = {
  'member-dashboard': {
    title: 'Bienvenue dans votre Livre de Bord',
    intro: 'Votre espace personnel centralise tout votre chemin de transformation. Voici comment le lire et le nourrir.',
    items: [
      {
        icon: '👤',
        title: 'Votre dossier personnel (gauche)',
        description: 'Retrouvez vos informations, votre motivation et votre objectif. Cliquez sur "Paramètres du profil" pour les compléter.',
      },
      {
        icon: '📊',
        title: 'Vos indicateurs de progression',
        description: 'Les cercles et les barres se calculent automatiquement à partir de vos stages et de vos notes. Plus vous participez, plus ils évoluent.',
      },
      {
        icon: '📖',
        title: 'Mon parcours — la timeline',
        description: 'Chaque expérience (stage, atelier, formation) apparaît ici dans l\'ordre chronologique. Cliquez sur "Voir tout" pour accéder à vos fiches détaillées.',
      },
      {
        icon: '✦',
        title: 'Journal libre',
        description: 'Notez vos pensées, intuitions et prises de conscience du quotidien, hors stage. Accessible depuis le bouton Journal.',
      },
      {
        icon: '📤',
        title: 'Exporter mon journal (bientôt)',
        description: 'Dans une prochaine version, vous pourrez télécharger votre livre de bord complet en PDF pour garder une trace physique de votre évolution.',
      },
    ],
  },
  'member-journal': {
    title: 'Votre journal de transformation',
    intro: 'Cet espace est votre carnet intime, libre et sans contrainte. Notez ce qui vous traverse.',
    items: [
      {
        icon: '✍️',
        title: 'Écrire une nouvelle note',
        description: 'Cliquez sur "Écrire une nouvelle note…" pour ouvrir l\'éditeur. Écrivez librement, sans format imposé.',
      },
      {
        icon: '💾',
        title: 'Enregistrer',
        description: 'Cliquez sur "Enregistrer" ou appuyez sur ⌘+Entrée (Mac) / Ctrl+Entrée (PC) pour sauvegarder.',
      },
      {
        icon: '🗑️',
        title: 'Supprimer une note',
        description: 'Survolez une note avec votre souris, une icône de suppression apparaît. Confirmez la suppression en cliquant "Supprimer".',
      },
      {
        icon: '🔒',
        title: 'Confidentialité',
        description: 'Vos notes de journal libre sont strictement privées. Seul vous pouvez les lire.',
      },
    ],
  },
  'member-suivi': {
    title: 'Vos fiches d\'expériences',
    intro: 'Chaque stage ou atelier auquel vous participez génère une fiche. Vous pouvez la compléter à votre rythme.',
    items: [
      {
        icon: '📋',
        title: 'Ouvrir une fiche',
        description: 'Cliquez sur une fiche pour la déplier et accéder à son contenu détaillé.',
      },
      {
        icon: '🎯',
        title: 'Avant le stage — mon intention',
        description: 'Notez ce que vous espérez vivre ou découvrir avant de commencer. Cliquez dans la zone de texte pour modifier.',
      },
      {
        icon: '💡',
        title: 'Après — réflexion et insight',
        description: 'Après le stage, notez votre vécu, ce qui a changé en vous, et votre prise de conscience principale.',
      },
      {
        icon: '⭐',
        title: 'Auto-évaluation',
        description: 'Notez votre expérience de 1 à 5 étoiles. Cette note alimente vos indicateurs de progression.',
      },
      {
        icon: '📝',
        title: 'Notes personnelles',
        description: 'Ajoutez des notes libres liées à ce stage spécifique (impressions, questions, découvertes).',
      },
    ],
  },
  'member-profil': {
    title: 'Votre profil — identité et intention',
    intro: 'Un profil complété permet à Gabriel de mieux vous accompagner et enrichit votre livre de bord.',
    items: [
      {
        icon: '👤',
        title: 'Prénom et nom',
        description: 'Votre prénom apparaîtra sur votre tableau de bord pour personnaliser votre expérience.',
      },
      {
        icon: '🎯',
        title: 'Ma motivation',
        description: 'Exprimez pourquoi vous rejoignez les Ateliers de la Source. Gabriel la lira pour adapter son accompagnement.',
      },
      {
        icon: '📖',
        title: 'À propos de moi',
        description: 'Quelques mots sur vous, votre démarche, ce qui vous anime. Cela nourrit votre livre de bord.',
      },
      {
        icon: '🔒',
        title: 'Confidentialité',
        description: 'Vos informations sont partagées uniquement avec les formateurs (Gabriel et Amélie). Jamais rendues publiques.',
      },
    ],
  },
}

export function BeginnerMode({ context }: BeginnerModeProps) {
  const [open, setOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)
  const content = HELP_CONTENT[context]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-xs font-sans transition-colors px-3 py-1.5 rounded-sm border ${
          open
            ? 'bg-[#FFF8E8] border-[#E0B060] text-[#C8912A]'
            : 'bg-white border-[#D4C4A8] text-[#7A6355] hover:border-[#C8912A] hover:text-[#C8912A]'
        }`}
        aria-label={open ? 'Fermer le mode débutant' : 'Ouvrir le mode débutant'}
        aria-expanded={open}
      >
        <HelpCircle size={13} />
        <span>Mode débutant</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 bg-white border border-[#D4C4A8] rounded-sm shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#3B2315] px-4 py-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-0.5">Aide</p>
              <h3 className="font-serif text-base text-[#F5EDD8] leading-snug">{content.title}</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[#C8A888] hover:text-white transition-colors flex-shrink-0 mt-0.5"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Intro */}
          <div className="px-4 py-3 bg-[#FAF6EF] border-b border-[#E8D8B8]">
            <p className="text-xs font-sans text-[#5C3D2E] leading-relaxed">{content.intro}</p>
          </div>

          {/* Items */}
          <div className="divide-y divide-[#F0E8DA] max-h-80 overflow-y-auto">
            {content.items.map((item, i) => (
              <div key={i}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAF6EF] transition-colors"
                  onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                >
                  <span className="text-base flex-shrink-0" role="img" aria-hidden="true">{item.icon}</span>
                  <span className="text-sm font-sans font-medium text-[#5C3D2E] flex-1 leading-snug">{item.title}</span>
                  {expandedItem === i
                    ? <ChevronUp size={13} className="text-[#7A6355] flex-shrink-0" />
                    : <ChevronDown size={13} className="text-[#7A6355] flex-shrink-0" />}
                </button>
                {expandedItem === i && (
                  <div className="px-4 pb-3 pt-0">
                    <p className="text-xs font-sans text-[#7A6355] leading-relaxed pl-7">{item.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-[#F5EDD8] border-t border-[#E8D8B8]">
            <p className="text-[11px] font-sans text-[#7A6355]">
              Des questions ? Écrivez à Gabriel via la page{' '}
              <a href="/contact" className="text-[#C8912A] hover:underline">Contact</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
