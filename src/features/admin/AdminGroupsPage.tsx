'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Users, UserPlus } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { AdminBeginnerMode } from '@/features/admin/AdminBeginnerMode'

type Group = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  member_group_members?: { count: number }[]
}

type GroupMemberRow = {
  member: {
    id: string
    email: string
    first_name?: string | null
    last_name?: string | null
  }
}

type MemberRow = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
}

function getMemberLabel(member: MemberRow | GroupMemberRow['member']) {
  const fullName = [member.first_name, member.last_name].filter(Boolean).join(' ').trim()
  return fullName || member.email
}

export function AdminGroupsPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  const [groups, setGroups] = useState<Group[]>([])
  const [, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMemberRow[]>([])
  const [allMembers, setAllMembers] = useState<MemberRow[]>([])

  const [createModal, setCreateModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const [editForm, setEditForm] = useState<{ id: string; name: string; description: string }>({
    id: '',
    name: '',
    description: '',
  })

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const loadGroups = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/admin/groups', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const d = await res.json()
      setGroups(d.groups || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user || !isAdmin) return
    setTimeout(() => loadGroups(), 0)
  }, [user, isAdmin, loadGroups])

  const loadGroupMembers = async (groupId: string) => {
    if (!user) return
    const res = await fetch(`/api/admin/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    const d = await res.json()
    setGroupMembers(d.members || [])
    setSelectedGroup(groupId)
  }

  const loadAllMembers = async () => {
    if (!user) return
    const res = await fetch('/api/admin/members', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    const d = await res.json()
    setAllMembers(d.members || [])
  }

  async function createGroup() {
    if (!form.name || !user) return
    setSaving(true)

    const res = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify(form),
    })

    setSaving(false)

    if (res.ok) {
      setCreateModal(false)
      setForm({ name: '', description: '' })
      loadGroups()
    }
  }

  async function updateGroup() {
    if (!editForm.id || !user) return
    setSaving(true)

    const res = await fetch('/api/admin/groups', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify(editForm),
    })

    setSaving(false)

    if (res.ok) {
      setEditingId(null)
      loadGroups()
    }
  }

  async function deleteGroup(id: string) {
    if (!user || !confirm('Supprimer ce groupe ?')) return

    await fetch('/api/admin/groups', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({ id }),
    })

    if (selectedGroup === id) {
      setSelectedGroup(null)
      setGroupMembers([])
    }

    loadGroups()
  }

  async function addMemberToGroup(memberId: string) {
    if (!selectedGroup || !user) return

    await fetch(`/api/admin/groups/${selectedGroup}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({ member_ids: [memberId] }),
    })

    await loadGroupMembers(selectedGroup)
    await loadGroups()
  }

  async function removeMember(memberId: string) {
    if (!selectedGroup || !user) return

    await fetch(`/api/admin/groups/${selectedGroup}/members`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({ member_id: memberId }),
    })

    await loadGroupMembers(selectedGroup)
    await loadGroups()
  }

  function startEdit(g: Group) {
    setEditingId(g.id)
    setEditForm({
      id: g.id,
      name: g.name,
      description: g.description || '',
    })
  }

  const currentMemberIds = new Set(groupMembers.map((m) => m.member.id))
  const availableMembers = allMembers.filter((m) => !currentMemberIds.has(m.id))
  const selectedGroupName = groups.find((g) => g.id === selectedGroup)?.name || 'Groupe'

  if (isLoading || !user) return null

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
              <span className="text-sm font-sans text-white">Groupes</span>
            </div>
            <AdminBeginnerMode />
          </div>
        </Container>
      </div>

      <div className="py-8">
        <Container>
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] mb-1">Organisation</p>
              <h1 className="font-serif text-3xl text-[#5C3D2E]">Groupes de membres</h1>
              <p className="text-sm font-sans text-[#7A6355] mt-1">
                Créez des groupes pour cibler plus facilement vos questionnaires et parcours.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
              <Plus size={14} /> Nouveau groupe
            </Button>
          </div>

          <div className="bg-[#FFF8E8] border border-[#E0B060] rounded-sm p-4 mb-8">
            <div className="flex items-start gap-3">
              <Users size={18} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-sans font-medium text-[#5C3D2E] mb-1">À quoi servent les groupes</p>
                <p className="text-sm font-sans text-[#7A6355] leading-relaxed">
                  Les groupes vous permettent d’organiser vos membres par promotion, parcours, atelier ou thématique.
                  Vous pourrez ensuite cibler un questionnaire entier sur un groupe en un seul clic.
                </p>
              </div>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white border border-[#D4C4A8] rounded-sm p-12 text-center">
              <Users size={40} className="text-[#D4C4A8] mx-auto mb-4" />
              <p className="font-serif text-xl text-[#7A6355] mb-2">Aucun groupe créé</p>
              <p className="text-sm font-sans text-[#7A6355] mb-6">
                Commencez par créer un premier groupe pour organiser vos membres.
              </p>
              <Button variant="primary" size="md" onClick={() => setCreateModal(true)}>
                <Plus size={14} /> Créer un groupe
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => {
                const count = (g.member_group_members?.[0] as { count: number } | undefined)?.count || 0
                const isSelected = selectedGroup === g.id

                return (
                  <div key={g.id} className={`bg-white border rounded-sm p-5 ${isSelected ? 'border-[#C8912A]' : 'border-[#D4C4A8]'}`}>
                    {editingId === g.id ? (
                      <div className="space-y-3">
                        <Input
                          label="Nom du groupe"
                          name="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        />
                        <div>
                          <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Description</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                            className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="primary" size="sm" onClick={updateGroup} disabled={saving}>
                            <Save size={13} /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                            <X size={13} /> Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-serif text-lg text-[#5C3D2E]">{g.name}</h2>
                            <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#FAF6EF] text-[#7A6355] border border-[#E8D8B8]">
                              {count} membre{count > 1 ? 's' : ''}
                            </span>
                          </div>
                          {g.description && (
                            <p className="text-sm font-sans text-[#7A6355] mt-1">{g.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              loadGroupMembers(g.id)
                              loadAllMembers()
                            }}
                            className="flex items-center gap-1.5 text-xs font-sans text-[#C8912A] border border-[#C8912A] px-3 py-1.5 rounded-sm hover:bg-[#C8912A] hover:text-white transition-colors"
                          >
                            <UserPlus size={13} />
                            Gérer membres
                          </button>
                          <button
                            onClick={() => startEdit(g)}
                            className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={14} className="text-[#7A6355]" />
                          </button>
                          <button
                            onClick={() => deleteGroup(g.id)}
                            className="p-2 rounded-sm hover:bg-[#FAF6EF] transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={14} className="text-[#D4C4A8] hover:text-red-400 transition-colors" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {selectedGroup && (
            <div className="mt-10 bg-white border border-[#D4C4A8] rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F0E8DA]">
                <h3 className="font-serif text-lg text-[#5C3D2E]">Membres du groupe · {selectedGroupName}</h3>
              </div>

              <div className="grid lg:grid-cols-2 gap-0">
                <div className="p-5 border-b lg:border-b-0 lg:border-r border-[#F0E8DA]">
                  <p className="text-sm font-sans font-medium text-[#5C3D2E] mb-3">Déjà dans le groupe</p>

                  {groupMembers.length === 0 ? (
                    <p className="text-sm font-sans text-[#7A6355]">Aucun membre dans ce groupe pour le moment.</p>
                  ) : (
                    <div className="space-y-2">
                      {groupMembers.map((m) => (
                        <div key={m.member.id} className="flex items-center justify-between gap-3 border border-[#E8D8B8] bg-[#FAF6EF] rounded-sm px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-sans text-[#5C3D2E] truncate">{getMemberLabel(m.member)}</p>
                            <p className="text-xs font-sans text-[#7A6355] truncate">{m.member.email}</p>
                          </div>
                          <button
                            onClick={() => removeMember(m.member.id)}
                            className="text-xs font-sans text-red-500 hover:text-red-700 transition-colors"
                          >
                            Retirer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-sm font-sans font-medium text-[#5C3D2E] mb-3">Ajouter un membre</p>

                  {availableMembers.length === 0 ? (
                    <p className="text-sm font-sans text-[#7A6355]">Tous les membres disponibles sont déjà dans ce groupe.</p>
                  ) : (
                    <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                      {availableMembers.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-3 border border-[#E8D8B8] bg-white rounded-sm px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-sans text-[#5C3D2E] truncate">{getMemberLabel(m)}</p>
                            <p className="text-xs font-sans text-[#7A6355] truncate">{m.email}</p>
                          </div>
                          <button
                            onClick={() => addMemberToGroup(m.id)}
                            className="text-xs font-sans text-[#C8912A] hover:text-[#5C3D2E] transition-colors"
                          >
                            Ajouter
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Créer un groupe" size="md">
        <div className="space-y-4">
          <Input
            label="Nom du groupe *"
            name="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ex : Promotion printemps 2026"
            required
          />
          <div>
            <label className="block text-sm font-medium text-[#5C3D2E] mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full text-sm font-sans border border-[#D4C4A8] rounded-sm p-3 resize-y min-h-[80px] focus:outline-none focus:border-[#C8912A]"
              placeholder="Ex : Membres du cycle d’initiation du printemps."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="md" onClick={createGroup} disabled={saving || !form.name}>
              {saving ? 'Création…' : 'Créer'}
            </Button>
            <Button variant="ghost" size="md" onClick={() => setCreateModal(false)}>Annuler</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
