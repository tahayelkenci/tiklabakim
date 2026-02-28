import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Star, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/giris')

  const business = await db.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      _count: {
        select: {
          appointments: true,
          reviews: true,
        },
      },
    },
  })

  if (!business) {
    return (
      <div className="p-8">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-5xl mb-4">✂️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">İşletmenizi Oluşturun</h2>
          <p className="text-gray-600 mb-6">Henüz kayıtlı bir işletmeniz yok.</p>
          <Link
            href="/dashboard/profil/yeni"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
          >
            İşletme Oluştur
          </Link>
        </div>
      </div>
    )
  }

  // Bu ayki istatistikler
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [monthAppointments, pendingAppointments, todayAppointments, recentReviews] =
    await Promise.all([
      db.appointment.count({
        where: { businessId: business.id, createdAt: { gte: monthStart } },
      }),
      db.appointment.count({
        where: { businessId: business.id, status: 'PENDING' },
      }),
      db.appointment.findMany({
        where: {
          businessId: business.id,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        include: {
          pet: { select: { name: true, type: true, breed: true } },
          user: { select: { name: true, phone: true } },
          service: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
      }),
      db.review.findMany({
        where: { businessId: business.id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

  const avgRating = recentReviews.length > 0
    ? (await db.review.aggregate({
        where: { businessId: business.id },
        _avg: { rating: true },
      }))._avg.rating || 0
    : 0

  const stats = [
    {
      label: 'Bu Ay Randevu',
      value: monthAppointments,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Bekleyen Talep',
      value: pendingAppointments,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Toplam Yorum',
      value: business._count.reviews,
      icon: Star,
      color: 'text-amber-500',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Ortalama Puan',
      value: avgRating > 0 ? `${avgRating.toFixed(1)}★` : '—',
      icon: TrendingUp,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
  ]

  return (
    <div className="p-6 md:p-8">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Merhaba, {session.user.name?.split(' ')[0] || 'Hoş geldiniz'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">{business.name}</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bugünün Randevuları */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Bugünün Randevuları</h2>
            <Link
              href="/dashboard/randevular"
              className="text-sm text-orange-500 hover:text-orange-600"
            >
              Tümünü Gör
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg">
                        {apt.pet.type === 'DOG' ? '🐕' : apt.pet.type === 'CAT' ? '🐈' : '🐾'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {apt.pet.name} — {apt.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(apt.date).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {apt.service && ` · ${apt.service.name}`}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-gray-500">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Bugün randevu yok</p>
              </div>
            )}
          </div>
        </div>

        {/* Bekleyen Talepler & Son Yorumlar */}
        <div className="space-y-5">
          {pendingAppointments > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800">
                  {pendingAppointments} Bekleyen Talep
                </h3>
              </div>
              <p className="text-sm text-amber-700 mb-3">
                Onaylanmayı bekleyen randevu talepleriniz var.
              </p>
              <Link
                href="/dashboard/randevular?status=PENDING"
                className="block text-center text-sm font-medium bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors"
              >
                İncele & Onayla
              </Link>
            </div>
          )}

          {/* Hızlı Linkler */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/profil"
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
              >
                ✏️ Profili Düzenle
              </Link>
              <Link
                href="/dashboard/randevular"
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
              >
                📅 Tüm Randevular
              </Link>
              <Link
                href="/dashboard/musteriler"
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
              >
                👥 Müşteri Listesi
              </Link>
              <Link
                href={`/pet-kuafor/${business.slug}`}
                target="_blank"
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 text-sm text-orange-600 transition-colors"
              >
                🔗 Profilimi Görüntüle
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
