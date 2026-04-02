// src/app/studio/[[...tool]]/page.tsx
// Sanity Studio embarqué dans Next.js — accessible sur /studio
// Réservé à Gabriel (admin) pour gérer tout le contenu du site
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
