import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Korumalı rotalar
  const protectedRoutes = ['/dashboard', '/hesabim', '/admin']
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtected && !session) {
    const loginUrl = new URL('/giris', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin rotaları - sadece ADMIN rolü
  if (pathname.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Dashboard - sadece BUSINESS_OWNER veya ADMIN
  if (
    pathname.startsWith('/dashboard') &&
    session?.user?.role !== 'BUSINESS_OWNER' &&
    session?.user?.role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/hesabim', req.url))
  }

  // Hesabım - BUSINESS_OWNER'ı /dashboard'a yönlendir (yanlış panele girmesin)
  if (
    pathname.startsWith('/hesabim') &&
    session?.user?.role === 'BUSINESS_OWNER'
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Zaten giriş yapmış kullanıcıları auth sayfalarından yönlendir
  if (
    session &&
    (pathname === '/giris' || pathname === '/kayit')
  ) {
    const role = session.user?.role
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url))
    if (role === 'BUSINESS_OWNER') return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.redirect(new URL('/hesabim', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/hesabim/:path*',
    '/admin/:path*',
    '/giris',
    '/kayit',
  ],
}
