// src/app/(member)/layout.tsx
import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

// Auth guard désactivé au lancement — à activer avec NextAuth :
// import { getServerSession } from 'next-auth'
// import { redirect } from 'next/navigation'
// const session = await getServerSession(authOptions)
// if (!session) redirect('/connexion?callbackUrl=/espace-membre')

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
