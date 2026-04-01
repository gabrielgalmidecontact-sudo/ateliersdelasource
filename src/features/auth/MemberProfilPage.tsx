// src/features/auth/MemberProfilPage.tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export function MemberProfilPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <div className="pt-32 pb-12" style={{ backgroundColor: '#5C3D2E' }}>
        <Container>
          <a href="/espace-membre" style={{ color: '#C8A888', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            <ArrowLeft size={14} /> Espace membre
          </a>
          <h1 className="font-serif" style={{ fontSize: '2rem', color: '#F5EDD8' }}>Mon profil</h1>
        </Container>
      </div>
      <div className="py-16" style={{ backgroundColor: '#FAF6EF' }}>
        <Container size="sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="bg-white p-8" style={{ border: '1px solid #D4C4A8', borderRadius: '2px' }}>
              <h2 className="font-serif mb-6" style={{ fontSize: '1.25rem', color: '#5C3D2E' }}>Informations personnelles</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Prénom" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Votre prénom" />
                  <Input label="Nom" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Votre nom" />
                </div>
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.fr" />
                <Input label="Téléphone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="06 00 00 00 00" />
                <div className="pt-2 flex items-center gap-4">
                  <Button type="submit" variant="primary" size="md">Enregistrer</Button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm font-sans" style={{ color: '#4A5E3A' }}>
                      <CheckCircle size={16} /> Enregistré !
                    </span>
                  )}
                </div>
              </form>
            </div>
            <div className="mt-6 p-5" style={{ background: '#F5EDD8', border: '1px solid #D4C4A8', borderRadius: '2px' }}>
              <p className="text-xs font-sans" style={{ color: '#7A6355' }}>
                <span className="font-medium" style={{ color: '#5C3D2E' }}>Note :</span> La connexion sécurisée sera disponible prochainement lors de l&apos;ouverture de l&apos;espace membre.
              </p>
            </div>
          </motion.div>
        </Container>
      </div>
    </>
  )
}
