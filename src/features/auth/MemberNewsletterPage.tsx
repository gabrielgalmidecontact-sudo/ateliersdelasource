'use client'
// src/features/auth/MemberNewsletterPage.tsx — connectée à Supabase
import { useState, useEffect, useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Bell, BellOff, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

const TOPICS = [
  { id: 'stages', label: 'Stages & Formations', desc: 'Nouvelles dates, inscriptions ouvertes' },
  { id: 'spectacles', label: 'Spectacles & Événements', desc: 'Prochaines représentations de Galmide' },
  { id: 'blog', label: 'Articles & Réflexions', desc: 'Nouveaux articles du blog' },
  { id: 'amelie', label: "Propositions d'Amélie", desc: 'Soins, hébergement, infos lieu' },
]

type Prefs = { stages: boolean; spectacles: boolean; blog: boolean; amelie: boolean }

export function MemberNewsletterPage() {
  const { user } = useAuth()
  const [subscribed, setSubscribed] = useState(true)
  const [prefs, setPrefs] = useState<Prefs>({ stages: true, spectacles: true, blog: false, amelie: false })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => { setVisible(true) }, [])

  // Charger préférences depuis le profil Supabase
  const loadPrefs = useCallback(async () => {
    if (!user) { setFetching(false); return }
    try {
      const res = await fetch('/api/member/profile', {
        headers: { 'x-user-id': user.id },
      })
      if (res.ok) {
        const { profile } = await res.json()
        if (profile?.newsletter_subscribed !== undefined) {
          setSubscribed(profile.newsletter_subscribed)
        }
        if (profile?.newsletter_prefs) {
          setPrefs({ ...prefs, ...profile.newsletter_prefs })
        }
      }
    } catch { /* hors connexion */ } finally { setFetching(false) }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadPrefs() }, [loadPrefs])

  function togglePref(key: keyof Prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/member/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify({
          newsletter_subscribed: subscribed,
          newsletter_prefs: prefs,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch { /* silencieux */ } finally { setSaving(false) }
  }

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-12 bg-[#5C3D2E]">
        <Container>
          <a
            href="/espace-membre"
            className="text-[#C8A888] hover:text-[#F5EDD8] transition-colors text-sm font-sans flex items-center gap-1 mb-3"
          >
            <ArrowLeft size={14} /> Espace membre
          </a>
          <h1 className="font-serif text-3xl text-[#F5EDD8]">Préférences newsletter</h1>
        </Container>
      </div>

      <div className="bg-[#FAF6EF] py-16">
        <Container size="sm">
          {fetching ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin" style={{ color: '#5C3D2E' }} />
            </div>
          ) : (
            <div
              className="space-y-5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            >
              {/* Toggle global */}
              <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {subscribed
                      ? <Bell size={20} className="text-[#C8912A]" />
                      : <BellOff size={20} className="text-[#7A6355]" />}
                    <div>
                      <p className="font-sans font-medium text-[#5C3D2E] text-sm">Newsletter globale</p>
                      <p className="text-xs font-sans text-[#7A6355]">
                        {subscribed ? 'Vous êtes abonné·e' : "Vous n'êtes pas abonné·e"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSubscribed((v) => !v)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8912A] ${subscribed ? 'bg-[#C8912A]' : 'bg-[#D4C4A8]'}`}
                    aria-checked={subscribed}
                    role="switch"
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${subscribed ? 'translate-x-7' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Thématiques */}
              {subscribed && (
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                  <h2 className="font-serif text-lg text-[#5C3D2E] mb-4">Thématiques</h2>
                  <div className="space-y-3">
                    {TOPICS.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between py-3 border-b border-[#D4C4A8]/50 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-sans font-medium text-[#5C3D2E]">{topic.label}</p>
                          <p className="text-xs font-sans text-[#7A6355]">{topic.desc}</p>
                        </div>
                        <button
                          onClick={() => togglePref(topic.id as keyof Prefs)}
                          className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${prefs[topic.id as keyof Prefs] ? 'bg-[#C8912A]' : 'bg-[#D4C4A8]'}`}
                          aria-checked={prefs[topic.id as keyof Prefs]}
                          role="switch"
                          aria-label={topic.label}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${prefs[topic.id as keyof Prefs] ? 'translate-x-5' : 'translate-x-0.5'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Enregistrer mes préférences'}
                    </Button>
                    {saved && (
                      <span className="flex items-center gap-1.5 text-sm font-sans text-[#4A5E3A]">
                        <CheckCircle size={14} /> Enregistré !
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!subscribed && (
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6 text-center">
                  <p className="text-sm font-sans text-[#7A6355] mb-4">
                    Vous ne recevrez plus nos communications. Vous pouvez vous réabonner à tout moment.
                  </p>
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Confirmer le désabonnement'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>
    </>
  )
}
