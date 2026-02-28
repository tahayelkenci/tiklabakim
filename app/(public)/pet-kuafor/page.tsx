import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { SearchBox } from '@/components/search/search-box'
import { BusinessCard } from '@/components/business/business-card'
import { CITY_NAMES, formatDistrictName } from '@/lib/slug'
import { MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Türkiye Pet Kuaförleri — Tüm Şehirler',
  description: 'Türkiye\'deki tüm pet kuaförlerini bul. Şehir ve ilçeye göre filtrele, fiyatları karşılaştır, online randevu al.',
  alternates: { canonical: '/pet-kuafor' },
}

export const revalidate = 3600

export default async function AllPetKuaforPage() {
  const [cities, featuredBusinesses] = await Promise.all([
    db.business.groupBy({
      by: ['city'],
      where: { isActive: true },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
    }),
    db.business.findMany({
      where: { isActive: true, plan: { in: ['PREMIUM', 'ENTERPRISE'] } },
      include: {
        services: { where: { isActive: true }, take: 3 },
        reviews: { select: { rating: true } },
      },
      orderBy: [{ featuredScore: 'desc' }],
      take: 9,
    }),
  ])

  const enriched = featuredBusinesses.map((b) => ({
    ...b,
    avgRating: b.reviews.length ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0,
    reviewCount: b.reviews.length,
    services: b.services.map((s) => ({ name: s.name, price: s.price ? Number(s.price) : null })),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Türkiye Pet Kuaförleri
          </h1>
          <p className="text-gray-600 mb-8">Şehir seçin veya işletme/ilçe adı arayın</p>
          <div className="max-w-2xl mx-auto">
            <SearchBox />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Şehirler */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Şehre Göre Pet Kuaförleri</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
          {cities.map((city) => (
            <Link
              key={city.city}
              href={`/pet-kuafor/${city.city}`}
              className="bg-white border border-gray-200 hover:border-orange-400 rounded-xl p-4 text-center group transition-all"
            >
              <div className="text-2xl mb-2">🏙️</div>
              <div className="font-medium text-gray-800 group-hover:text-orange-600 text-sm transition-colors">
                {CITY_NAMES[city.city] || formatDistrictName(city.city)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{city._count.city} kuaför</div>
            </Link>
          ))}
        </div>

        {/* Öne Çıkanlar */}
        {enriched.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Öne Çıkan İşletmeler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enriched.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
