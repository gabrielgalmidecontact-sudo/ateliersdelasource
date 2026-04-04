'use client'
// src/features/admin/AdminBeginnerMode.tsx
// Mode débutant admin — guide Gabriel dans son espace d'accompagnement (Phase 2 étendu)

import { useState } from 'react'
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react'

interface HelpItem {
  icon: string
  title: string
  description: string
}

const ADMIN_HELP: { title: string; intro: string; sections: { heading: string; items: HelpItem[] }[] } = {
  title: 'Guide de l\'espace d\'accompagnement',
  intro: 'Votre tableau de bord centralise tous les outils pour suivre vos membres, piloter vos contenus et développer Les Ateliers de la Source.',
  sections: [
    {
      heading: 'Expériences — nouveauté Phase 2',
      items: [
        {
          icon: '🎭',
          title: 'Créer une expérience',
          description: 'Allez dans Admin → Expériences → "Nouvelle expérience". Renseignez le titre, le type (stage, atelier, formation…), les dates et le formateur. Une expérience peut accueillir plusieurs membres.',
        },
        {
          icon: '👤',
          title: 'Assigner un membre à une expérience',
          description: 'Sur la fiche d\'un membre (onglet Parcours), cliquez "Ajouter une expérience" ou utilisez l\'API /api/admin/experiences/[id] avec POST {member_id}. Le membre verra l\'expérience dans sa timeline.',
        },
        {
          icon: '🔗',
          title: 'Lier un questionnaire à une expérience',
          description: 'Dans Admin → Questionnaires, lors de la création, vous pouvez choisir le type de déclenchement : avant, après, bilan. Le membre reçoit le questionnaire au bon moment.',
        },
        {
          icon: '🌱',
          title: 'Compétences liées',
          description: 'Après une expérience, attribuez des compétences au membre depuis sa fiche (onglet Compétences). Un snapshot est automatiquement enregistré pour tracer la progression.',
        },
      ],
    },
    {
      heading: 'Suivi des membres',
      items: [
        {
          icon: '👥',
          title: 'Liste des membres',
          description: 'Accédez à la liste complète en cliquant sur "Membres". Chaque fiche membre vous donne accès à son parcours, ses notes, ses réservations et sa progression.',
        },
        {
          icon: '📝',
          title: 'Ajouter une fiche de suivi (legacy)',
          description: 'Sur la fiche d\'un membre, onglet "Parcours", cliquez "Ajouter une fiche de suivi". Renseignez le titre, la date et le statut. Compatible avec l\'ancien système.',
        },
        {
          icon: '💬',
          title: 'Ajouter une guidance',
          description: 'Sur la fiche d\'un membre, onglet "Guidances", cliquez "Ajouter une guidance". Choisissez le type (observation, encouragement, piste) et rédigez votre message.',
        },
        {
          icon: '👁️',
          title: 'Visibilité des guidances',
          description: 'Lors de l\'ajout d\'une guidance, cochez "Visible par le membre" pour qu\'elle apparaisse dans son espace personnel. Sinon, elle reste privée pour vous.',
        },
        {
          icon: '✏️',
          title: 'Modifier le statut d\'une expérience',
          description: 'Sur la fiche membre, dans l\'onglet Parcours, cliquez directement sur le badge de statut (À venir / Effectué / Annulé) pour le modifier en ligne.',
        },
      ],
    },
    {
      heading: 'Questionnaires',
      items: [
        {
          icon: '📋',
          title: 'Créer un questionnaire',
          description: 'Admin → Questionnaires → "Nouveau questionnaire". Donnez-lui un titre, une description optionnelle, et ajoutez vos questions (texte libre, note, choix multiple, oui/non).',
        },
        {
          icon: '📊',
          title: 'Voir les réponses',
          description: 'Sur la page des questionnaires, cliquez "Réponses" à côté d\'un questionnaire pour voir toutes les soumissions des membres, avec les réponses détaillées.',
        },
        {
          icon: '🔀',
          title: 'Types de questions',
          description: 'Texte libre : réponse ouverte. Note : curseur 1-10. Choix multiple : options prédéfinies. Oui/Non : réponse binaire. Combinez-les pour un questionnaire riche.',
        },
      ],
    },
    {
      heading: 'Compétences',
      items: [
        {
          icon: '🌟',
          title: 'Référentiel de compétences',
          description: 'Admin → Compétences. Créez votre référentiel : chaque compétence a un nom, une catégorie et un icône emoji. C\'est votre vocabulaire pédagogique.',
        },
        {
          icon: '📈',
          title: 'Attribuer et valider',
          description: 'Sur la fiche d\'un membre, onglet "Compétences" : attribuez un niveau (0-100%) et cochez "Validé" pour officialiser. Le membre le voit dans son espace.',
        },
        {
          icon: '📉',
          title: 'Historique de progression',
          description: 'Chaque modification de niveau crée un snapshot automatique. Cela permet de visualiser la courbe de progression d\'un membre dans le temps.',
        },
      ],
    },
    {
      heading: 'Gestion du contenu',
      items: [
        {
          icon: '🎨',
          title: 'Sanity Studio',
          description: 'Cliquez sur "Sanity Studio" pour modifier le contenu du site : articles de blog, événements, activités, textes des pages. Aucun code nécessaire.',
        },
        {
          icon: '📅',
          title: 'Événements et stages',
          description: 'Dans Sanity Studio, créez de nouveaux événements avec titre, date, description, tarif et lien d\'inscription. Ils apparaîtront automatiquement sur le site.',
        },
        {
          icon: '📰',
          title: 'Blog',
          description: 'Publiez des articles depuis Sanity Studio. Ajoutez texte, images, tags et métadonnées SEO pour améliorer votre visibilité sur Google.',
        },
      ],
    },
    {
      heading: 'Technique & déploiement',
      items: [
        {
          icon: '🚀',
          title: 'Déploiement automatique',
          description: 'Toute modification de code poussée sur GitHub se déploie automatiquement sur Vercel (votre hébergeur). Le site se met à jour en 2–3 minutes.',
        },
        {
          icon: '🔧',
          title: 'Diagnostic Supabase',
          description: 'Appelez GET /api/admin/diagnostic (avec votre token Bearer) pour vérifier quelles tables existent dans votre base de données. Utile après une migration.',
        },
        {
          icon: '📧',
          title: 'Emails automatiques',
          description: 'Des emails sont envoyés automatiquement lors d\'une inscription et à la création d\'un compte membre. Configurez l\'expéditeur via les variables d\'environnement Vercel.',
        },
      ],
    },
  ],
}

