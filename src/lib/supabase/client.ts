// src/lib/supabase/client.ts
// Client Supabase côté navigateur (composants client)
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Lazy initialization to avoid build-time errors when env vars are missing
let _supabase: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// Keep backward compat — use a proxy that lazy-initializes
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
