'use client'
// src/features/admin/AdminMembersPage.tsx
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, User, ChevronRight, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import type { Profile } from '@/lib/supabase/types'

type MemberWithStats = Profile & {
  stage_logs: [{ count: number }]
  reservations: [{ count: number }]
}

export function AdminMembersPage() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<MemberWithStats[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => { setVisible(true) }, [])
  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/connexion')
      else if (!isAdmin) router.push('/espace-membre')
    }
  }, [user, isAdmin, isLoading, router])

  const loadMembers = useCallback(async () => {
    if (!user) return
    const url = search ? `/api/admin/members?q=${encodeURIComponent(search)}` : '/api/admin/members'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${user.accessToken}` } })
    if (res.ok) {
      const { members } = await res.json()
      setMembers(members || [])
    }
    setLoading(false)
  }, [user, search])

  useEffect(() => {
    if (user && isAdmin) loadMembers()
  }, [user, isAdmin, loadMembers])

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
          <div className="flex items-center gap-3 py-4">
            <Link href="/admin" className="text-[#C8A888] hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <Link href="/" className="font-serif text-lg text-[#F5EDD8] hover:text-[#C8912A] transition-colors">
              Les Ateliers de la Source
            </Link>
            <span className="text-[#7A6355]">/</span>
            <Link href="/admin" className="text-sm font-sans text-[#C8A888] hover:text-white transition-colors">Admin</Link>
            <span className="text-[#7A6355]">/</span>
            <span className="text-sm font-sans text-white">Membres</span>
          </div>
        </Container>
      </div>

      <div className="py-10">
        <Container>
          <div
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            {/* Titre + recherche */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <h1 className="font-serif text-3xl text-[#5C3D2E]">Membres</h1>
                <p className="text-sm font-sans text-[#7A6355] mt-1">{members.length} membre{members.length !== 1 ? 's' : ''} inscrit{members.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6355]" />
                <input
                  type="search"
                  placeholder="Rechercher un membre…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm font-sans border border-[#D4C4A8] rounded-sm bg-white focus:outline-none focus:border-[#C8912A] w-64"
                />
              </div>
            </div>

            {/* Table membres */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
                <User size={40} className="text-[#D4C4A8] mx-auto mb-4" />
                <h2 className="font-serif text-xl text-[#5C3D2E] mb-2">
                  {search ? 'Aucun membre trouvé' : 'Aucun membre pour le moment'}
                </h2>
                <p className="text-sm font-sans text-[#7A6355]">
                  {search ? `Aucun résultat pour "${search}"` : 'Les membres apparaîtront ici après leur inscription.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-sm border border-[#D4C4A8] overflow-hidden">
                {/* Header tableau */}
                <div className="hidden md:grid grid-cols-[1fr_1fr_80px_80px_40px] gap-4 px-5 py-3 bg-[#F5EDD8] border-b border-[#D4C4A8] text-xs font-sans uppercase tracking-wider text-[#7A6355]">
                  <span>Membre</span>
                  <span>Email</span>
                  <span>Stages</span>
                  <span>Inscrit le</span>
                  <span></span>
                </div>

                {members.map((member, i) => {
                  const stagesCount = member.stage_logs?.[0]?.count || 0
                  const name = [member.first_name, member.last_name].filter(Boolean).join(' ') || '—'
                  const initials = [(member.first_name || '?')[0], (member.last_name || '')[0]].filter(Boolean).join('').toUpperCase() || '?'
                  const joinDate = new Date(member.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

                  return (
                    <Link
                      key={member.id}
                      href={`/admin/membres/${member.id}`}
                      className="flex md:grid md:grid-cols-[1fr_1fr_80px_80px_40px] gap-4 items-center px-5 py-4 border-b border-[#D4C4A8]/50 last:border-0 hover:bg-[#FAF6EF] transition-colors group"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      {/* Avatar + nom */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white text-sm font-sans font-medium flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-sans font-medium text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors truncate">{name}</p>
                          {member.role === 'admin' && (
                            <span className="text-xs font-sans text-[#C8912A] bg-[#FFF8E8] px-1.5 py-0.5 rounded-full">Admin</span>
                          )}
                        </div>
                      </div>
                      {/* Email */}
                      <div className="hidden md:flex items-center gap-1.5 min-w-0">
                        <Mail size={13} className="text-[#7A6355] flex-shrink-0" />
                        <span className="text-sm font-sans text-[#7A6355] truncate">{member.email}</span>
                      </div>
                      {/* Nb stages */}
                      <div className="hidden md:block">
                        <span className="text-sm font-sans text-[#5C3D2E] font-medium">{stagesCount}</span>
                      </div>
                      {/* Date */}
                      <div className="hidden md:block">
                        <span className="text-xs font-sans text-[#7A6355]">{joinDate}</span>
                      </div>
                      {/* Chevron */}
                      <ChevronRight size={16} className="text-[#D4C4A8] group-hover:text-[#C8912A] transition-colors flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  )
}
