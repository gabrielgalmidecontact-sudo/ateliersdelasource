// src/app/(public)/politique-confidentialite/page.tsx
import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = { title: 'Politique de confidentialité' }

export default function PolitiqueConfidentialite() {
  return (
    <div className="bg-[#FAF6EF] pt-32 pb-24">
      <Container size="sm">
        <h1 className="font-serif text-3xl text-[#5C3D2E] mb-8">Politique de confidentialité</h1>
        <div className="prose-source space-y-6 text-sm font-sans text-[#2D1F14]">
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Données collectées</h2>
            <p>Dans le cadre de l&apos;utilisation de ce site, nous pouvons collecter les informations suivantes : nom, prénom, adresse email, et numéro de téléphone (formulaire de contact et newsletter). Ces données sont utilisées uniquement dans le cadre de notre relation avec vous.</p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Utilisation des données</h2>
            <p>Vos données personnelles sont utilisées pour répondre à vos demandes de contact et vous envoyer notre newsletter si vous y avez consenti. Elles ne sont jamais vendues ni partagées avec des tiers.</p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Vos droits</h2>
            <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition concernant vos données. Pour exercer ces droits, contactez-nous à : contact@ateliersdelasource.fr</p>
          </section>
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Cookies</h2>
            <p>Ce site utilise des cookies techniques strictement nécessaires à son fonctionnement. Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.</p>
          </section>
        </div>
      </Container>
    </div>
  )
}
