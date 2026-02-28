import { db } from '@/lib/db'
import { AdminCityCms } from '@/components/admin/admin-city-cms'

export default async function AdminSehirlerPage() {
  const cities = await db.city.findMany({
    orderBy: { name: 'asc' },
    include: {
      districts: {
        orderBy: { name: 'asc' },

      },
      _count: { select: { districts: true } },
    },
  })

  // Her ilçe için yayınlanan işletme sayısını getir
  const businessCounts = await db.business.groupBy({
    by: ['city', 'district'],
    where: { isActive: true },
    _count: { id: true },
  })

  const countMap: Record<string, number> = {}
  for (const row of businessCounts) {
    countMap[`${row.city}/${row.district}`] = row._count.id
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Şehirler & İlçeler — CMS</h1>
        <p className="text-sm text-gray-500 mt-1">
          Yayımlamak istediğiniz şehir ve ilçe sayfalarını aktif edin.
          Her sayfa için SEO başlığı, açıklaması ve alt bölüm içeriği ekleyin.
        </p>
      </div>

      <AdminCityCms cities={cities} businessCountMap={countMap} />
    </div>
  )
}
