import { db } from '@/lib/db'
import Link from 'next/link'
import { AdminUserEditModal } from '@/components/admin/admin-user-edit-modal'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>
}

export default async function AdminKullanicilarPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = parseInt(sp.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = { role: { not: 'ADMIN' } }
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q } },
      { email: { contains: sp.q } },
    ]
  }
  if (sp.role) where.role = sp.role

  let users: any[] = []
  let total = 0
  let unownedBusinesses: { id: string; name: string; city: string; district: string }[] = []

  try {
    ;[users, total, unownedBusinesses] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          businesses: {
            select: { id: true, name: true, city: true, district: true, plan: true, isActive: true },
          },
          _count: { select: { pets: true, appointments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      db.user.count({ where }),
      db.business.findMany({
        where: { ownerId: null },
        select: { id: true, name: true, city: true, district: true },
        orderBy: { name: 'asc' },
      }),
    ])
  } catch (err) {
    console.error('Admin kullanıcılar sorgu hatası:', err)
  }

  const totalPages = Math.ceil(total / pageSize)
  const petOwners = users.filter((u) => u.role === 'PET_OWNER')
  const bizOwners = users.filter((u) => u.role === 'BUSINESS_OWNER')

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-sm text-gray-500 mt-1">Pet sahipleri ve işletmeciler</p>
        </div>
        <span className="text-sm text-gray-500">{total} kullanıcı</span>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form>
          <input name="q" defaultValue={sp.q} placeholder="Ad veya email ara..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300 w-60"
          />
        </form>
        <div className="flex gap-2">
          {[
            { val: '', label: 'Tümü' },
            { val: 'PET_OWNER', label: 'Pet Sahipleri' },
            { val: 'BUSINESS_OWNER', label: 'İşletmeciler' },
          ].map((f) => (
            <Link key={f.val} href={f.val ? `?role=${f.val}` : '/admin/kullanicilar'}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                (sp.role || '') === f.val
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* İşletmeciler */}
      {bizOwners.length > 0 && (!sp.role || sp.role === 'BUSINESS_OWNER') && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            İşletmeciler ({bizOwners.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bağlı İşletmeler</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bizOwners.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{user.name || '—'}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                      {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {user.businesses.length > 0 ? (
                        <div className="space-y-1">
                          {user.businesses.map((b: any) => (
                            <div key={b.id} className="flex items-center gap-2 text-xs">
                              <span className="font-medium text-gray-800">{b.name}</span>
                              <span className="text-gray-400">({b.district}, {b.city})</span>
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                b.plan === 'FREE' ? 'bg-gray-100 text-gray-500' :
                                b.plan === 'BASIC' ? 'bg-blue-50 text-blue-600' :
                                b.plan === 'PREMIUM' ? 'bg-amber-50 text-amber-600' :
                                'bg-purple-50 text-purple-600'
                              }`}>{b.plan}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-orange-500 font-medium">Bağlı işletme yok</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AdminUserEditModal user={user} availableBusinesses={unownedBusinesses} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pet Sahipleri */}
      {petOwners.length > 0 && (!sp.role || sp.role === 'PET_OWNER') && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Pet Sahipleri ({petOwners.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kullanıcı</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Petler</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Randevular</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {petOwners.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{user.name || '—'}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user._count.pets > 0 ? `${user._count.pets} pet` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user._count.appointments > 0 ? `${user._count.appointments}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AdminUserEditModal user={user} availableBusinesses={[]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`?page=${page - 1}${sp.role ? `&role=${sp.role}` : ''}`}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >← Önceki</Link>
          )}
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`?page=${page + 1}${sp.role ? `&role=${sp.role}` : ''}`}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >Sonraki →</Link>
          )}
        </div>
      )}
    </div>
  )
}
