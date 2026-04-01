// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect member area
  if (pathname.startsWith('/espace-membre')) {
    // TODO: Check NextAuth session token
    // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    // if (!token) {
    //   const loginUrl = new URL('/connexion', request.url)
    //   loginUrl.searchParams.set('callbackUrl', pathname)
    //   return NextResponse.redirect(loginUrl)
    // }
  }

  // Security headers on all responses
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ],
}
