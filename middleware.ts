import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // LiteSpeed X-Forwarded-Proto header'ından kaçınmak için NEXTAUTH_URL kullan
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Korumalı rotalar
  const protectedRoutes = ['/dashboard', '/hesabim', '/admin']
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  // NextAuth v5 beta session?.user kontrolü (req.auth {} döndürebilir, null değil)
  if (isProtected && !session?.user) {
    const loginUrl = new URL('/giris', baseUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin rotaları - sadece ADMIN rolü
  if (pathname.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', baseUrl))
  }

  // Dashboard - sadece BUSINESS_OWNER veya ADMIN
  if (
    pathname.startsWith('/dashboard') &&
    session?.user?.role !== 'BUSINESS_OWNER' &&
    session?.user?.role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/hesabim', baseUrl))
  }

  // Hesabım - BUSINESS_OWNER'ı /dashboard'a yönlendir (yanlış panele girmesin)
  if (
    pathname.startsWith('/hesabim') &&
    session?.user?.role === 'BUSINESS_OWNER'
  ) {
    return NextResponse.redirect(new URL('/dashboard', baseUrl))
  }

  // Zaten giriş yapmış kullanıcıları auth sayfalarından yönlendir
  if (
    session?.user &&
    (pathname === '/giris' || pathname === '/kayit')
  ) {
    const role = session.user?.role
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', baseUrl))
    if (role === 'BUSINESS_OWNER') return NextResponse.redirect(new URL('/dashboard', baseUrl))
    return NextResponse.redirect(new URL('/hesabim', baseUrl))
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
