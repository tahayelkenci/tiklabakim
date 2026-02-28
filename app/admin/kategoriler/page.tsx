import { db } from '@/lib/db'
import { AdminCategoryManager } from '@/components/admin/admin-category-manager'

export default async function AdminKategorilerPage() {
  const categories = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { businesses: true } },
    },
  })

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-sm text-gray-500 mt-1">
            İşletme kategorilerini yönetin. Her kategori ayrı URL yapısı oluşturur.
          </p>
        </div>
      </div>

      <AdminCategoryManager categories={categories} />
    </div>
  )
}
