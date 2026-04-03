'use client'
// src/features/member/MemberJournalPage.tsx
// Journal libre — notes personnelles hors stage
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Feather, Trash2, Plus, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import type { GlobalNote } from '@/lib/supabase/types'

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function NoteCard({ note, onDelete }: { note: GlobalNote; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="bg-white rounded-sm border border-[#D4C4A8] p-5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <time
            dateTime={note.created_at}
            className="block text-xs font-sans text-[#C8912A] mb-2 tracking-wide"
          >
            {formatDate(note.created_at)}
          </time>
          <p className="text-sm font-sans text-[#2D1F14] leading-relaxed whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
        <div className="flex-shrink-0">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-[#D4C4A8] hover:text-red-400 rounded-sm"
              aria-label="Supprimer cette note"
            >
              <Trash2 size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(note.id)}
                className="text-xs font-sans text-red-500 hover:text-red-700 px-2 py-1 rounded-sm transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-[#7A6355] hover:text-[#5C3D2E] p-1"
                aria-label="Annuler"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export function MemberJournalPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<GlobalNote[]>([])
  const [loading, setLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [draft, setDraft] = useState('')
  const [writing, setWriting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) router.push('/connexion')
  }, [user, isLoading, router])

  const loadNotes = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/member/journal', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    if (res.ok) {
      const { notes: data } = await res.json()
      setNotes(data || [])
      setTableError(false)
    } else {
      // Table probablement absente — mode dégradé
      setTableError(true)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (user) loadNotes() }, [user, loadNotes])

  async function handleSave() {
    if (!draft.trim() || !user) return
    setSaving(true)
    const res = await fetch('/api/member/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
      body: JSON.stringify({ content: draft.trim() }),
    })
    if (res.ok) {
      setDraft('')
      setWriting(false)
      loadNotes()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!user) return
    await fetch(`/api/member/journal?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-12 bg-[#3B2315]">
        <Container>
          <Link
            href="/espace-membre"
            className="text-[#C8A888] hover:text-[#F5EDD8] transition-colors text-sm font-sans flex items-center gap-1 mb-4"
          >
            <ArrowLeft size={14} /> Mon chemin
          </Link>
          <div className="flex items-end gap-3">
            <Feather size={28} className="text-[#C8912A] mb-1" aria-hidden="true" />
            <div>
              <h1 className="font-serif text-3xl text-[#F5EDD8]">Journal</h1>
              <p className="text-sm font-sans text-[#C8A888] mt-0.5">
                Pensées libres, intuitions, prises de conscience du quotidien
              </p>
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-12">
        <Container size="md">

          {/* Erreur table absente */}
          {tableError && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-sm">
              <p className="text-sm font-sans text-amber-800 font-medium mb-1">
                Table de journal non encore créée
              </p>
              <p className="text-xs font-sans text-amber-700">
                Exécutez le fichier <code className="bg-amber-100 px-1 rounded">supabase-journal.sql</code> dans
                Supabase Dashboard → SQL Editor pour activer cette fonctionnalité.
              </p>
            </div>
          )}

          {/* Zone d'écriture */}
          <div className="mb-8">
            {!writing ? (
              <button
                onClick={() => setWriting(true)}
                className="w-full flex items-center gap-3 p-5 bg-white border border-[#D4C4A8] border-dashed rounded-sm text-[#7A6355] hover:border-[#C8912A] hover:text-[#5C3D2E] transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-full bg-[#F5EDD8] group-hover:bg-[#FFF8E8] flex items-center justify-center flex-shrink-0 transition-colors">
                  <Plus size={16} className="text-[#C8912A]" />
                </div>
                <span className="text-sm font-sans font-medium">Écrire une nouvelle note…</span>
              </button>
            ) : (
              <div className="bg-white rounded-sm border border-[#C8912A]/40 shadow-sm overflow-hidden">
                <div className="p-1 bg-[#FAF6EF] border-b border-[#D4C4A8]">
                  <p className="text-[10px] font-sans uppercase tracking-widest text-[#C8912A] px-3 py-1">
                    Nouvelle note — {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-4">
                  <textarea
                    autoFocus
                    rows={6}
                    className="w-full text-sm font-sans text-[#2D1F14] bg-transparent resize-none focus:outline-none leading-relaxed placeholder:text-[#C8A888] placeholder:italic"
                    placeholder="Qu'est-ce qui se passe en vous en ce moment ? Une pensée, une intuition, une question…"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave()
                    }}
                  />
                </div>
                <div className="flex items-center justify-between px-4 pb-4">
                  <span className="text-xs font-sans text-[#C8A888]">⌘+Entrée pour enregistrer</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setWriting(false); setDraft('') }}
                    >
                      <X size={13} /> Annuler
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSave}
                      disabled={saving || !draft.trim()}
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                      {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Liste des notes */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 && !tableError ? (
            <div className="text-center py-16">
              <Feather size={36} className="text-[#D4C4A8] mx-auto mb-4" aria-hidden="true" />
              <p className="font-serif text-lg text-[#7A6355] mb-1">Votre journal est vierge</p>
              <p className="text-sm font-sans text-[#7A6355]">La première note est toujours la plus précieuse.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs font-sans text-[#7A6355] uppercase tracking-widest">
                  {notes.length} {notes.length <= 1 ? 'entrée' : 'entrées'}
                </p>
                <div className="flex-1 h-px bg-[#D4C4A8]" />
              </div>
              {notes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </Container>
      </div>
    </>
  )
}
