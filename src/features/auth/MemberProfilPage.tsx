'use client'
// src/features/auth/MemberProfilPage.tsx — connectée à Supabase
import { useState, useEffect, useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

export function MemberProfilPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
  })

  useEffect(() => {
    setVisible(true)
  }, [])

  // Charger le profil depuis Supabase
  const loadProfile = useCallback(async () => {
    if (!user) {
      setFetching(false)
      return
    }
    try {
      const res = await fetch('/api/member/profile', {
        headers: { 'x-user-id': user.id },
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
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/member/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          bio: form.bio,
          city: form.city,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Erreur lors de la sauvegarde')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="pt-32 pb-12" style={{ backgroundColor: '#5C3D2E' }}>
        <Container>
          <a
            href="/espace-membre"
            className="flex items-center gap-1"
            style={{ color: '#C8A888', fontSize: '0.875rem', marginBottom: '12px' }}
          >
            <ArrowLeft size={14} /> Espace membre
          </a>
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
                      />
                      <Input
                        label="Nom"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Votre nom"
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
                    />
                    <Input
                      label="Ville"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Votre ville"
                    />
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: '#5C3D2E' }}
                      >
                        À propos de moi (optionnel)
                      </label>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Quelques mots sur votre démarche, vos motivations..."
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
