'use client'
// src/components/layout/SiteHeader.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { label: 'Accueil', href: '/' },
  { label: 'Activités', href: '/activites' },
  { label: 'Stages & Événements', href: '/evenements' },
  { label: 'Blog', href: '/blog' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-[#FAF6EF]/95 backdrop-blur-md shadow-sm border-b border-[#D4C4A8]/50'
            : 'bg-transparent',
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="Les Ateliers de la Source — accueil">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-serif font-bold transition-all duration-300',
                scrolled ? 'bg-[#5C3D2E] text-[#F5EDD8]' : 'bg-[#F5EDD8]/90 text-[#5C3D2E]',
              )}>
                AS
              </div>
              <div>
                <p className={cn(
                  'text-sm font-serif font-semibold leading-tight transition-colors duration-300',
                  scrolled ? 'text-[#5C3D2E]' : 'text-white drop-shadow-sm',
                )}>
                  Les Ateliers
                </p>
                <p className={cn(
                  'text-xs font-sans tracking-[0.15em] uppercase transition-colors duration-300',
                  scrolled ? 'text-[#7A6355]' : 'text-white/80 drop-shadow-sm',
                )}>
                  de la Source
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
              {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-sm font-sans font-medium rounded-sm transition-all duration-200',
                      'hover:bg-[#5C3D2E]/10',
                      isActive
                        ? (scrolled ? 'text-[#C8912A]' : 'text-[#E0B060]')
                        : (scrolled ? 'text-[#5C3D2E]' : 'text-white/90 drop-shadow-sm'),
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile toggle */}
            <button
              className={cn(
                'lg:hidden p-2 rounded-sm transition-colors duration-200',
                scrolled ? 'text-[#5C3D2E] hover:bg-[#5C3D2E]/10' : 'text-white hover:bg-white/10',
              )}
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-40 pt-16 bg-[#FAF6EF]/98 backdrop-blur-md lg:hidden"
          >
            <nav className="flex flex-col px-6 pt-8 pb-12 gap-1" aria-label="Menu mobile">
              {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'py-4 px-4 text-lg font-serif border-b border-[#D4C4A8]/50 transition-colors duration-200',
                      isActive ? 'text-[#C8912A]' : 'text-[#5C3D2E]',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
