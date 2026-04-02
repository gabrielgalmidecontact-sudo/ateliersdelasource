// src/app/(admin)/layout.tsx
// Layout pour les pages d'administration
// La protection auth se fait côté client dans chaque composant AdminXxx

import type { ReactNode } from 'react'

export const metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      {children}
    </div>
  )
}
