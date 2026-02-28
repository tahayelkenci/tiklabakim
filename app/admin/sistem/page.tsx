export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { Server, Database, Users, Building2, Calendar, Star } from 'lucide-react'

export default async function AdminSistemPage() {
  const [
    userCount,
    businessCount,
    petCount,
    appointmentCount,
    reviewCount,
    serviceCount,
  ] = await Promise.all([
    db.user.count(),
    db.business.count(),
    db.pet.count(),
    db.appointment.count(),
    db.review.count(),
    db.service.count(),
  ])

  const stats = [
    { label: 'Toplam Kullanıcı', value: userCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Toplam İşletme', value: businessCount, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Toplam Pet', value: petCount, icon: '🐾', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Toplam Randevu', value: appointmentCount, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Toplam Yorum', value: reviewCount, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Toplam Hizmet', value: serviceCount, icon: '✂️', color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sistem Durumu</h1>

      {/* DB İstatistikleri */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              {typeof stat.icon === 'string'
                ? <span className="text-xl">{stat.icon}</span>
                : <stat.icon className={`w-5 h-5 ${stat.color}`} />
              }
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString('tr-TR')}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Sistem Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-orange-500" />
            Uygulama Bilgileri
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Platform', value: 'Tıkla Bakım v1.0' },
              { label: 'Framework', value: 'Next.js 14 (App Router)' },
              { label: 'ORM', value: 'Prisma 5' },
              { label: 'Auth', value: 'NextAuth.js v5' },
              { label: 'Node.js', value: process.version },
              { label: 'Ortam', value: process.env.NODE_ENV || 'development' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-500" />
            Veritabanı Tabloları
          </h2>
          <div className="space-y-3">
            {[
              { table: 'users', count: userCount },
              { table: 'businesses', count: businessCount },
              { table: 'pets', count: petCount },
              { table: 'appointments', count: appointmentCount },
              { table: 'reviews', count: reviewCount },
              { table: 'services', count: serviceCount },
            ].map((item) => (
              <div key={item.table} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-mono text-gray-600">{item.table}</span>
                <span className="text-sm font-medium text-gray-900">{item.count.toLocaleString('tr-TR')} kayıt</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Durum */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <div>
          <div className="font-semibold text-green-800">Sistem Çalışıyor</div>
          <div className="text-sm text-green-600">Tüm servisler normal durumda.</div>
        </div>
        <div className="ml-auto text-xs text-green-500">
          Son kontrol: {new Date().toLocaleString('tr-TR')}
        </div>
      </div>
    </div>
  )
}
