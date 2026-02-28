import { db } from '@/lib/db'
import { AdminPageManager } from '@/components/admin/admin-page-manager'

const SYSTEM_SLUGS = ['hakkimizda', 'iletisim', 'gizlilik', 'kullanim-kosullari', 'kvkk']

export default async function AdminOzelSayfalarPage() {
  // Sistem sayfalarını otomatik oluştur (yoksa)
  for (const slug of SYSTEM_SLUGS) {
    await db.page.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: {
          hakkimizda: 'Hakkımızda',
          iletisim: 'İletişim',
          gizlilik: 'Gizlilik Politikası',
          'kullanim-kosullari': 'Kullanım Koşulları',
          kvkk: 'KVKK',
        }[slug] ?? slug,
        isSystem: true,
        isActive: true,
      },
    })
  }

  const pages = await db.page.findMany({
    orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
  })

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Özel Sayfalar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sistem sayfalarını (Hakkımızda, İletişim vb.) düzenleyin veya yeni özel sayfalar oluşturun.
          Özel sayfalar <code className="bg-gray-100 px-1 rounded text-xs">/sayfa/[slug]</code> adresinde yayımlanır.
        </p>
      </div>
      <AdminPageManager pages={pages} />
    </div>
  )
}
