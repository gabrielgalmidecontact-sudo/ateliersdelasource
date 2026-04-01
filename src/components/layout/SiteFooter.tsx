// src/components/layout/SiteFooter.tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { ExternalLink } from 'lucide-react'

// SVG social icons (lucide-react doesn't include social brand icons)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const footerLinks = [
  { label: 'Activités', href: '/activites' },
  { label: 'Stages & Événements', href: '/evenements' },
  { label: 'Blog', href: '/blog' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
]

const legalLinks = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
  { label: 'Accessibilité', href: '/accessibilite' },
]

const socialIcons: Record<string, React.ReactNode> = {
  facebook:  <FacebookIcon />,
  instagram: <InstagramIcon />,
}

export function SiteFooter() {
  return (
    <footer className="bg-[#3B2315] text-[#E8D8B8]" role="contentinfo">
      {/* Main footer */}
      <div className="py-16 border-b border-[#5C3D2E]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#F5EDD8]/10 flex items-center justify-center text-sm font-serif font-bold text-[#F5EDD8]">
                  AS
                </div>
                <div>
                  <p className="text-base font-serif font-semibold text-[#F5EDD8]">Les Ateliers de la Source</p>
                  <p className="text-xs font-sans tracking-widest uppercase text-[#C8912A]">Un lieu de ressourcement</p>
                </div>
              </div>
              <p className="text-sm font-sans text-[#C8A888] leading-relaxed max-w-xs">
                Stages de développement personnel, ateliers d&apos;expression, spectacles et accompagnements individuels dans un lieu de nature.
              </p>
              <div className="mt-6 flex gap-3">
                {[{ platform: 'facebook', url: '#' }, { platform: 'instagram', url: '#' }].map(s => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#5C3D2E]/50 flex items-center justify-center text-[#C8A888] hover:bg-[#C8912A] hover:text-white transition-all duration-200"
                    aria-label={`Suivez-nous sur ${s.platform}`}
                  >
                    {socialIcons[s.platform]}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-sans uppercase tracking-widest text-[#C8912A] mb-5">Navigation</h3>
              <ul className="space-y-3">
                {footerLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm font-sans text-[#C8A888] hover:text-[#F5EDD8] transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-sans uppercase tracking-widest text-[#C8912A] mb-5">Contact</h3>
              <div className="space-y-3 text-sm font-sans text-[#C8A888]">
                <p>
                  <span className="text-[#F5EDD8]/60 text-xs uppercase tracking-wider block mb-0.5">Email</span>
                  <a href="mailto:contact@ateliersdelasource.fr" className="hover:text-[#F5EDD8] transition-colors">
                    contact@ateliersdelasource.fr
                  </a>
                </p>
                <p>
                  <span className="text-[#F5EDD8]/60 text-xs uppercase tracking-wider block mb-0.5">Téléphone</span>
                  <a href="tel:+33600000000" className="hover:text-[#F5EDD8] transition-colors">
                    À venir
                  </a>
                </p>
                <p>
                  <span className="text-[#F5EDD8]/60 text-xs uppercase tracking-wider block mb-0.5">Lieu</span>
                  France
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Legal bar */}
      <div className="py-5">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-[#8A6A55]">
            <p>© {new Date().getFullYear()} Les Ateliers de la Source. Tous droits réservés.</p>
            <div className="flex gap-4 flex-wrap justify-center">
              {legalLinks.map(l => (
                <Link key={l.href} href={l.href} className="hover:text-[#C8A888] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}
