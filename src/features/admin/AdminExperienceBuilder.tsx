'use client'
// src/features/admin/AdminExperienceBuilder.tsx
// Créer et gérer les expériences (entités centrales Phase 2)
// Interface simple et humaine pour Gabriel

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Trash2, Edit2, Save, X,
  Users, Calendar, BookOpen, Sparkles, CheckCircle, Circle
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { AdminBeginnerMode } from '@/features/admin/AdminBeginnerMode'
import type { Experience } from '@/lib/supabase/types'

const TYPE_OPTIONS = [
  { value: 'stage',           label: '🎭 Stage',           desc: 'Stage de théâtre, danse, voix' },
  { value: 'formation',       label: '📚 Formation',        desc: 'Formation continue, certification' },
  { value: 'activite',        label: '🌿 Activité',         desc: 'Atelier, pratique, exercice collectif' },
  { value: 'exercice',        label: '🧘 Exercice',         desc: 'Exercice personnel guidé' },
  { value: 'validation',      label: '✓ Validation',        desc: 'Bilan, évaluation, validation' },
  { value: 'accompagnement',  label: '💬 Accompagnement',   desc: 'Séance individuelle, coaching' },
  { value: 'autre',           label: '✦ Autre',             desc: 'Autre type d\'expérience' },
]

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  TYPE_OPTIONS.map(t => [t.value, t.label])
)

const EMPTY_FORM = {
  title: '',
  type: 'stage' as Experience['type'],
  description: '',
  start_date: '',
  end_date: '',
  trainer: 'Gabriel',
  max_participants: '',
  is_active: true,
}

