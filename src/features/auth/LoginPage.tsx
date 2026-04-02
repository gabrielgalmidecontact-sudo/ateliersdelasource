'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || 'Erreur de connexion')
      }

      // 🔥 REDIRECTION FORCÉE
      window.location.href = '/admin'

    } catch (err: any) {
      setError(err.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EF]">
      <div className="bg-white border p-8 w-full max-w-md">

        <h1 className="text-2xl mb-6 text-center">Connexion</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border p-2"
            required
          />

          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border p-2"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-2 top-2"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

        </form>

        <div className="text-center mt-4">
          <Link href="/">Retour</Link>
        </div>

      </div>
    </div>
  )
}