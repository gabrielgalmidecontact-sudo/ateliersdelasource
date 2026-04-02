// src/lib/supabase/server.ts
// Client Supabase côté serveur (API routes, Server Components)
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Client serveur principal — utilise la service_role key.
 * ⚠️ Ne jamais utiliser ce client pour faire une opération auth.signIn*
 *    car cela injecterait le session token et déclencherait les politiques RLS
 *    de l'utilisateur (risque de récursion infinie sur la table profiles).
 *    Utiliser createAuthClient() pour les opérations d'authentification.
 */
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}

/**
 * Client dédié aux opérations d'authentification (signIn, signUp, signOut).
 * Utilise la clé anon — ne fait PAS de requêtes directes aux tables.
 */
export function createAuthClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
