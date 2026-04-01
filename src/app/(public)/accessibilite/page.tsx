// src/app/(public)/accessibilite/page.tsx
import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = { title: 'Accessibilité' }

export default function Accessibilite() {
  return (
    <div className="bg-[#FAF6EF] pt-32 pb-24">
      <Container size="sm">
        <h1 className="font-serif text-3xl text-[#5C3D2E] mb-8">Accessibilité</h1>
        <div className="prose-source space-y-6 text-sm font-sans text-[#2D1F14]">
          <p>Les Ateliers de la Source s&apos;engagent à rendre leur site web accessible conformément aux bonnes pratiques d&apos;accessibilité numérique.</p>
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Mesures prises</h2>
            <ul className="space-y-2 pl-4">
              {['Structure HTML sémantique', 'Contrastes conformes aux recommandations WCAG AA', 'Navigation entièrement possible au clavier', 'Textes alternatifs sur toutes les images', 'Labels sur tous les champs de formulaire', 'Focus visibles sur les éléments interactifs'].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C8912A] font-bold">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-serif text-xl text-[#5C3D2E] mb-3">Contact accessibilité</h2>
            <p>Si vous rencontrez un problème d&apos;accessibilité sur ce site, contactez-nous à : contact@ateliersdelasource.fr</p>
          </section>
        </div>
      </Container>
    </div>
  )
}
