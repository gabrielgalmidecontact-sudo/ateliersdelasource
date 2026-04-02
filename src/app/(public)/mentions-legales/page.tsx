// src/app/(public)/mentions-legales/page.tsx
import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = { title: 'Mentions légales' }

export default function MentionsLegales() {
  return (
    <div className="bg-[#FAF6EF] pt-32 pb-24">
      <Container size="sm">
        <h1 className="font-serif text-3xl text-[#5C3D2E] mb-8">Mentions légales</h1>
        <div className="prose-source space-y-6 text-sm font-sans text-[#2D1F14]">
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Éditeur du site</h2>
            <p>Les Ateliers de la Source<br />Contact : contact@ateliersdelasource.fr</p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Hébergement</h2>
            <p>Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 900, San Francisco, California 94104.</p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Propriété intellectuelle</h2>
            <p>L&apos;ensemble du contenu de ce site (textes, images, éléments graphiques) est la propriété exclusive des Ateliers de la Source, sauf mention contraire. Toute reproduction est interdite sans autorisation écrite.</p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Responsabilité</h2>
            <p>Les Ateliers de la Source ne sauraient être tenus responsables des dommages directs ou indirects résultant de l&apos;utilisation de ce site.</p>
          </section>
        </div>
      </Container>
    </div>
  )
}
