'use client'
// src/features/admin/AdminQuestionnaireDetailPage.tsx
// Vue admin : réponses d'un questionnaire — toutes les soumissions des membres
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronUp, User, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { AdminBeginnerMode } from '@/features/admin/AdminBeginnerMode'
import type { QuestionnaireTemplate, QuestionnaireQuestion } from '@/lib/supabase/types'

type SubmissionWithDetails = {
  id: string
  submitted_at: string
  member: { id: string; first_name: string | null; last_name: string | null; email: string } | null
  questionnaire_answers: Array<{
    id: string
    answer_text: string | null
    answer_rating: number | null
    answer_choice: string | null
    answer_yesno: boolean | null
    question: { question_text: string; question_type: string } | null
  }>
}

type TemplateWithQuestions = QuestionnaireTemplate & {
  questionnaire_questions: QuestionnaireQuestion[]
}

export function AdminQuestionnaireDetailPage({ questionnaireId }: { questionnaireId: string }) {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [template, setTemplate] = useState<TemplateWithQuestions | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const loadData = useCallback(async () => {
    if (!user) return
    const res = await fetch(`/api/admin/questionnaires/${questionnaireId}/submissions`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setTemplate(d.template)
      setSubmissions(d.submissions || [])
    }
    setLoading(false)
  }, [user, questionnaireId])

  useEffect(() => { if (user && isAdmin) loadData() }, [user, isAdmin, loadData])

  function getAnswerDisplay(ans: SubmissionWithDetails['questionnaire_answers'][0]): string {
    if (ans.answer_text) return ans.answer_text
    if (ans.answer_rating !== null) return `${ans.answer_rating}/10`
    if (ans.answer_choice) return ans.answer_choice
    if (ans.answer_yesno !== null) return ans.answer_yesno ? 'Oui' : 'Non'
    return '—'
  }

  if (isLoading || !user) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header */}
      <div className="bg-[#3B2315] border-b border-[#5C3D2E]">
        <Container>
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/admin/questionnaires" className="text-[#C8A888] hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <Link href="/" className="font-serif text-base text-[#F5EDD8] hover:text-[#C8912A] transition-colors">
                Les Ateliers de la Source
              </Link>
              <span className="text-[#7A6355]">/</span>
              <Link href="/admin" className="text-sm font-sans text-[#C8A888] hover:text-white">Admin</Link>
              <span className="text-[#7A6355]">/</span>
              <Link href="/admin/questionnaires" className="text-sm font-sans text-[#C8A888] hover:text-white">Questionnaires</Link>
              <span className="text-[#7A6355]">/</span>
              <span className="text-sm font-sans text-white">{template?.title || '…'}</span>
            </div>
            <AdminBeginnerMode />
          </div>
        </Container>
      </div>

      <div className="py-8">
        <Container>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !template ? (
            <div className="text-center py-20">
              <p className="font-sans text-[#7A6355]">Questionnaire introuvable.</p>
            </div>
          ) : (
            <>
              {/* En-tête */}
              <div className="mb-8">
                <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Questionnaire</p>
                <h1 className="font-serif text-3xl text-[#5C3D2E]">{template.title}</h1>
                {template.description && (
                  <p className="text-sm font-sans text-[#7A6355] mt-1">{template.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm font-sans text-[#7A6355]">
                    {template.questionnaire_questions?.length || 0} question(s)
                  </span>
                  <span className="text-sm font-sans text-[#7A6355]">·</span>
                  <span className="text-sm font-sans font-medium text-[#5C3D2E]">
                    {submissions.length} réponse(s)
                  </span>
                  <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full ${
                    template.is_active
                      ? 'bg-[#F0F5EC] text-[#4A5E3A] border border-[#B8D4A8]'
                      : 'bg-[#F5F5F5] text-[#7A6355] border border-[#D4C4A8]'
                  }`}>
                    {template.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              {/* Liste soumissions */}
              {submissions.length === 0 ? (
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
                  <CheckCircle size={36} className="text-[#D4C4A8] mx-auto mb-4" />
                  <p className="font-serif text-xl text-[#7A6355] mb-2">Aucune réponse pour le moment</p>
                  <p className="text-sm font-sans text-[#7A6355]">
                    Les membres verront ce questionnaire dans leur espace et pourront y répondre.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map(sub => {
                    const memberName = sub.member
                      ? [sub.member.first_name, sub.member.last_name].filter(Boolean).join(' ') || sub.member.email
                      : 'Membre inconnu'
                    const initials = sub.member
                      ? [(sub.member.first_name || '?')[0], (sub.member.last_name || '')[0]].filter(Boolean).join('').toUpperCase()
                      : '?'
                    const isOpen = expanded === sub.id

                    return (
                      <div key={sub.id} className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
                        <div className="flex items-center gap-4 p-5">
                          <div className="w-10 h-10 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white font-serif text-sm flex-shrink-0">
                            {initials || <User size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-sans font-medium text-[#5C3D2E]">{memberName}</p>
                              {sub.member && (
                                <Link
                                  href={`/admin/membres/${sub.member.id}`}
                                  className="text-[10px] font-sans text-[#C8912A] hover:underline"
                                >
                                  Voir la fiche →
                                </Link>
                              )}
                            </div>
                            <p className="text-xs font-sans text-[#7A6355]">
                              Soumis le {new Date(sub.submitted_at).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric'
                              })}
                              {' · '}{sub.questionnaire_answers?.length || 0} réponse(s)
                            </p>
                          </div>
                          <button
                            onClick={() => setExpanded(isOpen ? null : sub.id)}
                            className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors flex-shrink-0"
                          >
                            {isOpen
                              ? <ChevronUp size={16} className="text-[#7A6355]" />
                              : <ChevronDown size={16} className="text-[#7A6355]" />}
                          </button>
                        </div>

                        {/* Réponses */}
                        {isOpen && (
                          <div className="border-t border-[#F0E8DA] p-5 space-y-4">
                            {sub.questionnaire_answers?.map((ans, i) => (
                              <div key={ans.id} className="space-y-1">
                                <p className="text-xs font-sans font-medium text-[#7A6355] uppercase tracking-wider">
                                  {i + 1}. {ans.question?.question_text || 'Question'}
                                </p>
                                <div className="pl-3 border-l-2 border-[#E8D8B8]">
                                  {ans.answer_text && (
                                    <p className="text-sm font-sans text-[#2D1F14] leading-relaxed italic">
                                      &ldquo;{ans.answer_text}&rdquo;
                                    </p>
                                  )}
                                  {ans.answer_rating !== null && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xl font-serif text-[#C8912A]">{ans.answer_rating}</span>
                                      <span className="text-xs font-sans text-[#7A6355]">/ 10</span>
                                    </div>
                                  )}
                                  {ans.answer_choice && (
                                    <span className="inline-block text-sm font-sans text-[#5C3D2E] bg-[#F5EDD8] px-3 py-1 rounded-sm">
                                      {ans.answer_choice}
                                    </span>
                                  )}
                                  {ans.answer_yesno !== null && (
                                    <span className={`inline-block text-sm font-sans px-3 py-1 rounded-sm ${
                                      ans.answer_yesno
                                        ? 'bg-[#F0F5EC] text-[#4A5E3A]'
                                        : 'bg-[#F5F5F5] text-[#7A6355]'
                                    }`}>
                                      {ans.answer_yesno ? 'Oui' : 'Non'}
                                    </span>
                                  )}
                                  {!ans.answer_text && ans.answer_rating === null && !ans.answer_choice && ans.answer_yesno === null && (
                                    <p className="text-xs font-sans text-[#D4C4A8] italic">Sans réponse</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </Container>
      </div>
    </div>
  )
}
