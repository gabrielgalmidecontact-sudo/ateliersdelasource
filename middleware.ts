// middleware.ts
// Protection des routes sensibles + en-têtes de sécurité
// Architecture : auth côté client (Supabase JS) + cookie de session
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui nécessitent d'être authentifié
const MEMBER_ROUTES = ['/espace-membre']
// Routes qui nécessitent le rôle admin
const ADMIN_ROUTES = ['/admin']
// Routes publiques qui redirigent si déjà connecté
const AUTH_ROUTES = ['/connexion', '/inscription']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ─── En-têtes de sécurité ────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // Strict-Transport-Security en production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // ─── Protection des routes membres ────────────────────────────
  // Note : Supabase gère les sessions via cookies (sb-*).
  // La vérification complète du token JWT se fait côté client dans AuthContext.
  // Ici, on fait une vérification légère basée sur la présence du cookie de session.
  const isMemberRoute = MEMBER_ROUTES.some(r => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))

  if (isMemberRoute || isAdminRoute) {
    // Vérifier la présence d'un cookie Supabase (sb-<project-id>-auth-token)
    // Supabase stocke le token dans un cookie prefixé par le project ID
    const hasCookieSession = Array.from(request.cookies.getAll())
      .some(c => c.name.includes('-auth-token') || c.name === 'sb-access-token')

    if (!hasCookieSession) {
      const loginUrl = new URL('/connexion', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Matcher optimisé : exclure les assets statiques et les routes API internes
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|images/|icons/|_next/webpack-hmr|api/).*)',
  ],
}
