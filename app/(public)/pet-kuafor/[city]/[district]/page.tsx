import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { BusinessCard } from '@/components/business/business-card'
import { BusinessFilters } from '@/components/business/business-filters'
import { MapPin, ChevronRight, Search } from 'lucide-react'

export const revalidate = 1800 // 30 dakika

interface Props {
  params: Promise<{ city: string; district: string }>
  searchParams: Promise<{
    hizmet?: string
    tur?: string
    siralama?: string
    sayfa?: string
    min_fiyat?: string
    max_fiyat?: string
    puan?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, district } = await params

  // pet-type + city lookup
  const [cityRecord, petType] = await Promise.all([
    db.city.findUnique({ where: { slug: city } }),
    db.petType?.findUnique({ where: { slug: city } }) ?? Promise.resolve(null),
  ])

  if (petType) {
    const cityForPet = await db.city.findUnique({ where: { slug: district } })
    if (cityForPet?.isPublished) {
      return {
        title: `${cityForPet.name} ${petType.name} Kuaförleri`,
        description: `${cityForPet.name}'deki ${petType.name.toLowerCase()} kuaförlerini keşfedin.`,
        alternates: { canonical: `/pet-kuafor/${city}/${district}` },
      }
    }
    return { title: 'Bulunamadı' }
  }

  if (!cityRecord || !cityRecord.isPublished) return { title: 'Şehir Bulunamadı' }

  const districtRecord = await db.district.findFirst({
    where: { cityId: cityRecord.id, slug: district },
  })
  if (!districtRecord || !districtRecord.isPublished) return { title: 'İlçe Bulunamadı' }

  const count = await db.business.count({
    where: { city, district, isActive: true },
  })

  return {
    title:
      districtRecord.seoTitle ||
      `${districtRecord.name} Pet Kuaförleri | ${cityRecord.name} Pet Kuaförleri`,
    description:
      districtRecord.seoDescription ||
      `${districtRecord.name} bölgesindeki ${count}+ pet kuaförünü karşılaştır. Fiyatlar, yorumlar ve online randevu.`,
    alternates: { canonical: `/pet-kuafor/${city}/${district}` },
    openGraph: {
      title: `${districtRecord.name} Pet Kuaförleri`,
      description: `${districtRecord.name}'deki ${count}+ pet kuaförünü keşfet.`,
    },
  }
}

type SearchParamsType = { hizmet?: string; tur?: string; siralama?: string; sayfa?: string; min_fiyat?: string; max_fiyat?: string; puan?: string }