export function AdminExperienceBuilder() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const load = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/admin/experiences', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setExperiences(d.experiences || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (user && isAdmin) load() }, [user, isAdmin, load])

  async function save() {
    if (!user || !form.title) return
    setSaving(true)
    const method = editingId ? 'PATCH' : 'POST'
    const body = {
      ...(editingId ? { id: editingId } : {}),
      title: form.title,
      type: form.type,
      description: form.description || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      trainer: form.trainer || 'Gabriel',
      max_participants: form.max_participants ? Number(form.max_participants) : null,
      is_active: form.is_active,
    }
    const res = await fetch('/api/admin/experiences', {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) {
      setCreateModal(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      load()
    }
  }

  async function toggleActive(exp: Experience) {
    if (!user) return
    await fetch('/api/admin/experiences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({ id: exp.id, is_active: !exp.is_active }),
    })
    load()
  }

  async function deleteExp(id: string) {
    if (!user || !confirm('Supprimer cette expérience ?')) return
    await fetch('/api/admin/experiences', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({ id }),
    })
    load()
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setCreateModal(true)
  }

  function openEdit(exp: Experience) {
    setEditingId(exp.id)
    setForm({
      title: exp.title,
      type: exp.type,
      description: exp.description || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      trainer: exp.trainer || 'Gabriel',
      max_participants: exp.max_participants ? String(exp.max_participants) : '',
      is_active: exp.is_active,
    })
    setCreateModal(true)
  }

  const filtered = experiences.filter(e => {
    if (filter === 'active')   return e.is_active
    if (filter === 'inactive') return !e.is_active
    return true
  })

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
              <span className="text-sm font-sans text-white">Expériences</span>
            </div>
            <AdminBeginnerMode />
          </div>
        </Container>
      </div>

      <div className="py-8">
        <Container>

          {/* En-tête */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Administration</p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">Expériences</h1>
              <p className="text-sm font-sans text-[#7A6355] mt-1">
                Créez les expériences que vous proposez — stages, ateliers, formations, accompagnements.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={openCreate}>
              <Plus size={15} /> Nouvelle expérience
            </Button>
          </div>

          {/* Bloc d'aide contextuelle */}
          {experiences.length === 0 && !loading && (
            <div className="mb-8 p-5 bg-[#FFF8E8] border border-[#E0B060]/60 rounded-sm">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-sans font-medium text-[#5C3D2E] mb-1">
                    Par où commencer ?
                  </p>
                  <p className="text-sm font-sans text-[#7A6355] leading-relaxed mb-3">
                    Une expérience est l&apos;unité centrale de suivi. Créez-en une pour chaque stage ou atelier, puis assignez des membres.
                    Les questionnaires et compétences pourront y être rattachés.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['1. Créer une expérience', '2. Assigner des membres', '3. Suivre la progression'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-sans text-[#5C3D2E]">
                        <div className="w-5 h-5 rounded-full bg-[#C8912A] text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                          {i + 1}
                        </div>
                        {s.slice(3)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtres */}
          {experiences.length > 0 && (
            <div className="flex gap-2 mb-6">
              {(['all', 'active', 'inactive'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-sans px-3 py-1.5 rounded-sm border transition-colors ${
                    filter === f
                      ? 'bg-[#5C3D2E] text-white border-[#5C3D2E]'
                      : 'text-[#7A6355] border-[#D4C4A8] hover:border-[#5C3D2E]'
                  }`}
                >
                  {f === 'all' ? `Toutes (${experiences.length})` : f === 'active' ? `Actives (${experiences.filter(e => e.is_active).length})` : `Inactives (${experiences.filter(e => !e.is_active).length})`}
                </button>
              ))}
            </div>
          )}

          {/* Liste */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
              <BookOpen size={36} className="text-[#D4C4A8] mx-auto mb-4" />
              <p className="font-serif text-xl text-[#7A6355] mb-2">
                {experiences.length === 0 ? 'Aucune expérience créée' : 'Aucune expérience dans cette catégorie'}
              </p>
              {experiences.length === 0 && (
                <Button variant="primary" size="sm" onClick={openCreate} className="mt-4">
                  <Plus size={13} /> Créer ma première expérience
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(exp => (
                <div key={exp.id} className="bg-white rounded-sm border border-[#D4C4A8] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="font-serif text-lg text-[#5C3D2E]">{exp.title}</h2>
                        <span className="text-xs font-sans text-[#7A6355] bg-[#F5EDD8] px-2 py-0.5 rounded-full">
                          {TYPE_LABELS[exp.type] || exp.type}
                        </span>
                        <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full border ${
                          exp.is_active
                            ? 'bg-[#F0F5EC] text-[#4A5E3A] border-[#B8D4A8]'
                            : 'bg-[#F5F5F5] text-[#7A6355] border-[#D4C4A8]'
                        }`}>
                          {exp.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-sm font-sans text-[#7A6355] mb-2 leading-relaxed">{exp.description}</p>
                      )}
                      <div className="flex items-center gap-4 flex-wrap text-xs font-sans text-[#7A6355]">
                        {exp.trainer && (
                          <span className="flex items-center gap-1">
                            <Users size={11} /> {exp.trainer}
                          </span>
                        )}
                        {exp.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(exp.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {exp.end_date && exp.end_date !== exp.start_date && (
                              <> → {new Date(exp.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</>
                            )}
                          </span>
                        )}
                        {exp.max_participants && (
                          <span>{exp.max_participants} participants max</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(exp)}
                        title={exp.is_active ? 'Désactiver' : 'Activer'}
                        className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors"
                      >
                        {exp.is_active
                          ? <CheckCircle size={16} className="text-[#4A5E3A]" />
                          : <Circle size={16} className="text-[#D4C4A8]" />}
                      </button>
                      <button
                        onClick={() => openEdit(exp)}
                        className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={15} className="text-[#7A6355] hover:text-[#C8912A] transition-colors" />
                      </button>
                      <button
                        onClick={() => deleteExp(exp.id)}
                        className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={15} className="text-[#D4C4A8] hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </div>

      {/* Modal création / édition */}
      <Modal
        isOpen={createModal}
        onClose={() => { setCreateModal(false); setEditingId(null); setForm(EMPTY_FORM) }}
        title={editingId ? 'Modifier l\'expérience' : 'Nouvelle expérience'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Titre *"
            name="title"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Ex : Théâtre des Doubles Karmiques — Printemps 2025"
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-2">Type d&apos;expérience</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, type: opt.value as Experience['type'] }))}
                  className={`text-left px-3 py-2 rounded-sm border text-xs font-sans transition-colors ${
                    form.type === opt.value
                      ? 'border-[#C8912A] bg-[#FFF8E8] text-[#5C3D2E]'
                      : 'border-[#D4C4A8] text-[#7A6355] hover:border-[#C8912A]'
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-[10px] text-[#7A6355] mt-0.5 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
              placeholder="Décrivez l'expérience en quelques mots…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Date de début</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Date de fin</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Formateur</label>
              <select
                value={form.trainer}
                onChange={e => setForm(p => ({ ...p, trainer: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
              >
                <option value="Gabriel">Gabriel</option>
                <option value="Amélie">Amélie</option>
                <option value="Gabriel & Amélie">Gabriel & Amélie</option>
              </select>
            </div>
            <Input
              label="Max participants"
              name="max_participants"
              type="number"
              value={form.max_participants}
              onChange={e => setForm(p => ({ ...p, max_participants: e.target.value }))}
              placeholder="Ex : 12"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-sans text-[#5C3D2E] cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="accent-[#4A5E3A]"
            />
            Expérience active (visible par les membres)
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" onClick={save} disabled={saving || !form.title}>
              {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer l\'expérience'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => { setCreateModal(false); setEditingId(null); setForm(EMPTY_FORM) }}>
              <X size={13} /> Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
