export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import Link from 'next/link'
import { CheckCircle, XCircle, Crown, ExternalLink, Tag } from 'lucide-react'
import { AdminBusinessActions } from '@/components/admin/admin-business-actions'
import { AdminBusinessEditModal } from '@/components/admin/admin-business-edit-modal'

interface Props {
  searchParams: { q?: string; plan?: string; kategori?: string; page?: string }
}

export default async function AdminBusinessesPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q } },
      { city: { contains: searchParams.q } },
      { district: { contains: searchParams.q } },
    ]
  }
  if (searchParams.plan) where.plan = searchParams.plan
  if (searchParams.kategori) where.categoryId = searchParams.kategori

  const [businesses, total, categories] = await Promise.all([
    db.business.findMany({
      where,
      include: {
        owner: { select: { name: true, email: true } },
        category: { select: { id: true, name: true, icon: true } },
        _count: { select: { reviews: true, appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.business.count({ where }),
    db.category.findMany({ orderBy: { order: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  // Kategorilere göre grupla (sadece filtresiz tam listede)
  const isFiltered = searchParams.q || searchParams.plan || searchParams.kategori
  const grouped: Record<string, typeof businesses> = {}
  const uncategorized: typeof businesses = []

  if (!isFiltered) {
    for (const b of businesses) {
      if (b.category) {
        const key = b.category.id
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(b)
      } else {
        uncategorized.push(b)
      }
    }
  }

  const BusinessRow = ({ b }: { b: (typeof businesses)[0] }) => (
    <tr key={b.id} className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 text-sm">{b.name}</div>
        {b.owner && <div className="text-xs text-gray-400">{b.owner.email}</div>}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {b.district}, {b.city}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          b.plan === 'FREE' ? 'bg-gray-100 text-gray-500' :
          b.plan === 'BASIC' ? 'bg-blue-100 text-blue-700' :
          b.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {b.plan}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {b.isActive ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
          {b.isVerified && <CheckCircle className="w-4 h-4 text-teal-500" />}
          {b.isFeatured && <Crown className="w-4 h-4 text-amber-500" />}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        <div>{b._count.reviews} yorum</div>
        <div>{b._count.appointments} randevu</div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/pet-kuafor/${b.city}/${b.district}/${b.slug}`}
            target="_blank"
            className="p-1 text-gray-400 hover:text-orange-500"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <AdminBusinessEditModal business={b} categories={categories} />
          <AdminBusinessActions
            businessId={b.id}
            isActive={b.isActive}
            isVerified={b.isVerified}
            isFeatured={b.isFeatured}
            currentPlan={b.plan}
          />
        </div>
      </td>
    </tr>
  )

  const TableHeader = () => (
    <thead>
      <tr className="border-b border-gray-100 bg-gray-50">
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşletme</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Konum</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Durum</th>
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İstatistik</th>
        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">İşlem</th>
      </tr>
    </thead>
  )

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">İşletmeler</h1>
        <span className="text-sm text-gray-500">{total} işletme</span>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form>
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Ara..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </form>

        {/* Kategori filtresi */}
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/isletmeler"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !searchParams.kategori && !searchParams.plan ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            Tümü
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`?kategori=${cat.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                searchParams.kategori === cat.id ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>

        {/* Plan filtresi */}
        <div className="flex gap-2 flex-wrap">
          {['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'].map((plan) => (
            <Link
              key={plan}
              href={`?plan=${plan}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                searchParams.plan === plan ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {plan}
            </Link>
          ))}
        </div>
      </div>

      {/* Gruplu görünüm (filtresiz) */}
      {!isFiltered ? (
        <div className="space-y-8">
          {categories.map((cat) => {
            const catBusinesses = grouped[cat.id] || []
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
                    <Tag className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-700">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="text-xs text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded-full">
                      {catBusinesses.length}
                    </span>
                  </div>
                </div>
                {catBusinesses.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <TableHeader />
                        <tbody className="divide-y divide-gray-100">
                          {catBusinesses.map((b) => <BusinessRow key={b.id} b={b} />)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                    Bu kategoride henüz işletme yok.
                  </div>
                )}
              </div>
            )
          })}

          {uncategorized.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500">Kategorisiz</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {uncategorized.length}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <TableHeader />
                    <tbody className="divide-y divide-gray-100">
                      {uncategorized.map((b) => <BusinessRow key={b.id} b={b} />)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Düz liste (filtreli) */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <TableHeader />
              <tbody className="divide-y divide-gray-100">
                {businesses.map((b) => <BusinessRow key={b.id} b={b} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`?page=${page - 1}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Önceki
            </Link>
          )}
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`?page=${page + 1}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
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
