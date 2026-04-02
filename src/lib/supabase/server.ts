// src/lib/supabase/server.ts
// Client Supabase côté serveur (API routes, Server Components)
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Client serveur principal — utilise la service_role key.
 * À utiliser pour lire/écrire dans les tables côté serveur.
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
 * Utilise la clé anon.
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