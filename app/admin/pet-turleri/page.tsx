export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminPetTypeManager } from '@/components/admin/admin-pet-type-manager'

export default async function AdminPetTurleriPage() {
  const petTypes = await db.petType.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pet Türleri</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pet türlerini yönetin. Her türe ait /pet-kuafor/[slug] sayfası otomatik oluşur.
        </p>
      </div>
      <AdminPetTypeManager petTypes={petTypes} />
    </div>
  )
}
