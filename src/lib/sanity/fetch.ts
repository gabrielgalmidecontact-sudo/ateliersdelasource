// src/lib/sanity/fetch.ts
// Utilitaire de fetch Sanity avec gestion d'erreur gracieuse
// Si Sanity n'est pas configuré, les fonctions retournent null ou un tableau vide.

import { sanityClient } from './client'

/**
 * Fetch une requête GROQ Sanity.
 * Retourne null en cas d'erreur (Sanity non configuré, projectId manquant, etc.)
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

  // Si pas de projectId configuré : Sanity non actif, on retourne null proprement
  if (!projectId || projectId === 'your-project-id') {
    return null
  }

  try {
    const result = await sanityClient.fetch<T>(query, params)
    return result ?? null
  } catch (err) {
    // Ne pas crasher l'app si Sanity est inaccessible
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sanity] Fetch error:', err)
    }
    return null
  }
}

/**
 * Variante pour les tableaux : retourne toujours un tableau (jamais null)
 */
export async function sanityFetchArray<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const result = await sanityFetch<T[]>(query, params)
  return result || []
}
