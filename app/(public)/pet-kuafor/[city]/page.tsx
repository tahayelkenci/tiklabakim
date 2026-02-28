import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { BusinessCard } from '@/components/business/business-card'
import { BusinessDetailView } from '@/components/business/business-detail-view'
import { ChevronRight, MapPin } from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: Promise<{ city: string }>
}

async function resolveSlug(slug: string) {
  const [cityRecord, petType, business] = await Promise.all([
    db.city.findUnique({ where: { slug } }),
    db.petType?.findUnique({ where: { slug } }) ?? Promise.resolve(null),
    db.business.findFirst({ where: { slug, isActive: true }, select: { id: true, slug: true } }),
  ])
  return { cityRecord, petType, business }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const { cityRecord, petType, business } = await resolveSlug(city)

  if (cityRecord?.isPublished) {
    const count = await db.business.count({ where: { city, isActive: true } })
    return {
      title: cityRecord.seoTitle || `${cityRecord.name} Pet Kuaförleri — ${count}+ İşletme`,
      description: cityRecord.seoDescription || `${cityRecord.name}'deki ${count}+ pet kuaförünü keşfet.`,
      alternates: { canonical: `/pet-kuafor/${city}` },
    }
  }
  if (petType) {
    return {
      title: petType.seoTitle || `${petType.name} Kuaförleri — Türkiye`,
      description: petType.seoDescription || `Türkiye genelinde ${petType.name.toLowerCase()} kuaförlerini keşfedin.`,
      alternates: { canonical: `/pet-kuafor/${city}` },
    }
  }
  if (business) {
    return {
      title: `İşletme | Tıkla Bakım`,
      alternates: { canonical: `/pet-kuafor/${city}` },
    }
  }
  return { title: 'Bulunamadı' }
}

export default async function PetKuaforSlugPage({ params }: Props) {
  const { city } = await params
  const { cityRecord, petType, business } = await resolveSlug(city)

  // ── 1. Şehir sayfası ─────────────────────────────────────────
  if (cityRecord?.isPublished) {
    return <CityPageContent cityRecord={cityRecord} citySlug={city} />
  }

  // ── 2. Pet türü sayfası ──────────────────────────────────────
  if (petType) {
    return <PetTypePage petType={petType} />
  }

  // ── 3. İşletme detay sayfası ─────────────────────────────────
  if (business) {
    return <BusinessDetailView slug={city} />
  }

  notFound()
}

// ── Şehir sayfası ─────────────────────────────────────────────
async function CityPageContent({ cityRecord, citySlug }: { cityRecord: any; citySlug: string }) {
  const publishedDistricts = await db.district.findMany({
    where: { cityId: cityRecord.id, isPublished: true },
    orderBy: { name: 'asc' },
  })

  const [businessCounts, featuredBusinesses] = await Promise.all([
    db.business.groupBy({
      by: ['district'],
      where: { city: citySlug, isActive: true },
      _count: { district: true },
    }),
    db.business.findMany({
      where: { city: citySlug, isActive: true, plan: { in: ['PREMIUM', 'ENTERPRISE'] } },
      include: {
        services: { where: { isActive: true }, take: 3 },
        reviews: { select: { rating: true } },
      },
      orderBy: [{ featuredScore: 'desc' }],
      take: 6,
    }),
  ])

  const countMap = Object.fromEntries(businessCounts.map((b) => [b.district, b._count.district]))
  const districts = publishedDistricts
    .map((d) => ({ slug: d.slug, name: d.name, count: countMap[d.slug] || 0 }))
    .sort((a, b) => b.count - a.count)

  const enriched = featuredBusinesses.map((b) => ({
    ...b,
    avgRating: b.reviews.length ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0,
    reviewCount: b.reviews.length,
    services: b.services.map((s) => ({ name: s.name, price: s.price ? Number(s.price) : null })),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/pet-kuafor" className="hover:text-orange-500">Pet Kuaförler</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{cityRecord.name}</span>
          </nav>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {cityRecord.name} Pet Kuaförleri
              </h1>
              <p className="text-gray-600 mt-1">
                {cityRecord.name}&apos;deki {districts.length} ilçede pet kuaförü bulunmaktadır.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{cityRecord.name} İlçeleri</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
          {districts.map((d) => (
            <Link key={d.slug} href={`/pet-kuafor/${citySlug}/${d.slug}`}
              className="bg-white border border-gray-200 hover:border-orange-400 rounded-xl p-4 group transition-all"
            >
              <div className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">{d.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{d.count} kuaför</div>
            </Link>
          ))}
        </div>

        {enriched.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{cityRecord.name} Öne Çıkan İşletmeler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enriched.map((b) => <BusinessCard key={b.id} business={b} />)}
            </div>
          </>
        )}
      </div>

      {cityRecord.seoContent && (
        <div className="bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-10">
            <div
              className="prose prose-gray max-w-none text-gray-700 prose-headings:font-bold prose-h2:text-xl prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cityRecord.seoContent }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Pet türü sayfası ──────────────────────────────────────────
async function PetTypePage({ petType }: { petType: any }) {
  const businesses = await db.business.findMany({
    where: {
      isActive: true,
      services: { some: { category: petType.slug, isActive: true } },
    },
    include: {
      services: { where: { isActive: true }, take: 3, orderBy: { order: 'asc' } },
      reviews: { select: { rating: true } },
      photos: { take: 1, orderBy: { order: 'asc' } },
    },
    orderBy: [{ featuredScore: 'desc' }, { plan: 'desc' }],
    take: 24,
  })

  const enriched = businesses.map((b) => ({
    ...b,
    avgRating: b.reviews.length ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0,
    reviewCount: b.reviews.length,
    coverPhoto: b.coverPhoto || b.photos[0]?.url,
    services: b.services.map((s) => ({ name: s.name, price: s.price ? Number(s.price) : null })),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/pet-kuafor" className="hover:text-orange-500">Pet Kuaförler</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{petType.icon} {petType.name} Kuaförleri</span>
          </nav>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {petType.icon} {petType.name} Kuaförleri
          </h1>
          <p className="text-gray-600 mt-1">
            Türkiye genelinde {petType.name.toLowerCase()} kuaförleri — {enriched.length} işletme
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {enriched.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enriched.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">{petType.icon}</div>
            <p className="text-lg font-medium text-gray-700 mb-2">{petType.name} kuaförü henüz eklenmedi.</p>
            <p className="text-sm">Yakında burada işletmeler listelenecek.</p>
          </div>
        )}
      </div>

      {petType.seoContent && (
        <div className="bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-10">
            <div
              className="prose prose-gray max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: petType.seoContent }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
