'use client'
// src/features/admin/AdminQuestionnairesPage.tsx
// Gestion des questionnaires personnalisés — admin
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Edit2, CheckCircle, XCircle, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { AdminBeginnerMode } from '@/features/admin/AdminBeginnerMode'
import type { QuestionnaireTemplate, QuestionnaireQuestion } from '@/lib/supabase/types'

type TemplateWithQuestions = QuestionnaireTemplate & {
  questionnaire_questions?: { count: number }[]
}

type QuestionType = 'text' | 'rating' | 'choice' | 'yesno'

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text:   'Texte libre',
  rating: 'Note (1-10)',
  choice: 'Choix multiple',
  yesno:  'Oui / Non',
}

export function AdminQuestionnairesPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [questionnaires, setQuestionnaires] = useState<TemplateWithQuestions[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Record<string, QuestionnaireQuestion[]>>({})

  // Modal créer questionnaire
  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  // Modal ajouter question
  const [questionModal, setQuestionModal] = useState<string | null>(null) // templateId
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'text' as QuestionType,
    options: '',
    is_required: true,
  })
  const [savingQ, setSavingQ] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const loadQuestionnaires = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/admin/questionnaires', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setQuestionnaires(d.questionnaires || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (user && isAdmin) loadQuestionnaires() }, [user, isAdmin, loadQuestionnaires])

  async function loadQuestions(templateId: string) {
    if (questions[templateId]) {
      setExpanded(expanded === templateId ? null : templateId)
      return
    }
    const res = await fetch(`/api/admin/questionnaires/${templateId}`, {
      headers: { Authorization: `Bearer ${user!.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setQuestions(prev => ({ ...prev, [templateId]: d.questions || [] }))
    }
    setExpanded(templateId)
  }

  async function createQuestionnaire() {
    if (!createForm.title || !user) return
    setSaving(true)
    const res = await fetch('/api/admin/questionnaires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify(createForm),
    })
    setSaving(false)
    if (res.ok) {
      setCreateModal(false)
      setCreateForm({ title: '', description: '' })
      loadQuestionnaires()
    }
  }

  async function toggleActive(tpl: TemplateWithQuestions) {
    if (!user) return
    await fetch(`/api/admin/questionnaires/${tpl.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({ is_active: !tpl.is_active }),
    })
    loadQuestionnaires()
  }

  async function deleteQuestionnaire(id: string) {
    if (!user || !confirm('Supprimer ce questionnaire et toutes ses questions ?')) return
    await fetch(`/api/admin/questionnaires/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    loadQuestionnaires()
  }

  async function addQuestion(templateId: string) {
    if (!questionForm.question_text || !user) return
    setSavingQ(true)
    const optionsArr = questionForm.question_type === 'choice'
      ? questionForm.options.split('\n').map(s => s.trim()).filter(Boolean)
      : null

    const res = await fetch(`/api/admin/questionnaires/${templateId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({
        question_text: questionForm.question_text,
        question_type: questionForm.question_type,
        options: optionsArr,
        is_required: questionForm.is_required,
        sort_order: (questions[templateId]?.length || 0) + 1,
      }),
    })
    setSavingQ(false)
    if (res.ok) {
      setQuestionModal(null)
      setQuestionForm({ question_text: '', question_type: 'text', options: '', is_required: true })
      // Recharger les questions
      const qRes = await fetch(`/api/admin/questionnaires/${templateId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      if (qRes.ok) {
        const d = await qRes.json()
        setQuestions(prev => ({ ...prev, [templateId]: d.questions || [] }))
      }
    }
  }

  async function deleteQuestion(templateId: string, questionId: string) {
    if (!user || !confirm('Supprimer cette question ?')) return
    await fetch(`/api/admin/questionnaires/${templateId}/questions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({ id: questionId }),
    })
    setQuestions(prev => ({
      ...prev,
      [templateId]: prev[templateId]?.filter(q => q.id !== questionId) || [],
    }))
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
              <Link href="/admin" className="text-[#C8A888] hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <Link href="/" className="font-serif text-base text-[#F5EDD8] hover:text-[#C8912A] transition-colors">
                Les Ateliers de la Source
              </Link>
              <span className="text-[#7A6355]">/</span>
              <Link href="/admin" className="text-sm font-sans text-[#C8A888] hover:text-white">Admin</Link>
              <span className="text-[#7A6355]">/</span>
              <span className="text-sm font-sans text-white">Questionnaires</span>
            </div>
            <AdminBeginnerMode />
          </div>
        </Container>
      </div>

      <div className="py-8">
        <Container>
          {/* En-tête */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Administration</p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">Questionnaires</h1>
              <p className="text-sm font-sans text-[#7A6355] mt-1">
                Créez et gérez vos questionnaires personnalisés.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
              <Plus size={15} /> Créer un questionnaire
            </Button>
          </div>

          {/* Liste des questionnaires */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : questionnaires.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
              <p className="font-serif text-xl text-[#7A6355] mb-2">Aucun questionnaire</p>
              <p className="text-sm font-sans text-[#7A6355] mb-6">
                Créez votre premier questionnaire pour recueillir les ressentis des membres.
              </p>
              <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
                <Plus size={15} /> Créer un questionnaire
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questionnaires.map(tpl => {
                const qCount = questions[tpl.id]?.length ?? (tpl.questionnaire_questions?.[0] as unknown as { count: number } | undefined)?.count ?? 0
                const isOpen = expanded === tpl.id
                return (
                  <div key={tpl.id} className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
                    {/* Header du questionnaire */}
                    <div className="flex items-center gap-4 p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-serif text-lg text-[#5C3D2E]">{tpl.title}</h2>
                          <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full ${
                            tpl.is_active
                              ? 'bg-[#F0F5EC] text-[#4A5E3A] border border-[#B8D4A8]'
                              : 'bg-[#F5F5F5] text-[#7A6355] border border-[#D4C4A8]'
                          }`}>
                            {tpl.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        {tpl.description && (
                          <p className="text-sm font-sans text-[#7A6355] mt-1">{tpl.description}</p>
                        )}
                        <p className="text-xs font-sans text-[#7A6355] mt-1">
                          {qCount} question{qCount > 1 ? 's' : ''} ·{' '}
                          Créé le {new Date(tpl.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleActive(tpl)}
                          title={tpl.is_active ? 'Désactiver' : 'Activer'}
                          className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors"
                        >
                          {tpl.is_active
                            ? <CheckCircle size={16} className="text-[#4A5E3A]" />
                            : <XCircle size={16} className="text-[#D4C4A8]" />}
                        </button>
                        <button
                          onClick={() => deleteQuestionnaire(tpl.id)}
                          title="Supprimer"
                          className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors"
                        >
                          <Trash2 size={16} className="text-[#D4C4A8] hover:text-red-400 transition-colors" />
                        </button>
                        <button
                          onClick={() => loadQuestions(tpl.id)}
                          className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors"
                          aria-label={isOpen ? 'Réduire' : 'Développer'}
                        >
                          {isOpen ? <ChevronUp size={16} className="text-[#7A6355]" /> : <ChevronDown size={16} className="text-[#7A6355]" />}
                        </button>
                      </div>
                    </div>

                    {/* Questions (expand) */}
                    {isOpen && (
                      <div className="border-t border-[#F0E8DA] p-5">
                        {questions[tpl.id]?.length === 0 ? (
                          <p className="text-sm font-sans text-[#7A6355] mb-3">Aucune question pour le moment.</p>
                        ) : (
                          <div className="space-y-2 mb-4">
                            {questions[tpl.id]?.map((q, i) => (
                              <div key={q.id} className="flex items-start gap-3 p-3 bg-[#FAF6EF] rounded-sm border border-[#E8D8B8]">
                                <GripVertical size={14} className="text-[#D4C4A8] mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-sans text-[#2D1F14]">
                                    <span className="text-[#C8912A] font-medium mr-1">{i + 1}.</span>
                                    {q.question_text}
                                    {q.is_required && <span className="text-red-400 ml-1">*</span>}
                                  </p>
                                  <p className="text-[10px] font-sans text-[#7A6355] mt-0.5">
                                    {QUESTION_TYPE_LABELS[q.question_type as QuestionType] || q.question_type}
                                    {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                                      <span className="ml-1">— {(q.options as string[]).join(', ')}</span>
                                    )}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteQuestion(tpl.id, q.id)}
                                  className="flex-shrink-0 text-[#D4C4A8] hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setQuestionModal(tpl.id)
                            setQuestionForm({ question_text: '', question_type: 'text', options: '', is_required: true })
                          }}
                        >
                          <Plus size={13} /> Ajouter une question
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Container>
      </div>

      {/* Modal créer questionnaire */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Nouveau questionnaire" size="md">
        <div className="space-y-4">
          <Input
            label="Titre du questionnaire *"
            name="title"
            value={createForm.title}
            onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Ex : Bilan post-stage théâtre"
            required
          />
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Description (optionnel)</label>
            <textarea
              value={createForm.description}
              onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
              className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
              placeholder="À quoi sert ce questionnaire ?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" onClick={createQuestionnaire}
              disabled={saving || !createForm.title}
            >
              {saving ? 'Création…' : 'Créer'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setCreateModal(false)}>Annuler</Button>
          </div>
        </div>
      </Modal>

      {/* Modal ajouter question */}
      <Modal
        isOpen={!!questionModal}
        onClose={() => setQuestionModal(null)}
        title="Ajouter une question"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Question *</label>
            <textarea
              value={questionForm.question_text}
              onChange={e => setQuestionForm(p => ({ ...p, question_text: e.target.value }))}
              className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
              placeholder="Que retenez-vous de cette expérience ?"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Type de réponse</label>
            <select
              value={questionForm.question_type}
              onChange={e => setQuestionForm(p => ({ ...p, question_type: e.target.value as QuestionType }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
            >
              {Object.entries(QUESTION_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          {questionForm.question_type === 'choice' && (
            <div>
              <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">
                Options (une par ligne)
              </label>
              <textarea
                value={questionForm.options}
                onChange={e => setQuestionForm(p => ({ ...p, options: e.target.value }))}
                className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
                placeholder={"Option 1\nOption 2\nOption 3"}
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm font-sans text-[#5C3D2E] cursor-pointer">
            <input
              type="checkbox"
              checked={questionForm.is_required}
              onChange={e => setQuestionForm(p => ({ ...p, is_required: e.target.checked }))}
              className="accent-[#C8912A]"
            />
            Réponse obligatoire
          </label>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary" size="md"
              onClick={() => questionModal && addQuestion(questionModal)}
              disabled={savingQ || !questionForm.question_text}
            >
              {savingQ ? 'Ajout…' : 'Ajouter'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setQuestionModal(null)}>Annuler</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
