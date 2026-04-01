// src/app/layout.tsx
import type { Metadata } from 'next'
import { Lora, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/AuthContext'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Les Ateliers de la Source',
    template: '%s | Les Ateliers de la Source',
  },
  description: 'Stages de développement personnel, ateliers d\'expression, spectacles et retraites en nature. Un lieu de ressourcement et de transformation.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ateliersdelasource.fr'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Les Ateliers de la Source',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${lora.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#5C3D2E" />
      </head>
      <body className="font-sans antialiased bg-creme text-text">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
