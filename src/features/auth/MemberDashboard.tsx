'use client'
// src/features/auth/MemberDashboard.tsx — version connectée Supabase
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Calendar, Bell, FileText, LogOut, Lock, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

const menuItems = [
  {
    icon: <User size={22} />,
    label: 'Mon profil',
    href: '/espace-membre/profil',
    description: 'Informations personnelles, motivation',
    color: '#5C3D2E',
  },
  {
    icon: <FileText size={22} />,
    label: 'Mon parcours',
    href: '/espace-membre/suivi',
    description: 'Fiches de suivi, journal de stages',
    color: '#4A5E3A',
  },
  {
    icon: <Calendar size={22} />,
    label: 'Mes réservations',
    href: '/espace-membre/reservations',
    description: 'Stages inscrits et historique',
    color: '#C8912A',
  },
  {
    icon: <Bell size={22} />,
    label: 'Newsletter',
    href: '/espace-membre/newsletter',
    description: 'Préférences de communication',
    color: '#5C3D2E',
  },
]

export function MemberDashboard() {
  const { user, profile, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [visible, setVisible] = useState(true)

  useEffect(() => { setVisible(true) }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion')
    }
  }, [user, isLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = profile?.first_name || user.email.split('@')[0]

  return (
    <>
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <div
            className="flex items-end justify-between flex-wrap gap-4"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            <div>
              <p className="text-xs font-sans tracking-widest uppercase text-[#C8912A] mb-2">Espace membre</p>
              <h1 className="font-serif text-4xl text-[#F5EDD8]">Bonjour, {firstName} 👋</h1>
              <p className="text-sm font-sans text-[#C8A888] mt-2">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-sans text-[#C8A888] hover:text-white transition-colors"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16">
        <Container size="md">

          {/* Compléter le profil si vide */}
          {!profile?.first_name && (
            <div
              className="mb-8 p-5 bg-[#FFF8E8] border border-[#E0B060] rounded-sm flex items-start gap-3"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 100ms' }}
            >
              <Lock size={18} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-sans font-medium text-[#5C3D2E] text-sm mb-1">
                  Complétez votre profil
                </p>
                <p className="text-xs font-sans text-[#7A6355]">
                  Ajoutez votre prénom et quelques infos pour personnaliser votre espace.
                </p>
                <Link href="/espace-membre/profil" className="mt-2 inline-block text-xs font-sans text-[#C8912A] font-medium hover:underline">
                  Compléter →
                </Link>
              </div>
            </div>
          )}

          {/* Menu cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map((item, i) => (
              <div
                key={item.href}
                style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: `opacity 0.5s ease ${i * 70}ms, transform 0.5s ease ${i * 70}ms` }}
              >
                <Link
                  href={item.href}
                  className="group flex items-center gap-5 p-6 bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/60 hover:shadow-md transition-all duration-200"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: item.color + '15', color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif text-lg text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors">{item.label}</h2>
                    <p className="text-xs font-sans text-[#7A6355] mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-[#D4C4A8] group-hover:text-[#C8912A] transition-colors flex-shrink-0" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button href="/evenements" variant="outline" size="md">
              Voir les prochains stages
            </Button>
          </div>
        </Container>
      </div>
    </>
  )
}
