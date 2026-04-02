'use client'
// src/features/auth/MemberNewsletterPage.tsx — connectée à Supabase (Bearer token)
import { useState, useEffect, useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Bell, BellOff, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TOPICS = [
  {
    id: 'newsletter_stages',
    label: 'Stages & Formations',
    desc: 'Nouvelles dates, inscriptions ouvertes',
  },
  {
    id: 'newsletter_spectacles',
    label: 'Spectacles & Événements',
    desc: 'Prochaines représentations de Galmide',
  },
  {
    id: 'newsletter_blog',
    label: 'Articles & Réflexions',
    desc: 'Nouveaux articles du blog',
  },
  {
    id: 'newsletter_amelie',
    label: "Propositions d'Amélie",
    desc: 'Soins, hébergement, infos lieu',
  },
]

type Prefs = {
  newsletter_stages: boolean
  newsletter_spectacles: boolean
  newsletter_blog: boolean
  newsletter_amelie: boolean
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8912A] ${checked ? 'bg-[#C8912A]' : 'bg-[#D4C4A8]'}`}
      aria-checked={checked}
      role="switch"
      aria-label={label}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  )
}

export function MemberNewsletterPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [globalSubscribed, setGlobalSubscribed] = useState(true)
  const [prefs, setPrefs] = useState<Prefs>({
    newsletter_stages: true,
    newsletter_spectacles: true,
    newsletter_blog: false,
    newsletter_amelie: false,
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion?callbackUrl=/espace-membre/newsletter')
    }
  }, [user, isLoading, router])

  // Charger préférences depuis le profil Supabase via Bearer token
  const loadPrefs = useCallback(async () => {
    if (!user) {
      setFetching(false)
      return
    }
    try {
      const res = await fetch('/api/member/profile', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      if (res.ok) {
        const { profile } = await res.json()
        if (profile) {
          setGlobalSubscribed(profile.newsletter_global ?? true)
          setPrefs({
            newsletter_stages: profile.newsletter_stages ?? true,
            newsletter_spectacles: profile.newsletter_spectacles ?? true,
            newsletter_blog: profile.newsletter_blog ?? false,
            newsletter_amelie: profile.newsletter_amelie ?? false,
          })
        }
      }
    } catch {
      // hors connexion — garder les valeurs par défaut
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => {
    loadPrefs()
  }, [loadPrefs])

  function togglePref(key: keyof Prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const res = await fetch('/api/member/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          newsletter_global: globalSubscribed,
          newsletter_stages: prefs.newsletter_stages,
          newsletter_spectacles: prefs.newsletter_spectacles,
          newsletter_blog: prefs.newsletter_blog,
          newsletter_amelie: prefs.newsletter_amelie,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // silencieux
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-12 bg-[#5C3D2E]">
        <Container>
          <Link
            href="/espace-membre"
            className="text-[#C8A888] hover:text-[#F5EDD8] transition-colors text-sm font-sans flex items-center gap-1 mb-3"
          >
            <ArrowLeft size={14} /> Espace membre
          </Link>
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
                    {globalSubscribed ? (
                      <Bell size={20} className="text-[#C8912A]" />
                    ) : (
                      <BellOff size={20} className="text-[#7A6355]" />
                    )}
                    <div>
                      <p className="font-sans font-medium text-[#5C3D2E] text-sm">
                        Newsletter globale
                      </p>
                      <p className="text-xs font-sans text-[#7A6355]">
                        {globalSubscribed ? 'Vous êtes abonné·e' : "Vous n'êtes pas abonné·e"}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    checked={globalSubscribed}
                    onChange={() => setGlobalSubscribed((v) => !v)}
                    label="Newsletter globale"
                  />
                </div>
              </div>

              {/* Thématiques */}
              {globalSubscribed && (
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                  <h2 className="font-serif text-lg text-[#5C3D2E] mb-4">Thématiques</h2>
                  <div className="space-y-3">
                    {TOPICS.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between py-3 border-b border-[#D4C4A8]/50 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-sans font-medium text-[#5C3D2E]">
                            {topic.label}
                          </p>
                          <p className="text-xs font-sans text-[#7A6355]">{topic.desc}</p>
                        </div>
                        <Toggle
                          checked={prefs[topic.id as keyof Prefs]}
                          onChange={() => togglePref(topic.id as keyof Prefs)}
                          label={topic.label}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
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

              {!globalSubscribed && (
                <div className="bg-white rounded-sm border border-[#D4C4A8] p-6">
                  <p className="text-sm font-sans text-[#7A6355] mb-4 text-center">
                    Vous ne recevrez plus nos communications. Vous pouvez vous réabonner à tout
                    moment.
                  </p>
                  <div className="flex justify-center">
                    <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Confirmer le désabonnement'}
                    </Button>
                  </div>
                  {saved && (
                    <p className="flex items-center justify-center gap-1.5 text-sm font-sans text-[#4A5E3A] mt-3">
                      <CheckCircle size={14} /> Préférences enregistrées.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Container>
      </div>
    </>
  )
}
