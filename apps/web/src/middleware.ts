import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PUBLIC_PREFIXES = ['/login', '/api/auth']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(function (prefix) {
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}

export function middleware(request: NextRequest): NextResponse {
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie && !isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
