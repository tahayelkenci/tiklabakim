import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PawPrint, LayoutDashboard, Calendar, Users, Settings, Megaphone, ArrowLeft } from 'lucide-react'
import { SignOutButton } from '@/components/layout/sign-out-button'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/giris')
  if (session.user.role !== 'BUSINESS_OWNER' && session.user.role !== 'ADMIN') {
    redirect('/hesabim')
  }

  const navItems = [
    { href: '/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { href: '/dashboard/randevular', label: 'Randevular', icon: Calendar },
    { href: '/dashboard/musteriler', label: 'Müşteriler', icon: Users },
    { href: '/dashboard/profil', label: 'Profil Düzenle', icon: Settings },
    { href: '/dashboard/kampanyalar', label: 'Kampanyalar', icon: Megaphone },
    { href: '/dashboard/ayarlar', label: 'Ayarlar', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">
              Pet<span className="text-orange-500">Pati</span>
            </span>
          </Link>
          <div className="mt-3 text-xs text-gray-500">
            {session.user.name || session.user.email}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors group"
            >
              <item.icon className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Siteye Dön
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* İçerik */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
