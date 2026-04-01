'use client'
// src/features/auth/MemberDashboard.tsx
import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { User, Calendar, Bell, Lock } from 'lucide-react'
import Link from 'next/link'

const menuItems = [
  { icon: <User size={20} />, label: 'Mon profil', href: '/espace-membre/profil', description: 'Gérer vos informations personnelles' },
  { icon: <Calendar size={20} />, label: 'Mes réservations', href: '/espace-membre/reservations', description: 'Historique et réservations à venir' },
  { icon: <Bell size={20} />, label: 'Newsletter', href: '/espace-membre/newsletter', description: 'Gérer vos préférences email' },
]

export function MemberDashboard() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <>
      <div className="pt-32 pb-16 bg-[#5C3D2E]">
        <Container>
          <div className="text-center">
            <p className="text-xs font-sans tracking-widest uppercase text-[#C8912A] mb-4">Bienvenue</p>
            <h1 className="font-serif text-4xl text-[#F5EDD8]">Espace membre</h1>
          </div>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16">
        <Container size="md">
          {/* Auth notice */}
          <div
            className="mb-10 p-6 bg-[#F5EDD8] border border-[#D4C4A8] rounded-sm"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            <div className="flex items-start gap-3">
              <Lock size={20} className="text-[#C8912A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-serif text-lg text-[#5C3D2E] mb-1">Espace en cours d&apos;ouverture</p>
                <p className="text-sm font-sans text-[#7A6355] leading-relaxed">
                  L&apos;espace membre est en cours de configuration. Il vous permettra prochainement de gérer vos réservations, votre profil et vos préférences newsletter.
                </p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {menuItems.map((item, i) => (
              <div
                key={item.href}
                style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms` }}
              >
                <Link href={item.href} className="group block p-6 bg-white rounded-sm border border-[#D4C4A8] hover:border-[#C8912A]/50 hover:shadow-md transition-all duration-200">
                  <div className="text-[#C8912A] mb-3">{item.icon}</div>
                  <h2 className="font-serif text-lg text-[#5C3D2E] group-hover:text-[#C8912A] transition-colors mb-1">{item.label}</h2>
                  <p className="text-xs font-sans text-[#7A6355]">{item.description}</p>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button href="/activites" variant="outline" size="md">Découvrir les activités</Button>
          </div>
        </Container>
      </div>
    </>
  )
}
