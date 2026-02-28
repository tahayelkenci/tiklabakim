import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Megaphone, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function KampanyalarPage() {
  const session = await auth()
  if (!session?.user) redirect('/giris')

  const business = await db.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      campaigns: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!business) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-3">Önce işletmenizi oluşturun.</p>
        <Link href="/dashboard/profil/yeni" className="text-orange-500 hover:underline text-sm">
          İşletme oluştur →
        </Link>
      </div>
    )
  }

  const isPremium = ['PREMIUM', 'ENTERPRISE'].includes(business.plan)

  if (!isPremium) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kampanyalar</h1>
        <div className="mt-8 max-w-lg mx-auto text-center py-16">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Premium Özellik</h2>
          <p className="text-gray-600 mb-6">
            Kampanya oluşturma özelliği <strong>Premium</strong> ve <strong>Kurumsal</strong> planlarda kullanılabilir.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Mevcut planınız: <strong>{business.plan}</strong>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Plan yükseltmek için admin ile iletişime geçin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampanyalar</h1>
          <p className="text-sm text-gray-500 mt-1">{business.campaigns.length} kampanya</p>
        </div>
        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          Yeni Kampanya
        </button>
      </div>

      {business.campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">Henüz kampanya yok</p>
          <p className="text-sm text-gray-400">
            Müşterilerinizi çekmek için özel kampanyalar oluşturun.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {business.campaigns.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  {c.description && (
                    <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                  )}
                  {c.discountPct && (
                    <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      %{c.discountPct} indirim
                    </span>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>{new Date(c.startDate).toLocaleDateString('tr-TR')}</div>
                  <div>— {new Date(c.endDate).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
