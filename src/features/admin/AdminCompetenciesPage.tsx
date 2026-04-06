'use client'
// src/features/admin/AdminCompetenciesPage.tsx
// Gestion du référentiel de compétences — admin
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Award } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { AdminBeginnerMode } from '@/features/admin/AdminBeginnerMode'
import type { Competency } from '@/lib/supabase/types'

const CATEGORY_OPTIONS = [
  { value: 'corps',      label: '🌿 Corps' },
  { value: 'voix',       label: '🎙️ Voix' },
  { value: 'relation',   label: '👥 Relation' },
  { value: 'émotions',   label: '🌊 Émotions' },
  { value: 'intérieur',  label: '✨ Intérieur' },
  { value: 'création',   label: '🎨 Création' },
  { value: 'général',    label: '📋 Général' },
]

const ICON_OPTIONS = ['🌿', '🎙️', '👥', '🌊', '✨', '🎨', '📋', '🌱', '🔥', '💡', '🎭', '🌟', '🧠', '💪', '🎯']

export function AdminCompetenciesPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Modal créer
  const [createModal, setCreateModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'général',
    icon: '📋',
    sort_order: 0,
  })
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Competency> & { id: string }>({ id: '' })

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const loadCompetencies = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/admin/competencies', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setCompetencies(d.competencies || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (user && isAdmin) loadCompetencies() }, [user, isAdmin, loadCompetencies])

  async function createCompetency() {
    if (!form.name || !user) return
    setSaving(true)
    const res = await fetch('/api/admin/competencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        category: form.category || null,
        icon: form.icon || null,
        sort_order: form.sort_order || competencies.length + 1,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setCreateModal(false)
      setForm({ name: '', description: '', category: 'général', icon: '📋', sort_order: 0 })
      loadCompetencies()
    }
  }

  async function updateCompetency() {
    if (!editForm.id || !user) return
    setSaving(true)
    const res = await fetch('/api/admin/competencies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify(editForm),
    })
    setSaving(false)
    if (res.ok) {
      setEditingId(null)
      loadCompetencies()
    }
  }

  async function deleteCompetency(id: string) {
    if (!user || !confirm('Supprimer cette compétence ? Cela effacera aussi toutes les compétences membres associées.')) return
    await fetch('/api/admin/competencies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({ id }),
    })
    loadCompetencies()
  }

  function startEdit(comp: Competency) {
    setEditingId(comp.id)
    setEditForm({
      id: comp.id,
      name: comp.name,
      description: comp.description || '',
      category: comp.category || 'général',
      icon: comp.icon || '📋',
      sort_order: comp.sort_order,
    })
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
              <span className="text-sm font-sans text-white">Compétences</span>
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
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Référentiel</p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">Compétences</h1>
              <p className="text-sm font-sans text-[#7A6355] mt-1">
                Définissez les compétences que vous suivez et validez chez vos membres.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
              <Plus size={15} /> Ajouter une compétence
            </Button>
          </div>

          {/* Guide */}
          <div className="bg-[#FFF8E8] border border-[#E0B060] rounded-sm p-4 mb-8">
            <div className="flex items-start gap-3">
              <Award size={18} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-sans font-medium text-[#5C3D2E] mb-1">Comment ça fonctionne</p>
                <p className="text-sm font-sans text-[#7A6355] leading-relaxed">
                  Ces compétences constituent votre référentiel personnel. Vous pouvez ensuite les assigner à chaque membre
                  depuis sa fiche, définir son niveau (0–100%) et les <strong>valider</strong> quand il les maîtrise.
                  Le membre voit ses compétences dans son Livre de Bord.
                </p>
              </div>
            </div>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : competencies.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
              <Award size={40} className="text-[#D4C4A8] mx-auto mb-4" />
              <p className="font-serif text-xl text-[#7A6355] mb-2">Aucune compétence définie</p>
              <p className="text-sm font-sans text-[#7A6355] mb-6 max-w-md mx-auto">
                Commencez par définir les compétences que vous souhaitez suivre :
                présence corporelle, expression orale, confiance en soi…
              </p>
              <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
                <Plus size={15} /> Créer ma première compétence
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {competencies.map(comp => (
                <div key={comp.id} className="bg-white rounded-sm border border-[#D4C4A8] p-5">
                  {editingId === comp.id ? (
                    // Mode édition inline
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={editForm.icon || '📋'}
                          onChange={e => setEditForm(p => ({ ...p, icon: e.target.value }))}
                          className="text-xl border border-[#D4C4A8] rounded-sm p-1 focus:outline-none focus:border-[#C8912A] bg-[#FAF6EF]"
                        >
                          {ICON_OPTIONS.map(ico => <option key={ico} value={ico}>{ico}</option>)}
                        </select>
                        <input
                          value={editForm.name || ''}
                          onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                          className="flex-1 text-sm font-sans border border-[#D4C4A8] rounded-sm px-2 py-1.5 focus:outline-none focus:border-[#C8912A]"
                          placeholder="Nom de la compétence"
                        />
                      </div>
                      <input
                        value={editForm.description || ''}
                        onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full text-xs font-sans border border-[#D4C4A8] rounded-sm px-2 py-1.5 focus:outline-none focus:border-[#C8912A]"
                        placeholder="Description (optionnel)"
                      />
                      <select
                        value={editForm.category || 'général'}
                        onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                        className="w-full text-xs font-sans border border-[#D4C4A8] rounded-sm px-2 py-1.5 focus:outline-none focus:border-[#C8912A] bg-[#FAF6EF]"
                      >
                        {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={updateCompetency}
                          disabled={saving}
                          className="flex items-center gap-1 text-xs font-sans text-white bg-[#C8912A] px-3 py-1.5 rounded-sm hover:bg-[#B07820] transition-colors disabled:opacity-60"
                        >
                          <Save size={12} /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 text-xs font-sans text-[#7A6355] border border-[#D4C4A8] px-3 py-1.5 rounded-sm hover:border-[#C8912A] transition-colors"
                        >
                          <X size={12} /> Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {comp.icon && <span className="text-2xl leading-none">{comp.icon}</span>}
                          <div>
                            <h3 className="font-serif text-base text-[#5C3D2E] leading-tight">{comp.name}</h3>
                            {comp.category && (
                              <span className="text-[10px] font-sans text-[#7A6355] uppercase tracking-wide">
                                {comp.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(comp)}
                            className="p-1.5 text-[#D4C4A8] hover:text-[#C8912A] transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteCompetency(comp.id)}
                            className="p-1.5 text-[#D4C4A8] hover:text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      {comp.description && (
                        <p className="text-xs font-sans text-[#7A6355] leading-relaxed">{comp.description}</p>
                      )}
                      <p className="text-[10px] font-sans text-[#D4C4A8] mt-2">Ordre : {comp.sort_order}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Container>
      </div>

      {/* Modal créer compétence */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Nouvelle compétence" size="md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Icône</label>
              <select
                value={form.icon}
                onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                className="text-2xl border border-[#D4C4A8] rounded-sm p-2 focus:outline-none focus:border-[#C8912A] bg-[#FAF6EF]"
              >
                {ICON_OPTIONS.map(ico => <option key={ico} value={ico}>{ico}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <Input
                label="Nom de la compétence *"
                name="name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex : Présence corporelle"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Description (optionnel)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
              placeholder="Qu'est-ce que cette compétence implique concrètement ?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Catégorie</label>
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-3 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-[#FAF6EF] focus:outline-none focus:border-[#C8912A] text-[#2D1F14]"
            >
              {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" onClick={createCompetency} disabled={saving || !form.name}>
              {saving ? 'Création…' : 'Créer'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setCreateModal(false)}>Annuler</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
