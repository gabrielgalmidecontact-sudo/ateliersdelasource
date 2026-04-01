// src/app/not-found.tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
      <Container size="sm">
        <div className="text-center py-20">
          <p className="font-serif text-8xl text-[#D4C4A8] mb-6">404</p>
          <h1 className="font-serif text-3xl text-[#5C3D2E] mb-4">Page introuvable</h1>
          <p className="text-base font-sans text-[#7A6355] mb-8 leading-relaxed">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/" variant="primary" size="md">Retour à l&apos;accueil</Button>
            <Button href="/activites" variant="outline" size="md">Voir les activités</Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