async function getBusinesses(city: string, district: string, searchParams: SearchParamsType) {
  const page = parseInt(searchParams.sayfa || '1')
  const pageSize = 12
  const skip = (page - 1) * pageSize

  const where: any = {
    city,
    district,
    isActive: true,
  }

  if (searchParams.tur) {
    where.services = {
      some: { category: searchParams.tur, isActive: true },
    }
  }

  const orderBy: any[] = []
  switch (searchParams.siralama) {
    case 'puan':
      orderBy.push({ reviews: { _count: 'desc' } })
      break
    case 'yeni':
      orderBy.push({ createdAt: 'desc' })
      break
    default:
      orderBy.push({ featuredScore: 'desc' })
      orderBy.push({ plan: 'desc' })
  }

  const [businesses, total] = await Promise.all([
    db.business.findMany({
      where,
      include: {
        services: {
          where: { isActive: true },
          take: 4,
          orderBy: { order: 'asc' },
        },
        reviews: { select: { rating: true } },
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    db.business.count({ where }),
  ])

  const enriched = businesses.map((b) => ({
    ...b,
    avgRating: b.reviews.length
      ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length
      : 0,
    reviewCount: b.reviews.length,
  }))

  const filtered = searchParams.puan
    ? enriched.filter((b) => b.avgRating >= parseFloat(searchParams.puan!))
    : enriched

  return { businesses: filtered, total, page, pageSize }
}

async function getNearbyDistricts(cityId: string, districtSlug: string) {
  return db.district.findMany({
    where: { cityId, isPublished: true, slug: { not: districtSlug } },
    select: { slug: true, name: true },
    take: 8,
  })
}

export default async function DistrictPage({ params, searchParams }: Props) {
  const { city, district } = await params
  const sp = await searchParams

  // ── Pet türü + şehir multi-lookup ─────────────────────────
  const [cityRecord, petType] = await Promise.all([
    db.city.findUnique({ where: { slug: city } }),
    db.petType?.findUnique({ where: { slug: city } }) ?? Promise.resolve(null),
  ])

  if (petType) {
    const petCityRecord = await db.city.findUnique({ where: { slug: district } })
    if (!petCityRecord?.isPublished) notFound()
    return <PetTypeCityPage petType={petType} cityRecord={petCityRecord} />
  }

  // ── Normal ilçe sayfası ───────────────────────────────────
  if (!cityRecord) notFound()
  if (!cityRecord.isPublished) notFound()

  const districtRecord = await db.district.findFirst({
    where: { cityId: cityRecord.id, slug: district },
  })
  if (!districtRecord) notFound()
  if (!districtRecord.isPublished) notFound()

  const cityName = cityRecord.name
  const districtName = districtRecord.name

  const [{ businesses, total, page, pageSize }, nearbyDistricts] = await Promise.all([
    getBusinesses(city, district, sp),
    getNearbyDistricts(cityRecord.id, district),
  ])

  const totalPages = Math.ceil(total / pageSize)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${districtName} Pet Kuaförleri`,
    description: `${districtName} bölgesindeki pet kuaförleri`,
    numberOfItems: total,
    itemListElement: businesses.slice(0, 10).map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: b.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: b.address,
          addressLocality: districtName,
          addressRegion: cityName,
          addressCountry: 'TR',
        },
        telephone: b.phone,
        ...(b.avgRating > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: b.avgRating.toFixed(1),
            reviewCount: b.reviewCount,
          },
        }),
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="hover:text-orange-500 transition-colors">Ana Sayfa</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/pet-kuafor" className="hover:text-orange-500 transition-colors">Pet Kuaförler</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/pet-kuafor/${city}`} className="hover:text-orange-500 transition-colors">
                {cityName}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 font-medium">{districtName}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {districtName} Pet Kuaförleri
                </h1>
                <p className="text-gray-600 mt-1">
                  {districtName}, {cityName} bölgesinde <strong>{total}</strong> pet kuaförü bulundu.
                  En iyi köpek ve kedi kuaförlerini karşılaştır, online randevu al.
                </p>
              </div>
            </div>

            {/* Statik SEO metni (seoContent yoksa göster) */}
            {!districtRecord.seoContent && (
              <div className="mt-6 p-4 bg-orange-50 rounded-xl text-sm text-gray-700">
                <p>
                  <strong>{districtName}</strong>&apos;daki pet kuaförleri; köpek bakımı, kedi tıraşı,
                  tırnak kesimi, banyo ve tam bakım gibi hizmetler sunmaktadır.
                  Ortalama fiyatlar ₺150 ile ₺600 arasında değişmektedir.
                  Online randevu için tercih ettiğiniz kuaförün profilini ziyaret edin.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filtreler */}
            <aside className="lg:w-64 flex-shrink-0">
              <BusinessFilters
                city={city}
                district={district}
                searchParams={sp}
              />
            </aside>

            {/* Sonuçlar */}
            <div className="flex-1">
              {/* Sıralama */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{total}</span> kuaför bulundu
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sıralama:</span>
                  <select
                    defaultValue={sp.siralama || 'varsayilan'}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="varsayilan">En İyi Eşleşme</option>
                    <option value="puan">En Yüksek Puan</option>
                    <option value="yeni">En Yeni</option>
                  </select>
                </div>
              </div>

              {businesses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {businesses.map((business) => (
                      <BusinessCard
                        key={business.id}
                        business={{
                          ...business,
                          services: business.services.map((s) => ({
                            name: s.name,
                            price: s.price ? Number(s.price) : null,
                          })),
                        }}
                      />
                    ))}
                  </div>

                  {/* Sayfalama */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      {page > 1 && (
                        <Link
                          href={`?sayfa=${page - 1}`}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          ← Önceki
                        </Link>
                      )}
                      <span className="px-4 py-2 text-sm text-gray-600">
                        {page} / {totalPages}
                      </span>
                      {page < totalPages && (
                        <Link
                          href={`?sayfa=${page + 1}`}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Sonraki →
                        </Link>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Sonuç bulunamadı
                  </h3>
                  <p className="text-gray-500">
                    {districtName} için henüz kayıtlı işletme bulunmuyor. Filtreleri temizleyip tekrar deneyin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Yakın İlçeler */}
          {nearbyDistricts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {cityName}&apos;da Diğer İlçeler
              </h2>
              <div className="flex flex-wrap gap-2">
                {nearbyDistricts.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/pet-kuafor/${city}/${d.slug}`}
                    className="px-4 py-1.5 bg-white border border-gray-200 hover:border-orange-400 text-sm text-gray-600 hover:text-orange-600 rounded-full transition-colors"
                  >
                    📍 {d.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEO İçeriği */}
      {districtRecord.seoContent && (
        <div className="bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-10">
            <div
              className="prose prose-gray max-w-none text-gray-700 prose-headings:font-bold prose-h2:text-xl prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: districtRecord.seoContent }}
            />
          </div>
        </div>
      )}
    </>
  )
}

// ── Pet türü + Şehir sayfası ──────────────────────────────────
async function PetTypeCityPage({ petType, cityRecord }: { petType: any; cityRecord: any }) {
  const businesses = await db.business.findMany({
    where: {
      city: cityRecord.slug,
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
            <Link href={`/pet-kuafor/${petType.slug}`} className="hover:text-orange-500">{petType.icon} {petType.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{cityRecord.name}</span>
          </nav>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {cityRecord.name} {petType.name} Kuaförleri
          </h1>
          <p className="text-gray-600 mt-1">
            {cityRecord.name}&apos;da {enriched.length} {petType.name.toLowerCase()} kuaförü bulundu.
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
            <p>{cityRecord.name}&apos;da {petType.name.toLowerCase()} kuaförü bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  )
}
