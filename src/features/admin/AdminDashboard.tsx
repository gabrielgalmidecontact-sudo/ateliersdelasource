'use client'
// src/features/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, FileText, Calendar, Settings, LogOut, ChevronRight, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'

export function AdminDashboard() {
  const { user, profile, isAdmin, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ members: 0, stages: 0, reservations: 0 })
  const [visible, setVisible] = useState(true)

  useEffect(() => { setVisible(true) }, [])

  useEffect(() => {
    if (!isLoading) {
      if (!user) { router.push('/connexion'); return }
      if (!isAdmin) { router.push('/espace-membre') }
    }
  }, [user, isAdmin, isLoading, router])

  useEffect(() => {
    if (!user || !isAdmin) return
    // Charger les stats de base
    fetch('/api/admin/members', {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    }).then(r => r.json()).then(data => {
      if (data.members) setStats(s => ({ ...s, members: data.members.length }))
    })
  }, [user, isAdmin])

  if (isLoading || !user) return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const adminCards = [
    {
      href: '/admin/membres',
      icon: <Users size={24} />,
      label: 'Membres',
      value: stats.members,
      description: 'Gérer les comptes et fiches de suivi',
      color: '#5C3D2E',
    },
    {
      href: '/evenements',
      icon: <Calendar size={24} />,
      label: 'Événements',
      value: null,
      description: 'Voir l\'agenda et les inscriptions',
      color: '#C8912A',
    },
    {
      href: '/blog',
      icon: <FileText size={24} />,
      label: 'Blog',
      value: null,
      description: 'Articles et actualités',
      color: '#4A5E3A',
    },
    {
      href: '/studio',
      icon: <Settings size={24} />,
      label: 'Sanity Studio',
      value: null,
      description: 'Modifier le contenu du site',
      color: '#7A6355',
      external: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {/* Header admin */}
      <div className="bg-[#3B2315] border-b border-[#5C3D2E]">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-serif text-lg text-[#F5EDD8] hover:text-[#C8912A] transition-colors">
                Les Ateliers de la Source
              </Link>
              <span className="text-[#7A6355]">/</span>
              <span className="text-sm font-sans text-[#C8A888]">Administration</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-sans text-[#C8A888]">{profile?.first_name || user.email}</span>
              <button
                onClick={async () => { await signOut(); router.push('/') }}
                className="flex items-center gap-1.5 text-xs font-sans text-[#C8A888] hover:text-white transition-colors"
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      <div className="py-12">
        <Container>
          <div
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            <div className="mb-10">
              <p className="text-xs font-sans uppercase tracking-widest text-[#C8912A] mb-1">Tableau de bord</p>
              <h1 className="font-serif text-4xl text-[#5C3D2E]">Bonjour, {profile?.first_name || 'Gabriel'} 👋</h1>
              <p className="text-sm font-sans text-[#7A6355] mt-1">Panneau d&apos;administration — Les Ateliers de la Source</p>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: 'Membres inscrits', value: stats.members, icon: <Users size={18} /> },
                { label: 'Fiches de suivi', value: stats.stages, icon: <FileText size={18} /> },
                { label: 'Réservations', value: stats.reservations, icon: <TrendingUp size={18} /> },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-sm border border-[#D4C4A8] p-5 text-center">
                  <div className="text-[#C8912A] flex justify-center mb-2">{stat.icon}</div>
                  <div className="font-serif text-3xl text-[#5C3D2E] mb-1">{stat.value}</div>
                  <div className="text-xs font-sans text-[#7A6355]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Actions admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {adminCards.map((card, i) => (
                <div
                  key={card.href}
                  style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms` }}
                >
                  <Link
                    href={card.href}
                    target={card.external ? '_blank' : undefined}
                    rel={card.external ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-5 p-6 bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/60 hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: card.color + '15', color: card.color }}
                    >
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="font-serif text-lg text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">
                          {card.label}
                        </h2>
                        {card.value !== null && (
                          <span className="text-sm font-sans font-bold text-[#C8912A] bg-[#FFF8E8] px-2 py-0.5 rounded-full">
                            {card.value}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-sans text-[#7A6355] mt-0.5">{card.description}</p>
                    </div>
                    <ChevronRight size={18} className="text-[#D4C4A8] group-hover:text-[#C8912A] transition-colors flex-shrink-0" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
