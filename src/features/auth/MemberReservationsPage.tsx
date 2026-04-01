'use client'
// src/features/auth/MemberReservationsPage.tsx
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'

export function MemberReservationsPage() {
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Empty state */}
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F5EDD8] flex items-center justify-center mx-auto mb-5">
                <Calendar size={28} className="text-[#C8912A]" />
              </div>
              <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Aucune réservation pour le moment</h2>
              <p className="text-sm font-sans text-[#7A6355] max-w-xs mx-auto mb-6 leading-relaxed">
                Vos futures réservations de stages, ateliers et spectacles apparaîtront ici une fois le système de paiement activé.
              </p>
              <Button href="/evenements" variant="outline" size="md">
                Voir les prochains stages
              </Button>
            </div>

            {/* Future reservations will render here */}
            {/* Example card structure (hidden for now):
            <div className="mt-6 bg-white rounded-sm border border-[#D4C4A8] p-6 flex items-start gap-4">
              <div className="flex-shrink-0 w-14 bg-[#5C3D2E] rounded-sm flex flex-col items-center justify-center py-3">
                <span className="font-serif text-2xl font-bold text-[#F5EDD8]">06</span>
                <span className="text-xs text-[#C8912A]">juin</span>
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#5C3D2E]">Théâtre des Doubles Karmiques</h3>
                <p className="text-sm text-[#7A6355] mt-1 flex items-center gap-1">
                  <Clock size={12} /> 3 jours et demi · Les Ateliers de la Source
                </p>
              </div>
            </div>
            */}

            <div className="mt-6 p-5 bg-[#F5EDD8] rounded-sm border border-[#D4C4A8]">
              <p className="text-xs font-sans text-[#7A6355]">
                <span className="font-medium text-[#5C3D2E]">Pour vous inscrire à un stage : </span>
                Utilisez le formulaire de contact sur chaque page de stage, ou contactez directement Gabriel ou Amélie.
              </p>
            </div>
          </motion.div>
        </Container>
      </div>
    </>
  )
}