export function AdminBeginnerMode() {
  const [open, setOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<number | null>(0)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-xs font-sans transition-colors px-3 py-1.5 rounded-sm border ${
          open
            ? 'bg-[#FFF8E8] border-[#E0B060] text-[#C8912A]'
            : 'bg-[#3B2315] border-[#5C3D2E] text-[#C8A888] hover:border-[#C8912A] hover:text-[#C8912A]'
        }`}
        aria-label={open ? 'Fermer le guide' : 'Ouvrir le guide débutant'}
        aria-expanded={open}
      >
        <HelpCircle size={13} />
        <span>Guide débutant</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-96 bg-white border border-[#D4C4A8] rounded-sm shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#3B2315] px-4 py-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-0.5">Administration</p>
              <h3 className="font-serif text-base text-[#F5EDD8] leading-snug">{ADMIN_HELP.title}</h3>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#C8A888] hover:text-white transition-colors flex-shrink-0 mt-0.5" aria-label="Fermer">
              <X size={15} />
            </button>
          </div>

          <div className="px-4 py-3 bg-[#FAF6EF] border-b border-[#E8D8B8]">
            <p className="text-xs font-sans text-[#5C3D2E] leading-relaxed">{ADMIN_HELP.intro}</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {ADMIN_HELP.sections.map((section, si) => (
              <div key={si} className="border-b border-[#F0E8DA] last:border-b-0">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#FAF6EF] hover:bg-[#F5EDD8] transition-colors text-left"
                  onClick={() => setExpandedSection(expandedSection === si ? null : si)}
                >
                  <span className="text-xs font-sans font-bold text-[#5C3D2E] uppercase tracking-widest">{section.heading}</span>
                  {expandedSection === si
                    ? <ChevronUp size={12} className="text-[#7A6355]" />
                    : <ChevronDown size={12} className="text-[#7A6355]" />}
                </button>

                {expandedSection === si && (
                  <div className="divide-y divide-[#F0E8DA]">
                    {section.items.map((item, ii) => {
                      const key = `${si}-${ii}`
                      return (
                        <div key={ii}>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAF6EF] transition-colors"
                            onClick={() => setExpandedItem(expandedItem === key ? null : key)}
                          >
                            <span className="text-sm flex-shrink-0" role="img" aria-hidden="true">{item.icon}</span>
                            <span className="text-sm font-sans font-medium text-[#5C3D2E] flex-1 leading-snug">{item.title}</span>
                            {expandedItem === key
                              ? <ChevronUp size={12} className="text-[#7A6355] flex-shrink-0" />
                              : <ChevronDown size={12} className="text-[#7A6355] flex-shrink-0" />}
                          </button>
                          {expandedItem === key && (
                            <div className="px-4 pb-3">
                              <p className="text-xs font-sans text-[#7A6355] leading-relaxed pl-7">{item.description}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-4 py-3 bg-[#F5EDD8] border-t border-[#E8D8B8]">
            <p className="text-[11px] font-sans text-[#7A6355]">
              Support technique : consultez le{' '}
              <a href="https://github.com/gabrielgalmidecontact-sudo/ateliersdelasource" target="_blank" rel="noopener noreferrer" className="text-[#C8912A] hover:underline">
                repository GitHub
              </a>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
