'use client'
// src/features/auth/MemberProfilPage.tsx — connectée à Supabase (Bearer token)
import { useState, useEffect, useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function MemberProfilPage() {
  const { user, isLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    motivation: '',
    city: '',
  })

  useEffect(() => {
    setVisible(true)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion?callbackUrl=/espace-membre/profil')
    }
  }, [user, isLoading, router])

  // Charger le profil depuis Supabase via Bearer token
  const loadProfile = useCallback(async () => {
    if (!user) {
      setFetching(false)
      return
    }
    try {
      const res = await fetch('/api/member/profile', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        const p = data.profile
        if (p) {
          setForm({
            firstName: p.first_name || '',
            lastName: p.last_name || '',
            email: p.email || user.email || '',
            phone: p.phone || '',
            bio: p.bio || '',
            motivation: p.motivation || '',
            city: p.city || '',
          })
        } else {
          setForm((prev) => ({ ...prev, email: user.email || '' }))
        }
      }
    } catch {
      // profil non chargé — mode hors connexion
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/member/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          bio: form.bio,
          motivation: form.motivation,
          city: form.city,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Erreur lors de la sauvegarde')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        // Rafraîchir le profil dans le contexte Auth
        await refreshProfile()
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || (!user && !fetching)) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8912A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-12" style={{ backgroundColor: '#5C3D2E' }}>
        <Container>
          <Link
            href="/espace-membre"
            className="flex items-center gap-1 mb-3"
            style={{ color: '#C8A888', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={14} /> Espace membre
          </Link>
          <h1 className="font-serif" style={{ fontSize: '2rem', color: '#F5EDD8' }}>
            Mon profil
          </h1>
        </Container>
      </div>

      <div className="py-16" style={{ backgroundColor: '#FAF6EF' }}>
        <Container size="sm">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            {fetching ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin" style={{ color: '#5C3D2E' }} />
              </div>
            ) : (
              <>
                <div
                  className="bg-white p-8"
                  style={{ border: '1px solid #D4C4A8', borderRadius: '2px' }}
                >
                  <h2 className="font-serif mb-6" style={{ fontSize: '1.25rem', color: '#5C3D2E' }}>
                    Informations personnelles
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Prénom"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Votre prénom"
                        autoComplete="given-name"
                      />
                      <Input
                        label="Nom"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        autoComplete="family-name"
                      />
                    </div>
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="votre@email.fr"
                      disabled
                    />
                    <Input
                      label="Téléphone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="06 00 00 00 00"
                      autoComplete="tel"
                    />
                    <Input
                      label="Ville"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Votre ville"
                      autoComplete="address-level2"
                    />
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: '#5C3D2E' }}
                        htmlFor="motivation"
                      >
                        Ma motivation (optionnel)
                      </label>
                      <textarea
                        id="motivation"
                        name="motivation"
                        value={form.motivation}
                        onChange={handleChange}
                        placeholder="Pourquoi rejoindre les Ateliers de la Source ?"
                        rows={3}
                        className="w-full px-4 py-3 text-sm font-sans outline-none resize-none"
                        style={{
                          background: '#FAF6EF',
                          border: '1px solid #D4C4A8',
                          color: '#2D1F14',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: '#5C3D2E' }}
                        htmlFor="bio"
                      >
                        À propos de moi (optionnel)
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Quelques mots sur votre démarche, vos intérêts..."
                        rows={4}
                        className="w-full px-4 py-3 text-sm font-sans outline-none resize-none"
                        style={{
                          background: '#FAF6EF',
                          border: '1px solid #D4C4A8',
                          color: '#2D1F14',
                          borderRadius: '2px',
                        }}
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '2px' }}>
                        <AlertCircle size={16} style={{ color: '#DC2626' }} />
                        <p className="text-sm font-sans" style={{ color: '#DC2626' }}>{error}</p>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-4">
                      <Button type="submit" variant="primary" size="md" disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                      {saved && (
                        <span
                          className="flex items-center gap-1.5 text-sm font-sans"
                          style={{ color: '#4A5E3A' }}
                        >
                          <CheckCircle size={16} /> Enregistré !
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                {/* Note info */}
                <div
                  className="mt-6 p-5"
                  style={{ background: '#F5EDD8', border: '1px solid #D4C4A8', borderRadius: '2px' }}
                >
                  <p className="text-xs font-sans" style={{ color: '#7A6355' }}>
                    <span className="font-medium" style={{ color: '#5C3D2E' }}>Note :</span>{' '}
                    Vos informations sont confidentielles et accessibles uniquement par vous et les formateurs (Gabriel et Amélie).
                  </p>
                </div>
              </>
            )}
          </div>
        </Container>
      </div>
    </>
  )
}
