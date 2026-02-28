import { db } from '@/lib/db'
import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'
import { AdminAppointmentActions } from '@/components/admin/admin-appointment-actions'

interface Props {
  searchParams: { status?: string; page?: string; q?: string }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  IN_PROGRESS: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  NO_SHOW: 'Gelmedi',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-gray-100 text-gray-600',
}

export default async function AdminRandevularPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const pageSize = 25
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (searchParams.status) where.status = searchParams.status
  if (searchParams.q) {
    where.OR = [
      { user: { name: { contains: searchParams.q } } },
      { user: { email: { contains: searchParams.q } } },
      { business: { name: { contains: searchParams.q } } },
    ]
  }

  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true, city: true, district: true } },
        pet: { select: { name: true, type: true } },
        service: { select: { name: true, price: true } },
      },
      orderBy: { date: 'desc' },
      skip,
      take: pageSize,
    }),
    db.appointment.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Randevular</h1>
          <p className="text-sm text-gray-500 mt-1">Sitedeki tüm randevular — onaylama ve yönetim</p>
        </div>
        <span className="text-sm text-gray-500">{total} randevu</span>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form>
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Kullanıcı veya işletme ara..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300 w-64"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/randevular"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !searchParams.status ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            Tümü
          </Link>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <Link
              key={val}
              href={`?status=${val}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                searchParams.status === val ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Müşteri</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Pet</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşletme</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hizmet</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(apt.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(apt.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{apt.user.name || '—'}</div>
                    <div className="text-xs text-gray-400">{apt.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>{apt.pet.name}</div>
                    <div className="text-xs text-gray-400">{apt.pet.type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{apt.business.name}</div>
                    <div className="text-xs text-gray-400">{apt.business.district}, {apt.business.city}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>{apt.service?.name || '—'}</div>
                    {apt.service?.price && (
                      <div className="text-xs text-gray-400">{Number(apt.service.price)}₺</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[apt.status] || apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminAppointmentActions appointmentId={apt.id} currentStatus={apt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {appointments.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Bu filtreye uygun randevu bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`?page=${page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Önceki
            </Link>
          )}
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`?page=${page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
