// src/app/(auth)/layout.tsx
// Layout pour les pages d'authentification (connexion, inscription)
import type { ReactNode } from 'react'

export const metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {children}
    </div>
  )
}
