import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { BusinessCard } from '@/components/business/business-card'
import { CITY_NAMES, formatDistrictName } from '@/lib/slug'
import { Building2, ChevronRight } from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = await db.category.findUnique({ where: { slug: category } })
  if (!cat?.isActive) return { title: 'Bulunamadı' }
  return {
    title: cat.name + ' — Tıkla Bakım',
    description: cat.description || `Türkiye'deki ${cat.name.toLowerCase()} işletmelerini keşfedin.`,
    alternates: { canonical: `/${category}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat = await db.category.findUnique({ where: { slug: category } })
  if (!cat?.isActive) notFound()

  const [businesses, cityCounts] = await Promise.all([
    db.business.findMany({
      where: { categoryId: cat.id, isActive: true },
      include: {
        services: { where: { isActive: true }, take: 3, orderBy: { order: 'asc' } },
        reviews: { select: { rating: true } },
      },
      orderBy: [{ featuredScore: 'desc' }, { plan: 'desc' }],
      take: 48,
    }),
    db.business.groupBy({
      by: ['city'],
      where: { categoryId: cat.id, isActive: true },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
    }),
  ])

  const enriched = businesses.map((b) => ({
    ...b,
    avgRating: b.reviews.length
      ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length
      : 0,
    reviewCount: b.reviews.length,
    services: b.services.map((s) => ({ name: s.name, price: s.price ? Number(s.price) : null })),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{cat.name}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
              {cat.icon || <Building2 className="w-6 h-6 text-orange-500" />}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{cat.name}</h1>
              {cat.description && (
                <p className="text-gray-600 mt-1">{cat.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Şehir filtreleri */}
        {cityCounts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Şehre Göre</h2>
            <div className="flex flex-wrap gap-2">
              {cityCounts.map((c) => (
                <span
                  key={c.city}
                  className="bg-white border border-gray-200 text-sm text-gray-700 px-4 py-1.5 rounded-full"
                >
                  {CITY_NAMES[c.city] || formatDistrictName(c.city)}
                  <span className="text-gray-400 ml-1.5">({c._count.city})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {enriched.length > 0 ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {cat.name} İşletmeleri
              <span className="text-sm font-normal text-gray-500 ml-2">({enriched.length} işletme)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enriched.map((b) => (
                <BusinessCard key={b.id} business={b} categorySlug={category} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">{cat.icon || '🏪'}</div>
            <p className="text-lg font-medium text-gray-700 mb-2">Henüz {cat.name.toLowerCase()} işletmesi eklenmedi.</p>
            <p className="text-sm">Yakında burada işletmeler listelenecek.</p>
          </div>
        )}
      </div>
    </div>
  )
}
