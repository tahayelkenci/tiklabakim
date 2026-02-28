export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { Calendar, Heart, Bell, PlusCircle } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel, getPetTypeEmoji } from '@/lib/utils'

export default async function HesabimPage() {
  const session = await auth()
  if (!session?.user) return null

  const [pets, upcomingAppointments, unreadNotifications] = await Promise.all([
    db.pet.findMany({
      where: { ownerId: session.user.id, isActive: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    db.appointment.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        date: { gte: new Date() },
      },
      include: {
        business: { select: { name: true, city: true, district: true } },
        pet: { select: { name: true, type: true } },
        service: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
      take: 5,
    }),
    db.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ])

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Merhaba, {session.user.name?.split(' ')[0] || 'Hoş geldiniz'}! 🐾
        </h1>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link href="/hesabim/petlerim" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 transition-colors">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{pets.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Petim</div>
        </Link>
        <Link href="/hesabim/randevularim" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 transition-colors">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Yaklaşan Randevu</div>
        </Link>
        <Link href="/hesabim/bildirimler" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-300 transition-colors">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
            <Bell className="w-5 h-5 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{unreadNotifications}</div>
          <div className="text-sm text-gray-500 mt-0.5">Okunmamış</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Petlerim */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Petlerim</h2>
            <Link href="/hesabim/petlerim" className="text-sm text-orange-500 hover:text-orange-600">
              Tümünü Gör
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {pets.length > 0 ? (
              pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/hesabim/petlerim/${pet.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                    {getPetTypeEmoji(pet.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{pet.name}</div>
                    <div className="text-xs text-gray-500">
                      {pet.type === 'DOG' ? 'Köpek' : pet.type === 'CAT' ? 'Kedi' : pet.type}
                      {pet.breed && ` · ${pet.breed}`}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">Henüz pet eklemediniz.</p>
                <Link
                  href="/hesabim/petlerim/yeni"
                  className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  Pet Ekle
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Yaklaşan Randevular */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Yaklaşan Randevular</h2>
            <Link href="/hesabim/randevularim" className="text-sm text-orange-500 hover:text-orange-600">
              Tümünü Gör
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {getPetTypeEmoji(apt.pet.type)} {apt.pet.name} → {apt.business.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatDateTime(apt.date)}
                        {apt.service && ` · ${apt.service.name}`}
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
                <p className="text-sm">Yaklaşan randevu yok</p>
                <Link
                  href="/pet-kuafor"
                  className="inline-block mt-3 text-sm text-orange-500 hover:text-orange-600"
                >
                  Kuaför Ara
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
