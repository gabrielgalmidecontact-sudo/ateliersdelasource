'use client'
// src/features/auth/MemberProfilPage.tsx — connectée à Supabase (Bearer token)
import { useState, useEffect, useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const DIET_OPTIONS = [
  { value: '', label: 'Sélectionner' },
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Végétarien' },
  { value: 'vegan', label: 'Végan' },
  { value: 'pescatarian', label: 'Pescétarien' },
  { value: 'no_preference', label: 'Sans préférence' },
  { value: 'other', label: 'Autre' },
]

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
    dietType: '',
    foodAllergies: '',
    foodIntolerances: '',
    dietNotes: '',
    logisticsNotes: '',
  })

  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/connexion?callbackUrl=/espace-membre/profil')
    }
  }, [user, isLoading, router])

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
            dietType: p.diet_type || '',
            foodAllergies: p.food_allergies || '',
            foodIntolerances: p.food_intolerances || '',
            dietNotes: p.diet_notes || '',
            logisticsNotes: p.logistics_notes || '',
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
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
          diet_type: form.dietType || null,
          food_allergies: form.foodAllergies || null,
          food_intolerances: form.foodIntolerances || null,
          diet_notes: form.dietNotes || null,
          logistics_notes: form.logisticsNotes || null,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Erreur lors de la sauvegarde')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  className="bg-white p-8"
                  style={{ border: '1px solid #D4C4A8', borderRadius: '2px' }}
                >
                  <h2 className="font-serif mb-6" style={{ fontSize: '1.25rem', color: '#5C3D2E' }}>
                    Informations personnelles
                  </h2>

                  <div className="space-y-5">
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

                    <Textarea
                      label="Ma motivation (optionnel)"
                      name="motivation"
                      value={form.motivation}
                      onChange={handleChange}
                      placeholder="Pourquoi rejoindre les Ateliers de la Source ?"
                      rows={3}
                      className="bg-[#FAF6EF]"
                    />

                    <Textarea
                      label="À propos de moi (optionnel)"
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Quelques mots sur votre démarche, vos intérêts..."
                      rows={4}
                      className="bg-[#FAF6EF]"
                    />
                  </div>
                </div>

                <div
                  className="bg-white p-8"
                  style={{ border: '1px solid #D4C4A8', borderRadius: '2px' }}
                >
                  <div className="mb-6">
                    <h2 className="font-serif mb-2" style={{ fontSize: '1.25rem', color: '#5C3D2E' }}>
                      Informations logistiques
                    </h2>
                    <p className="text-sm font-sans text-[#7A6355] leading-relaxed">
                      Ces informations nous aident à vous accueillir dans les meilleures conditions
                      lors des stages, ateliers ou séjours.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label
                        className="block text-sm font-sans font-medium text-[#5C3D2E] mb-1.5"
                        htmlFor="dietType"
                      >
                        Régime alimentaire
                      </label>
                      <select
                        id="dietType"
                        name="dietType"
                        value={form.dietType}
                        onChange={handleChange}
                        className="w-full rounded-sm border border-[#D4C4A8] bg-[#FAF6EF] px-4 py-3 font-sans text-sm text-[#2D1F14] transition-colors duration-200 focus:outline-none focus:border-[#C8912A] focus:ring-1 focus:ring-[#C8912A]/30"
                      >
                        {DIET_OPTIONS.map((option) => (
                          <option key={option.value || 'empty'} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Textarea
                      label="Allergies alimentaires"
                      name="foodAllergies"
                      value={form.foodAllergies}
                      onChange={handleChange}
                      placeholder="Ex. arachides, fruits à coque, gluten…"
                      rows={3}
                      className="bg-[#FAF6EF]"
                    />

                    <Textarea
                      label="Intolérances ou sensibilités"
                      name="foodIntolerances"
                      value={form.foodIntolerances}
                      onChange={handleChange}
                      placeholder="Ex. lactose, digestion sensible, aliments à éviter…"
                      rows={3}
                      className="bg-[#FAF6EF]"
                    />

                    <Textarea
                      label="Précisions alimentaires"
                      name="dietNotes"
                      value={form.dietNotes}
                      onChange={handleChange}
                      placeholder="Toute information complémentaire utile pour les repas."
                      rows={3}
                      className="bg-[#FAF6EF]"
                    />

                    <Textarea
                      label="Remarques logistiques utiles"
                      name="logisticsNotes"
                      value={form.logisticsNotes}
                      onChange={handleChange}
                      placeholder="Informations utiles pour l'accueil, l'organisation ou le confort sur place."
                      rows={4}
                      className="bg-[#FAF6EF]"
                    />
                  </div>
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2 p-3"
                    style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '2px' }}
                  >
                    <AlertCircle size={16} style={{ color: '#DC2626' }} />
                    <p className="text-sm font-sans" style={{ color: '#DC2626' }}>
                      {error}
                    </p>
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
            )}
          </div>
        </Container>
      </div>
    </>
  )
}
