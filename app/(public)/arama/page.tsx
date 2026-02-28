export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { BusinessCard } from '@/components/business/business-card'
import { SearchBox } from '@/components/search/search-box'
import { Search } from 'lucide-react'

interface Props {
  searchParams: { q?: string }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return {
    title: searchParams.q ? `"${searchParams.q}" — Arama Sonuçları` : 'Arama — Tıkla Bakım',
    robots: { index: false, follow: false },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim()

  let businesses: any[] = []
  let total = 0

  if (query && query.length >= 2) {
    const results = await db.business.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { city: { contains: query } },
          { district: { contains: query } },
          { address: { contains: query } },
        ],
      },
      include: {
        services: { where: { isActive: true }, take: 3 },
        reviews: { select: { rating: true } },
      },
      orderBy: [{ featuredScore: 'desc' }],
      take: 24,
    })

    businesses = results.map((b) => ({
      ...b,
      avgRating: b.reviews.length ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0,
      reviewCount: b.reviews.length,
      services: b.services.map((s) => ({ name: s.name, price: s.price ? Number(s.price) : null })),
    }))
    total = businesses.length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {query ? `"${query}" için arama sonuçları` : 'Kuaför Ara'}
          </h1>
          <div className="max-w-2xl">
            <SearchBox placeholder="Şehir, ilçe veya kuaför adı..." />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {query ? (
          <>
            <p className="text-gray-600 mb-6">
              <strong>{total}</strong> sonuç bulundu
            </p>
            {businesses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Sonuç bulunamadı</h3>
                <p className="text-gray-500">Farklı bir arama terimi deneyin.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            Aramak istediğiniz şehir, ilçe veya kuaför adını yazın.
          </div>
        )}
      </div>
    </div>
  )
}
