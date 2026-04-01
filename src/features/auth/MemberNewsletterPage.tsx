'use client'
// src/features/auth/MemberNewsletterPage.tsx
import { useState, useEffect } from 'react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Bell, BellOff, CheckCircle } from 'lucide-react'

const topics = [
  { id: 'stages', label: 'Stages & Formations', desc: 'Nouvelles dates, inscriptions ouvertes' },
  { id: 'spectacles', label: 'Spectacles & Événements', desc: 'Prochaines représentations de Galmide' },
  { id: 'blog', label: 'Articles & Réflexions', desc: 'Nouveaux articles du blog' },
  { id: 'amelie', label: 'Propositions d\'Amélie', desc: 'Soins, hébergement, infos lieu' },
]

export function MemberNewsletterPage() {
  const [subscribed, setSubscribed] = useState(true)
  const [prefs, setPrefs] = useState({ stages: true, spectacles: true, blog: false, amelie: false })
  const [saved, setSaved] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { setVisible(true) }, [])

  function togglePref(key: string) {
    setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))
  }

  async function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <div className="pt-32 pb-12 bg-[#5C3D2E]">
        <Container>
          <a href="/espace-membre" className="text-[#C8A888] hover:text-[#F5EDD8] transition-colors text-sm font-sans flex items-center gap-1 mb-3">
            <ArrowLeft size={14} /> Espace membre
          </a>
          <h1 className="font-serif text-3xl text-[#F5EDD8]">Préférences newsletter</h1>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16">
        <Container size="sm">
          <div
            className="space-y-5"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            {/* Global toggle */}
            <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {subscribed ? <Bell size={20} className="text-[#C8912A]" /> : <BellOff size={20} className="text-[#7A6355]" />}
                  <div>
                    <p className="font-sans font-medium text-[#5C3D2E] text-sm">Newsletter globale</p>
                    <p className="text-xs font-sans text-[#7A6355]">{subscribed ? 'Vous êtes abonné·e' : 'Vous n\'êtes pas abonné·e'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSubscribed(v => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8912A] ${subscribed ? 'bg-[#C8912A]' : 'bg-[#D4C4A8]'}`}
                  aria-checked={subscribed}
                  role="switch"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${subscribed ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Topic preferences */}
            {subscribed && (
              <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                <h2 className="font-serif text-lg text-[#5C3D2E] mb-4">Thématiques</h2>
                <div className="space-y-3">
                  {topics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between py-3 border-b border-[#D4C4A8]/50 last:border-0">
                      <div>
                        <p className="text-sm font-sans font-medium text-[#5C3D2E]">{topic.label}</p>
                        <p className="text-xs font-sans text-[#7A6355]">{topic.desc}</p>
                      </div>
                      <button
                        onClick={() => togglePref(topic.id)}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${prefs[topic.id as keyof typeof prefs] ? 'bg-[#C8912A]' : 'bg-[#D4C4A8]'}`}
                        aria-checked={prefs[topic.id as keyof typeof prefs]}
                        role="switch"
                        aria-label={topic.label}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${prefs[topic.id as keyof typeof prefs] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <Button variant="primary" size="sm" onClick={handleSave}>Enregistrer mes préférences</Button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm font-sans text-[#4A5E3A]">
                      <CheckCircle size={14} /> Enregistré !
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </>
  )
}
