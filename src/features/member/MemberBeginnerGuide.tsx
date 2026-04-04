'use client'
// src/features/member/MemberBeginnerGuide.tsx
// Guide débutant membre — onboarding contextuel et humain
// S'affiche en premier accès ou à la demande

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from 'lucide-react'

interface Step {
  icon: string
  title: string
  body: string
  cta?: { label: string; href: string }
  tip?: string
}

const STEPS: Step[] = [
  {
    icon: '📖',
    title: 'Bienvenue dans votre Livre de Bord',
    body: 'Cet espace vous appartient entièrement. Il grandit avec vous, au fil de vos expériences aux Ateliers de la Source. Prenez le temps de vous y installer.',
    tip: 'Conseil : commencez par compléter votre profil avec votre prénom et votre intention.',
    cta: { label: 'Compléter mon profil', href: '/espace-membre/profil' },
  },
  {
    icon: '🌿',
    title: 'Votre parcours, en un seul endroit',
    body: 'La timeline de votre tableau de bord regroupe tout : chaque stage vécu, chaque guidance reçue, chaque note prise. Vous pouvez voir votre chemin d\'un seul regard.',
    tip: 'Les expériences sont créées par Gabriel. Elles apparaissent automatiquement ici.',
  },
  {
    icon: '✍️',
    title: 'Le journal libre — votre espace intime',
    body: 'Notez vos pensées, ressentis, intuitions — sans format imposé. Ces notes n\'appartiennent qu\'à vous. Elles sont strictement privées.',
    tip: 'Même une seule ligne compte. L\'important est de noter, même imparfaitement.',
    cta: { label: 'Ouvrir mon journal', href: '/espace-membre/journal' },
  },
  {
    icon: '💬',
    title: 'Les guidances de Gabriel',
    body: 'Parfois, Gabriel vous laisse une observation, un encouragement ou une piste à explorer. Vous les retrouvez dans vos fiches d\'expériences ou sur la timeline.',
    tip: 'Les guidances marquées "Visible" sont partagées avec vous intentionnellement.',
  },
  {
    icon: '🌟',
    title: 'Vos compétences et votre progression',
    body: 'Au fil des stages, Gabriel valide et enrichit vos compétences. Vous les retrouvez dans l\'onglet "Compétences". Elles reflètent votre évolution réelle.',
    tip: 'La progression n\'est pas une note. C\'est une mémoire de ce que vous avez traversé.',
    cta: { label: 'Voir mes compétences', href: '/espace-membre/competences' },
  },
  {
    icon: '📋',
    title: 'Les questionnaires',
    body: 'Avant ou après une expérience, Gabriel peut vous inviter à répondre à un questionnaire. Cela nourrit votre suivi et l\'accompagnement.',
    tip: 'Il n\'y a pas de bonne ou mauvaise réponse. Répondez avec ce qui est vrai pour vous.',
    cta: { label: 'Voir mes questionnaires', href: '/espace-membre/questionnaires' },
  },
]

const STORAGE_KEY = 'atelier_beginner_guide_done'

interface MemberBeginnerGuideProps {
  forceOpen?: boolean
  onClose?: () => void
}

export function MemberBeginnerGuide({ forceOpen = false, onClose }: MemberBeginnerGuideProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (forceOpen) { setOpen(true); return }
    try {
      const isDone = localStorage.getItem(STORAGE_KEY) === '1'
      if (!isDone) setOpen(true)
    } catch { /* SSR */ }
  }, [forceOpen])

  function close() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* SSR */ }
    setOpen(false)
    onClose?.()
  }

  function finish() {
    setDone(true)
    setTimeout(close, 1200)
  }

  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(43, 28, 14, 0.6)', backdropFilter: 'blur(2px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Guide de bienvenue"
    >
      <div className="relative bg-white rounded-sm border border-[#D4C4A8] shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-[#3B2315] px-6 py-4 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8912A] mb-0.5">Guide de bienvenue</p>
            <p className="text-xs font-sans text-[#C8A888]">Étape {step + 1} sur {STEPS.length}</p>
          </div>
          <button
            onClick={close}
            className="text-[#7A6355] hover:text-white transition-colors flex-shrink-0 mt-0.5"
            aria-label="Fermer le guide"
          >
            <X size={16} />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="h-1 bg-[#3B2315]">
          <div
            className="h-full bg-[#C8912A] transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Contenu */}
        {done ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 size={40} className="text-[#4A5E3A] mx-auto mb-4" />
            <p className="font-serif text-xl text-[#5C3D2E] mb-2">Vous êtes prêt·e !</p>
            <p className="text-sm font-sans text-[#7A6355]">Votre Livre de Bord vous attend.</p>
          </div>
        ) : (
          <div className="px-6 py-6">
            <div className="text-4xl mb-4" role="img" aria-hidden="true">{current.icon}</div>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3 leading-snug">{current.title}</h2>
            <p className="text-sm font-sans text-[#2D1F14] leading-relaxed mb-4">{current.body}</p>

            {current.tip && (
              <div className="flex items-start gap-2 p-3 bg-[#FFF8E8] border border-[#E0B060]/50 rounded-sm mb-4">
                <Sparkles size={13} className="text-[#C8912A] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs font-sans text-[#5C3D2E] leading-relaxed">{current.tip}</p>
              </div>
            )}

            {current.cta && (
              <Link
                href={current.cta.href}
                onClick={close}
                className="inline-flex items-center gap-1.5 text-xs font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors mb-2"
              >
                {current.cta.label} <ChevronRight size={12} />
              </Link>
            )}
          </div>
        )}

        {/* Navigation */}
        {!done && (
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 text-xs font-sans text-[#7A6355] disabled:opacity-30 hover:text-[#5C3D2E] transition-colors"
            >
              <ChevronLeft size={13} /> Précédent
            </button>

            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                  style={{ backgroundColor: i === step ? '#C8912A' : '#D4C4A8' }}
                  aria-label={`Étape ${i + 1}`}
                />
              ))}
            </div>

            {isLast ? (
              <button
                onClick={finish}
                className="flex items-center gap-1.5 text-xs font-sans text-white bg-[#C8912A] px-4 py-2 rounded-sm hover:bg-[#B07820] transition-colors"
              >
                Commencer <CheckCircle2 size={13} />
              </button>
            ) : (
              <button
                onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                className="flex items-center gap-1 text-xs font-sans text-[#5C3D2E] hover:text-[#C8912A] transition-colors"
              >
                Suivant <ChevronRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Bouton discret pour rouvrir le guide ────────────────────
export function MemberBeginnerGuideButton() {
  const [show, setShow] = useState(false)
  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 text-xs font-sans text-[#C8A888] hover:text-white border border-[#5C3D2E] hover:border-[#C8912A] px-3 py-1.5 rounded-sm transition-all duration-200"
        aria-label="Ouvrir le guide de bienvenue"
      >
        <Sparkles size={12} />
        Guide
      </button>
      {show && <MemberBeginnerGuide forceOpen onClose={() => setShow(false)} />}
    </>
  )
}
