'use client'
// src/features/member/MemberQuestionnairesPage.tsx
// Questionnaires du membre — voir les questionnaires actifs et y répondre
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, ChevronRight, FileText, Send } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import type { QuestionnaireTemplate, QuestionnaireQuestion, QuestionnaireSubmission } from '@/lib/supabase/types'

type TemplateWithQuestions = QuestionnaireTemplate & {
  questionnaire_questions: QuestionnaireQuestion[]
}

type Answers = Record<string, {
  answer_text?: string
  answer_rating?: number
  answer_choice?: string
  answer_yesno?: boolean
}>

function QuestionnaireForm({
  template,
  onSubmit,
  onCancel,
}: {
  template: TemplateWithQuestions
  onSubmit: (answers: Answers) => Promise<void>
  onCancel: () => void
}) {
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)

  function setAnswer(questionId: string, value: Partial<Answers[string]>) {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], ...value } }))
  }

  async function handleSubmit() {
    // Vérifier les champs obligatoires
    const missing = template.questionnaire_questions.filter(q =>
      q.is_required && !answers[q.id]?.answer_text && !answers[q.id]?.answer_rating &&
      !answers[q.id]?.answer_choice && answers[q.id]?.answer_yesno === undefined
    )
    if (missing.length > 0) {
      alert(`Merci de répondre à toutes les questions obligatoires (${missing.length} manquante${missing.length > 1 ? 's' : ''}).`)
      return
    }
    setSubmitting(true)
    await onSubmit(answers)
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
      <div className="bg-[#3B2315] px-5 py-3">
        <p className="text-xs font-sans text-[#C8A888] uppercase tracking-widest mb-0.5">Questionnaire</p>
        <h2 className="font-serif text-lg text-[#F5EDD8]">{template.title}</h2>
        {template.description && (
          <p className="text-xs font-sans text-[#C8A888] mt-1">{template.description}</p>
        )}
      </div>
      <div className="p-6 space-y-6">
        {template.questionnaire_questions.map((q, i) => (
          <div key={q.id}>
            <label className="block text-sm font-sans font-medium text-[#5C3D2E] mb-2">
              <span className="text-[#C8912A] mr-1">{i + 1}.</span>
              {q.question_text}
              {q.is_required && <span className="text-red-400 ml-1">*</span>}
            </label>

            {q.question_type === 'text' && (
              <textarea
                value={answers[q.id]?.answer_text || ''}
                onChange={e => setAnswer(q.id, { answer_text: e.target.value })}
                className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A] bg-[#FAF6EF]"
                placeholder="Votre réponse…"
              />
            )}

            {q.question_type === 'rating' && (
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 10 }, (_, n) => n + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setAnswer(q.id, { answer_rating: n })}
                    className={`w-10 h-10 rounded-sm text-sm font-sans font-medium transition-all duration-150 ${
                      answers[q.id]?.answer_rating === n
                        ? 'bg-[#C8912A] text-white border border-[#C8912A]'
                        : 'bg-[#FAF6EF] text-[#5C3D2E] border border-[#D4C4A8] hover:border-[#C8912A]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

            {q.question_type === 'choice' && q.options && Array.isArray(q.options) && (
              <div className="space-y-2">
                {(q.options as string[]).map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      answers[q.id]?.answer_choice === opt
                        ? 'border-[#C8912A] bg-[#C8912A]'
                        : 'border-[#D4C4A8] group-hover:border-[#C8912A]'
                    }`}>
                      {answers[q.id]?.answer_choice === opt && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className="text-sm font-sans text-[#5C3D2E]"
                      onClick={() => setAnswer(q.id, { answer_choice: opt })}
                    >
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'yesno' && (
              <div className="flex gap-3">
                {[
                  { v: true, label: 'Oui' },
                  { v: false, label: 'Non' },
                ].map(({ v, label }) => (
                  <button
                    key={String(v)}
                    onClick={() => setAnswer(q.id, { answer_yesno: v })}
                    className={`px-6 py-2.5 rounded-sm text-sm font-sans font-medium transition-all duration-150 ${
                      answers[q.id]?.answer_yesno === v
                        ? 'bg-[#C8912A] text-white'
                        : 'bg-[#FAF6EF] text-[#5C3D2E] border border-[#D4C4A8] hover:border-[#C8912A]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4 border-t border-[#F0E8DA]">
          <Button variant="primary" size="md" onClick={handleSubmit} disabled={submitting}>
            <Send size={14} />
            {submitting ? 'Envoi en cours…' : 'Envoyer mes réponses'}
          </Button>
          <Button variant="ghost" size="md" onClick={onCancel}>Annuler</Button>
        </div>
      </div>
    </div>
  )
}

export function MemberQuestionnairesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [questionnaires, setQuestionnaires] = useState<TemplateWithQuestions[]>([])
  const [submissions, setSubmissions] = useState<QuestionnaireSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<string[]>([])
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.push('/connexion')
  }, [user, isLoading, router])

  const loadData = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/member/questionnaires', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setQuestionnaires(d.questionnaires || [])
      setSubmissions(d.submissions || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (user) loadData() }, [user, loadData])

  const submittedIds = new Set([
    ...submissions.map(s => s.template_id),
    ...submitted,
  ])

  async function handleSubmit(templateId: string, answers: Answers) {
    if (!user) return
    const answersArray = Object.entries(answers).map(([question_id, ans]) => ({
      question_id,
      ...ans,
    }))
    const res = await fetch(`/api/member/questionnaires/${templateId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({ answers: answersArray }),
    })
    if (res.ok) {
      setSubmitted(prev => [...prev, templateId])
      setActiveForm(null)
      setSuccess(templateId)
      setTimeout(() => setSuccess(null), 4000)
    }
  }

  if (isLoading || !user) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header */}
      <div className="pt-24 pb-8 bg-[#3B2315]">
        <Container>
          <div className="flex items-center gap-3 mb-4">
            <Link href="/espace-membre" className="text-[#C8A888] hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
          </div>
          <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-[#C8912A] mb-1">Espace personnel</p>
          <h1 className="font-serif text-3xl text-[#F5EDD8]">Questionnaires</h1>
          <p className="text-sm font-sans text-[#C8A888] mt-1">Partagez vos ressentis et réflexions</p>
        </Container>
      </div>

      <div className="py-10">
        <Container className="max-w-2xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : questionnaires.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
              <FileText size={40} className="text-[#D4C4A8] mx-auto mb-4" />
              <p className="font-serif text-xl text-[#7A6355] mb-2">Aucun questionnaire disponible</p>
              <p className="text-sm font-sans text-[#7A6355]">
                Gabriel partagera bientôt des questionnaires pour enrichir votre parcours.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {success && (
                <div className="bg-[#F0F5EC] border border-[#B8D4A8] rounded-sm p-4 flex items-center gap-3">
                  <CheckCircle size={18} className="text-[#4A5E3A]" />
                  <p className="text-sm font-sans text-[#4A5E3A]">
                    Merci pour vos réponses ! Votre questionnaire a bien été envoyé.
                  </p>
                </div>
              )}

              {questionnaires.map(tpl => {
                const alreadyDone = submittedIds.has(tpl.id)
                const isOpen = activeForm === tpl.id

                return (
                  <div key={tpl.id}>
                    {isOpen ? (
                      <QuestionnaireForm
                        template={tpl}
                        onSubmit={(answers) => handleSubmit(tpl.id, answers)}
                        onCancel={() => setActiveForm(null)}
                      />
                    ) : (
                      <div className={`bg-white rounded-sm border p-5 ${
                        alreadyDone ? 'border-[#B8D4A8]' : 'border-[#D4C4A8]'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h2 className="font-serif text-lg text-[#5C3D2E]">{tpl.title}</h2>
                              {alreadyDone && (
                                <span className="flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#F0F5EC] text-[#4A5E3A] border border-[#B8D4A8]">
                                  <CheckCircle size={10} /> Complété
                                </span>
                              )}
                            </div>
                            {tpl.description && (
                              <p className="text-sm font-sans text-[#7A6355] mb-2">{tpl.description}</p>
                            )}
                            <p className="text-xs font-sans text-[#7A6355]">
                              {tpl.questionnaire_questions?.length || 0} question
                              {(tpl.questionnaire_questions?.length || 0) > 1 ? 's' : ''}
                            </p>
                          </div>
                          {!alreadyDone && (
                            <button
                              onClick={() => setActiveForm(tpl.id)}
                              className="flex items-center gap-2 text-sm font-sans text-[#C8912A] border border-[#C8912A] px-4 py-2 rounded-sm hover:bg-[#C8912A] hover:text-white transition-all duration-200 flex-shrink-0"
                            >
                              Répondre <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#E8D8B8]">
            <Link
              href="/espace-membre"
              className="text-sm font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors flex items-center gap-1.5"
            >
              ← Retour au livre de bord
            </Link>
          </div>
        </Container>
      </div>
    </div>
  )
}
