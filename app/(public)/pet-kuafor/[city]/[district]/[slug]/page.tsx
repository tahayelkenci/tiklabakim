import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { BusinessCard } from '@/components/business/business-card'
import { ChevronRight, MapPin } from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: Promise<{ city: string; district: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, district, slug } = await params

  const [petType, cityForPet] = await Promise.all([
    db.petType.findUnique({ where: { slug: city } }),
    db.city.findUnique({ where: { slug: district } }),
  ])
  if (petType && cityForPet?.isPublished) {
    const districtForPet = await db.district.findFirst({
      where: { cityId: cityForPet.id, slug, isPublished: true },
    })
    if (districtForPet) {
      return {
        title: `${districtForPet.name} ${petType.name} Kuaförleri | ${cityForPet.name}`,
        description: `${cityForPet.name} ${districtForPet.name} bölgesindeki ${petType.name.toLowerCase()} kuaförlerini keşfedin.`,
        alternates: { canonical: `/pet-kuafor/${city}/${district}/${slug}` },
      }
    }
  }

  const cityRecord = await db.city.findUnique({ where: { slug: city } })
  if (!cityRecord?.isPublished) return { title: 'Bulunamadı' }
  const districtRecord = await db.district.findFirst({ where: { cityId: cityRecord.id, slug: district } })
  if (!districtRecord?.isPublished) return { title: 'Bulunamadı' }
  const neighborhood = await db.neighborhood.findFirst({ where: { districtId: districtRecord.id, slug, isPublished: true } })
  if (!neighborhood) return { title: 'Bulunamadı' }

  return {
    title: neighborhood.seoTitle || `${neighborhood.name} Pet Kuaförleri | ${districtRecord.name}`,
    description: neighborhood.seoDescription || `${neighborhood.name} mahallesindeki pet kuaförlerini keşfedin.`,
    alternates: { canonical: `/pet-kuafor/${city}/${district}/${slug}` },
  }
}

export default async function ThirdLevelPage({ params }: Props) {
  const { city, district, slug } = await params

  const [petType, cityForPet] = await Promise.all([
    db.petType.findUnique({ where: { slug: city } }),
    db.city.findUnique({ where: { slug: district } }),
  ])
  if (petType) {
    if (!cityForPet?.isPublished) notFound()
    const districtForPet = await db.district.findFirst({
      where: { cityId: cityForPet.id, slug, isPublished: true },
    })
    if (!districtForPet) notFound()
    return <PetTypeDistrictPage petType={petType} cityRecord={cityForPet} districtRecord={districtForPet} />
  }

  const cityRecord = await db.city.findUnique({ where: { slug: city } })
  if (!cityRecord?.isPublished) notFound()
  const districtRecord = await db.district.findFirst({ where: { cityId: cityRecord.id, slug: district } })
  if (!districtRecord?.isPublished) notFound()
  const neighborhood = await db.neighborhood.findFirst({
    where: { districtId: districtRecord.id, slug, isPublished: true },
  })
  if (!neighborhood) notFound()
  return <NeighborhoodPage neighborhood={neighborhood} cityRecord={cityRecord} districtRecord={districtRecord} />
}

async function NeighborhoodPage({ neighborhood, cityRecord, districtRecord }: { neighborhood: any; cityRecord: any; districtRecord: any }) {
  const businesses = await db.business.findMany({
    where: { neighborhoodId: neighborhood.id, isActive: true },
    include: {
      services: { where: { isActive: true }, take: 3, orderBy: { order: 'asc' } },
      reviews: { select: { rating: true } },
      photos: { take: 1, orderBy: { order: 'asc' } },
    },
    orderBy: [{ featuredScore: 'desc' }, { plan: 'desc' }],
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
            <Link href={`/pet-kuafor/${cityRecord.slug}`} className="hover:text-orange-500">{cityRecord.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/pet-kuafor/${cityRecord.slug}/${districtRecord.slug}`} className="hover:text-orange-500">{districtRecord.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{neighborhood.name}</span>
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
                {neighborhood.name} Pet Kuaförleri
              </h1>
              <p className="text-gray-600 mt-1">
                {neighborhood.name}, {districtRecord.name} / {cityRecord.name} — {enriched.length} işletme
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {enriched.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enriched.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-700 mb-2">{neighborhood.name} bölgesinde henüz kuaför yok.</p>
          </div>
        )}
      </div>

      {neighborhood.seoContent && (
        <div className="bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-10">
            <div
              className="prose prose-gray max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: neighborhood.seoContent }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

async function PetTypeDistrictPage({ petType, cityRecord, districtRecord }: { petType: any; cityRecord: any; districtRecord: any }) {
  const businesses = await db.business.findMany({
    where: {
      city: cityRecord.slug,
      district: districtRecord.slug,
      isActive: true,
      services: { some: { category: petType.slug, isActive: true } },
    },
    include: {
      services: { where: { isActive: true }, take: 3, orderBy: { order: 'asc' } },
      reviews: { select: { rating: true } },
      photos: { take: 1, orderBy: { order: 'asc' } },
    },
    orderBy: [{ featuredScore: 'desc' }, { plan: 'desc' }],
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
            <Link href={`/pet-kuafor/${petType.slug}`} className="hover:text-orange-500">{petType.icon} {petType.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/pet-kuafor/${petType.slug}/${cityRecord.slug}`} className="hover:text-orange-500">{cityRecord.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{districtRecord.name}</span>
          </nav>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {districtRecord.name} {petType.name} Kuaförleri
          </h1>
          <p className="text-gray-600 mt-1">
            {cityRecord.name} / {districtRecord.name} — {enriched.length} {petType.name.toLowerCase()} kuaförü
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
            <p>{districtRecord.name}&apos;da {petType.name.toLowerCase()} kuaförü bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  )
}
