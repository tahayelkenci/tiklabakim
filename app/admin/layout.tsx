import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  PawPrint, LayoutDashboard, Building2, Users, BarChart3,
  Settings, ArrowLeft, Shield, Tag, CalendarCheck, MapPin, FileText
} from 'lucide-react'
import { SignOutButton } from '@/components/layout/sign-out-button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const navItems = [
    { href: '/admin', label: 'Genel Bakış', icon: LayoutDashboard },
    { href: '/admin/isletmeler', label: 'İşletmeler', icon: Building2 },
    { href: '/admin/kategoriler', label: 'Kategoriler', icon: Tag },
    { href: '/admin/pet-turleri', label: 'Pet Türleri', icon: PawPrint },
    { href: '/admin/sehirler', label: 'Şehirler / SEO', icon: MapPin },
    { href: '/admin/randevular', label: 'Randevular', icon: CalendarCheck },
    { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: Users },
    { href: '/admin/ozel-sayfalar', label: 'Özel Sayfalar', icon: FileText },
    { href: '/admin/finans', label: 'Finansal', icon: BarChart3 },
    { href: '/admin/sistem', label: 'Sistem', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Tıkla Bakım</span>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-orange-400">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors group"
            >
              <item.icon className="w-4 h-4 group-hover:text-orange-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Siteye Dön
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  )
}
