'use client'
// src/features/admin/AdminQuestionnairesPage.tsx
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, GripVertical, Users, Layers3, Save } from 'lucide-react'
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
type AudienceType = 'all' | 'selected_members' | 'groups'

type TargetMember = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
}

type TargetGroup = {
  id: string
  name: string
  description: string | null
  is_active: boolean
}

type AssignmentRow = {
  id: string
  template_id: string
  member_id: string | null
  group_id: string | null
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: 'Texte libre',
  rating: 'Note (1-10)',
  choice: 'Choix multiple',
  yesno: 'Oui / Non',
}

const AUDIENCE_LABELS: Record<AudienceType, string> = {
  all: 'Tous les membres',
  selected_members: 'Membres sélectionnés',
  groups: 'Groupes',
}

export function AdminQuestionnairesPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  const [questionnaires, setQuestionnaires] = useState<TemplateWithQuestions[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Record<string, QuestionnaireQuestion[]>>({})

  const [targets, setTargets] = useState<{ members: TargetMember[]; groups: TargetGroup[] }>({
    members: [],
    groups: [],
  })

  const [selectedMembers, setSelectedMembers] = useState<Record<string, string[]>>({})
  const [selectedGroups, setSelectedGroups] = useState<Record<string, string[]>>({})
  const [loadedAssignments, setLoadedAssignments] = useState<Record<string, boolean>>({})
  const [savingAudienceId, setSavingAudienceId] = useState<string | null>(null)
  const [savingAssignmentsId, setSavingAssignmentsId] = useState<string | null>(null)

  const [createModal, setCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  const [questionModal, setQuestionModal] = useState<string | null>(null)
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

  const loadTargets = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/admin/targets', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (!res.ok) return
    const data = await res.json()
    setTargets({
      members: data.members || [],
      groups: data.groups || [],
    })
  }, [user])

  useEffect(() => {
    if (!user || !isAdmin) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuestionnaires()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTargets()
  }, [user, isAdmin, loadQuestionnaires, loadTargets])

  async function loadAssignments(templateId: string) {
    if (!user) return
    if (loadedAssignments[templateId]) return

    const res = await fetch(`/api/admin/questionnaires/${templateId}/assign`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })

    if (!res.ok) return

    const data = await res.json()
    const assignments: AssignmentRow[] = data.assignments || []

    setSelectedMembers((prev) => ({
      ...prev,
      [templateId]: assignments.filter((a) => a.member_id).map((a) => a.member_id!) || [],
    }))

    setSelectedGroups((prev) => ({
      ...prev,
      [templateId]: assignments.filter((a) => a.group_id).map((a) => a.group_id!) || [],
    }))

    setLoadedAssignments((prev) => ({ ...prev, [templateId]: true }))
  }

  async function loadQuestions(templateId: string) {
    if (questions[templateId]) {
      setExpanded(expanded === templateId ? null : templateId)
      if (expanded !== templateId) await loadAssignments(templateId)
      return
    }

    const res = await fetch(`/api/admin/questionnaires/${templateId}`, {
      headers: { Authorization: `Bearer ${user!.accessToken}` },
    })

    if (res.ok) {
      const d = await res.json()
      setQuestions((prev) => ({ ...prev, [templateId]: d.questions || [] }))
    }

    await loadAssignments(templateId)
    setExpanded(templateId)
  }

  async function createQuestionnaire() {
    if (!createForm.title || !user) return
    setSaving(true)

    const res = await fetch('/api/admin/questionnaires', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({ is_active: !tpl.is_active }),
    })
    loadQuestionnaires()
  }

  async function changeAudienceType(templateId: string, audienceType: AudienceType) {
    if (!user) return
    setSavingAudienceId(templateId)

    await fetch(`/api/admin/questionnaires/${templateId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({ audience_type: audienceType }),
    })

    setQuestionnaires((prev) =>
      prev.map((tpl) =>
        tpl.id === templateId ? { ...tpl, audience_type: audienceType } : tpl
      )
    )

    if (audienceType === 'all') {
      setSelectedMembers((prev) => ({ ...prev, [templateId]: [] }))
      setSelectedGroups((prev) => ({ ...prev, [templateId]: [] }))
      await saveAssignments(templateId, [], [])
    }

    setSavingAudienceId(null)
  }

  async function saveAssignments(templateId: string, memberIds?: string[], groupIds?: string[]) {
    if (!user) return

    const finalMemberIds = memberIds ?? selectedMembers[templateId] ?? []
    const finalGroupIds = groupIds ?? selectedGroups[templateId] ?? []

    setSavingAssignmentsId(templateId)

    const res = await fetch(`/api/admin/questionnaires/${templateId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        member_ids: finalMemberIds,
        group_ids: finalGroupIds,
      }),
    })

    setSavingAssignmentsId(null)

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      alert(data?.error || 'Impossible de sauvegarder les assignations.')
      return
    }

    setLoadedAssignments((prev) => ({ ...prev, [templateId]: true }))
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

    const optionsArr =
      questionForm.question_type === 'choice'
        ? questionForm.options.split('\n').map((s) => s.trim()).filter(Boolean)
        : null

    const res = await fetch(`/api/admin/questionnaires/${templateId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
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
      setQuestionForm({
        question_text: '',
        question_type: 'text',
        options: '',
        is_required: true,
      })

      const qRes = await fetch(`/api/admin/questionnaires/${templateId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })

      if (qRes.ok) {
        const d = await qRes.json()
        setQuestions((prev) => ({ ...prev, [templateId]: d.questions || [] }))
      }
    }
  }

  async function deleteQuestion(templateId: string, questionId: string) {
    if (!user || !confirm('Supprimer cette question ?')) return

    await fetch(`/api/admin/questionnaires/${templateId}/questions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({ id: questionId }),
    })

    setQuestions((prev) => ({
      ...prev,
      [templateId]: prev[templateId]?.filter((q) => q.id !== questionId) || [],
    }))
  }

  function toggleSelectedMember(templateId: string, memberId: string) {
    setSelectedMembers((prev) => {
      const current = prev[templateId] || []
      const exists = current.includes(memberId)
      return {
        ...prev,
        [templateId]: exists ? current.filter((id) => id !== memberId) : [...current, memberId],
      }
    })
  }

  function toggleSelectedGroup(templateId: string, groupId: string) {
    setSelectedGroups((prev) => {
      const current = prev[templateId] || []
      const exists = current.includes(groupId)
      return {
        ...prev,
        [templateId]: exists ? current.filter((id) => id !== groupId) : [...current, groupId],
      }
    })
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
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Administration</p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">Questionnaires</h1>
              <p className="text-sm font-sans text-[#7A6355] mt-1">
                Créez, structurez et ciblez vos questionnaires.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
              <Plus size={15} /> Créer un questionnaire
            </Button>
          </div>

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
              {questionnaires.map((tpl) => {
                const qCount =
                  questions[tpl.id]?.length ??
                  (tpl.questionnaire_questions?.[0] as unknown as { count: number } | undefined)?.count ??
                  0

                const isOpen = expanded === tpl.id
                const audienceType = (tpl.audience_type || 'all') as AudienceType
                const currentSelectedMembers = selectedMembers[tpl.id] || []
                const currentSelectedGroups = selectedGroups[tpl.id] || []

                return (
                  <div key={tpl.id} className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
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
                          <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#FAF6EF] text-[#7A6355] border border-[#E8D8B8]">
                            {AUDIENCE_LABELS[audienceType]}
                          </span>
                        </div>

                        {tpl.description && (
                          <p className="text-sm font-sans text-[#7A6355] mt-1">{tpl.description}</p>
                        )}

                        <p className="text-xs font-sans text-[#7A6355] mt-1">
                          {qCount} question{qCount > 1 ? 's' : ''} · Créé le {new Date(tpl.created_at).toLocaleDateString('fr-FR')}
                        </p>

                        <div className="mt-4 border-t border-[#F0E8DA] pt-4">
                          <p className="text-[10px] font-sans uppercase tracking-widest text-[#7A6355] mb-2">
                            Ciblage du questionnaire
                          </p>

                          <div className="flex flex-wrap gap-5 text-sm">
                            {(['all', 'selected_members', 'groups'] as AudienceType[]).map((type) => (
                              <label key={type} className="flex items-center gap-2 cursor-pointer text-[#5C3D2E]">
                                <input
                                  type="radio"
                                  name={`audience-${tpl.id}`}
                                  checked={audienceType === type}
                                  disabled={savingAudienceId === tpl.id}
                                  onChange={() => changeAudienceType(tpl.id, type)}
                                  className="accent-[#C8912A]"
                                />
                                <span>
                                  {type === 'all' && 'Tous les membres'}
                                  {type === 'selected_members' && 'Membres spécifiques'}
                                  {type === 'groups' && 'Groupes'}
                                </span>
                              </label>
                            ))}
                          </div>

                          {audienceType === 'selected_members' && (
                            <div className="mt-4 bg-[#FAF6EF] border border-[#E8D8B8] rounded-sm p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Users size={14} className="text-[#C8912A]" />
                                <p className="text-sm font-sans font-medium text-[#5C3D2E]">
                                  Membres à sélectionner
                                </p>
                              </div>

                              {targets.members.length === 0 ? (
                                <p className="text-xs font-sans text-[#7A6355]">Aucun membre disponible.</p>
                              ) : (
                                <>
                                  <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-1">
                                    {targets.members.map((member) => {
                                      const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ').trim()
                                      return (
                                        <label key={member.id} className="flex items-start gap-2 text-xs font-sans text-[#5C3D2E] cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={currentSelectedMembers.includes(member.id)}
                                            onChange={() => toggleSelectedMember(tpl.id, member.id)}
                                            className="accent-[#C8912A] mt-0.5"
                                          />
                                          <span>
                                            <span className="block">{fullName || member.email}</span>
                                            {fullName && <span className="text-[#7A6355]">{member.email}</span>}
                                          </span>
                                        </label>
                                      )
                                    })}
                                  </div>

                                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                                    <p className="text-[11px] font-sans text-[#7A6355]">
                                      {currentSelectedMembers.length} membre{currentSelectedMembers.length > 1 ? 's' : ''} sélectionné{currentSelectedMembers.length > 1 ? 's' : ''}.
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => saveAssignments(tpl.id, currentSelectedMembers, [])}
                                      disabled={savingAssignmentsId === tpl.id}
                                    >
                                      <Save size={13} />
                                      {savingAssignmentsId === tpl.id ? 'Sauvegarde…' : 'Sauvegarder la sélection'}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {audienceType === 'groups' && (
                            <div className="mt-4 bg-[#FAF6EF] border border-[#E8D8B8] rounded-sm p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Layers3 size={14} className="text-[#C8912A]" />
                                <p className="text-sm font-sans font-medium text-[#5C3D2E]">
                                  Groupes à sélectionner
                                </p>
                              </div>

                              {targets.groups.length === 0 ? (
                                <p className="text-xs font-sans text-[#7A6355]">
                                  Aucun groupe disponible pour le moment.
                                </p>
                              ) : (
                                <>
                                  <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-1">
                                    {targets.groups.map((group) => (
                                      <label key={group.id} className="flex items-start gap-2 text-xs font-sans text-[#5C3D2E] cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={currentSelectedGroups.includes(group.id)}
                                          onChange={() => toggleSelectedGroup(tpl.id, group.id)}
                                          className="accent-[#C8912A] mt-0.5"
                                        />
                                        <span>
                                          <span className="block">{group.name}</span>
                                          {group.description && <span className="text-[#7A6355]">{group.description}</span>}
                                        </span>
                                      </label>
                                    ))}
                                  </div>

                                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                                    <p className="text-[11px] font-sans text-[#7A6355]">
                                      {currentSelectedGroups.length} groupe{currentSelectedGroups.length > 1 ? 's' : ''} sélectionné{currentSelectedGroups.length > 1 ? 's' : ''}.
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => saveAssignments(tpl.id, [], currentSelectedGroups)}
                                      disabled={savingAssignmentsId === tpl.id}
                                    >
                                      <Save size={13} />
                                      {savingAssignmentsId === tpl.id ? 'Sauvegarde…' : 'Sauvegarder la sélection'}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
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
                          {isOpen
                            ? <ChevronUp size={16} className="text-[#7A6355]" />
                            : <ChevronDown size={16} className="text-[#7A6355]" />}
                        </button>
                      </div>
                    </div>

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
                            setQuestionForm({
                              question_text: '',
                              question_type: 'text',
                              options: '',
                              is_required: true,
                            })
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

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Nouveau questionnaire" size="md">
        <div className="space-y-4">
          <Input
            label="Titre du questionnaire *"
            name="title"
            value={createForm.title}
            onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Ex : Bilan post-stage théâtre"
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Description (optionnel)</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
              placeholder="À quoi sert ce questionnaire ?"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={createQuestionnaire}
              disabled={saving || !createForm.title}
            >
              {saving ? 'Création…' : 'Créer'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setCreateModal(false)}>Annuler</Button>
          </div>
        </div>
      </Modal>

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
              onChange={(e) => setQuestionForm((p) => ({ ...p, question_text: e.target.value }))}
              className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
              placeholder="Que retenez-vous de cette expérience ?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Type de réponse</label>
            <select
              value={questionForm.question_type}
              onChange={(e) => setQuestionForm((p) => ({ ...p, question_type: e.target.value as QuestionType }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
            >
              {Object.entries(QUESTION_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {questionForm.question_type === 'choice' && (
            <div>
              <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Options (une par ligne)</label>
              <textarea
                value={questionForm.options}
                onChange={(e) => setQuestionForm((p) => ({ ...p, options: e.target.value }))}
                className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
                placeholder={'Option 1\nOption 2\nOption 3'}
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm font-sans text-[#5C3D2E] cursor-pointer">
            <input
              type="checkbox"
              checked={questionForm.is_required}
              onChange={(e) => setQuestionForm((p) => ({ ...p, is_required: e.target.checked }))}
              className="accent-[#C8912A]"
            />
            Réponse obligatoire
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
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
