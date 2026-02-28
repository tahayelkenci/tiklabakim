export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { Building2, Users, Calendar, TrendingUp, Crown, CheckCircle } from 'lucide-react'

export default async function AdminPage() {
  const [
    totalBusinesses, premiumBusinesses, verifiedBusinesses,
    totalUsers, totalAppointments, completedAppointments,
    recentBusinesses, recentUsers,
  ] = await Promise.all([
    db.business.count({ where: { isActive: true } }),
    db.business.count({ where: { plan: { in: ['PREMIUM', 'ENTERPRISE'] } } }),
    db.business.count({ where: { isVerified: true } }),
    db.user.count({ where: { isActive: true } }),
    db.appointment.count(),
    db.appointment.count({ where: { status: 'COMPLETED' } }),
    db.business.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { _count: { select: { reviews: true } } },
    }),
    db.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const stats = [
    {
      label: 'Toplam İşletme',
      value: totalBusinesses.toLocaleString('tr-TR'),
      sub: `${premiumBusinesses} premium`,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Toplam Kullanıcı',
      value: totalUsers.toLocaleString('tr-TR'),
      sub: 'Aktif hesaplar',
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Toplam Randevu',
      value: totalAppointments.toLocaleString('tr-TR'),
      sub: `${completedAppointments} tamamlandı`,
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Premium İşletme',
      value: premiumBusinesses.toLocaleString('tr-TR'),
      sub: `${verifiedBusinesses} doğrulandı`,
      icon: Crown,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-500 mb-8">Platform genel durumu</p>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son İşletmeler */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Son Eklenen İşletmeler</h2>
            <a href="/admin/isletmeler" className="text-sm text-orange-500">Tümünü Gör</a>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBusinesses.map((b) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.district}, {b.city}</div>
                </div>
                <div className="flex items-center gap-2">
                  {b.isVerified && <CheckCircle className="w-4 h-4 text-teal-500" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    b.plan === 'FREE' ? 'bg-gray-100 text-gray-500' :
                    b.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
                    b.plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {b.plan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Son Kullanıcılar */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Son Kayıt Olan Kullanıcılar</h2>
            <a href="/admin/kullanicilar" className="text-sm text-orange-500">Tümünü Gör</a>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{u.name || 'İsimsiz'}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                  u.role === 'BUSINESS_OWNER' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {u.role === 'ADMIN' ? 'Admin' : u.role === 'BUSINESS_OWNER' ? 'İşletme' : 'Kullanıcı'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
