'use client'
// src/features/auth/MemberReservationsPage.tsx
import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Calendar } from 'lucide-react'

export function MemberReservationsPage() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <>
      <div className="pt-32 pb-12 bg-[#5C3D2E]">
        <Container>
          <a href="/espace-membre" className="text-[#C8A888] hover:text-[#F5EDD8] transition-colors text-sm font-sans flex items-center gap-1 mb-3">
            <ArrowLeft size={14} /> Espace membre
          </a>
          <h1 className="font-serif text-3xl text-[#F5EDD8]">Mes réservations</h1>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16">
        <Container size="sm">
          <div
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F5EDD8] flex items-center justify-center mx-auto mb-5">
                <Calendar size={28} className="text-[#C8912A]" />
              </div>
              <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Aucune réservation pour le moment</h2>
              <p className="text-sm font-sans text-[#7A6355] max-w-xs mx-auto mb-6 leading-relaxed">
                Vos futures réservations de stages, ateliers et spectacles apparaîtront ici une fois le système de paiement activé.
              </p>
              <Button href="/evenements" variant="outline" size="md">Voir les prochains stages</Button>
            </div>

            <div className="mt-6 p-5 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
              <p className="text-xs font-sans text-[#7A6355]">
                <span className="font-medium text-[#5C3D2E]">Pour vous inscrire à un stage : </span>
                Utilisez le formulaire de contact sur chaque page de stage, ou contactez directement Gabriel ou Amélie.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}
