'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  User, Menu, X, ChevronDown, PawPrint,
  LayoutDashboard, Settings, LogOut, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const getDashboardLink = () => {
    if (session?.user?.role === 'ADMIN') return '/admin'
    if (session?.user?.role === 'BUSINESS_OWNER') return '/dashboard'
    return '/hesabim'
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Tıkla<span className="text-orange-500">Bakım</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/pet-kuafor"
              className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
            >
              Pet Kuaförler
            </Link>
            <Link
              href="/pet-kuafor/istanbul"
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              İstanbul
            </Link>
            <Link
              href="/pet-kuafor/ankara"
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              Ankara
            </Link>
            <Link
              href="/pet-kuafor/izmir"
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              İzmir
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-20 py-1">
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        Panel
                      </Link>
                      {session.user?.role === 'PET_OWNER' && (
                        <Link
                          href="/hesabim/petlerim"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4 text-gray-400" />
                          Petlerim
                        </Link>
                      )}
                      <Link
                        href="/hesabim/ayarlar"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Ayarlar
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/giris">
                  <Button variant="ghost" size="sm">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/kayit">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    Üye Ol
                  </Button>
                </Link>
              </>
            )}

            {/* İşletme sahipleri için */}
            {!session && (
              <Link href="/kayit?role=business">
                <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  İşletmeni Ekle
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-1">
            <Link
              href="/pet-kuafor"
              className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Pet Kuaförler
            </Link>
            <Link
              href="/pet-kuafor/istanbul"
              className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              İstanbul
            </Link>
            <Link
              href="/pet-kuafor/ankara"
              className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Ankara
            </Link>
            <hr className="my-2 border-gray-200" />
            {session ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Panel
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="block px-4 py-2.5 text-orange-600 hover:bg-orange-50 rounded-lg font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Üye Ol
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
