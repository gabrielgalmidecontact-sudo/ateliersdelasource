// src/lib/supabase/server.ts
// Client Supabase côté serveur (API routes, Server Components)
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // clé service pour accès admin complet
    { auth: { persistSession: false } }
  )
}
