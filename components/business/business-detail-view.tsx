import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import {
  MapPin, Phone, Globe, Instagram,
  Star, CheckCircle, Crown, Clock, ChevronRight,
  Scissors, Camera,
} from 'lucide-react'
import { formatPrice, getDayName, getPlanColor, getPlanName, formatShortDate } from '@/lib/utils'
import { AppointmentModal } from '@/components/appointment/appointment-modal'

interface Props {
  slug: string
  categorySlug?: string
  categoryName?: string
}

export async function BusinessDetailView({ slug, categorySlug = 'pet-kuafor', categoryName }: Props) {
  const [business, session] = await Promise.all([
    db.business.findFirst({
      where: { slug, isActive: true },
      include: {
        services: { where: { isActive: true }, orderBy: { order: 'asc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        reviews: {
          where: { isVisible: true },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        photos: { orderBy: { order: 'asc' } },
      },
    }),
    auth(),
  ])

  if (!business) notFound()

  const avgRating =
    business.reviews.length > 0
      ? business.reviews.reduce((s, r) => s + r.rating, 0) / business.reviews.length
      : 0
  const isPremium = business.plan === 'PREMIUM' || business.plan === 'ENTERPRISE'
  const canonicalUrl = `/${categorySlug}/${business.slug}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${process.env.NEXT_PUBLIC_SITE_URL}${canonicalUrl}`,
    name: business.name,
    description: business.description,
    telephone: business.phone,
    url: business.website,
    image: business.coverPhoto || business.logo,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.district,
      addressRegion: business.city,
      addressCountry: 'TR',
    },
    ...(business.lat && business.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: business.lat, longitude: business.lng },
    }),
    ...(avgRating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: business.reviews.length,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    openingHoursSpecification: business.workingHours
      .filter((wh) => !wh.isClosed)
      .map((wh) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][wh.dayOfWeek],
        opens: wh.openTime,
        closes: wh.closeTime,
      })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${categorySlug}`} className="hover:text-orange-500">{categoryName || 'Pet Kuaförler'}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{business.name}</span>
          </nav>
        </div>
      </div>

      {/* Cover */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-orange-100 to-teal-100">
        {business.coverPhoto && (
          <Image src={business.coverPhoto} alt={business.name} fill className="object-cover" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {business.plan !== 'FREE' && (
          <div className="absolute top-4 right-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${getPlanColor(business.plan)}`}>
              {business.plan === 'ENTERPRISE' && <Crown className="w-4 h-4" />}
              {getPlanName(business.plan)}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md -mt-14 flex-shrink-0 overflow-hidden">
              {business.logo ? (
                <Image src={business.logo} alt={`${business.name} logo`} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-orange-50 flex items-center justify-center text-3xl">🐾</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{business.name}</h1>
                    {business.isVerified && <CheckCircle className="w-5 h-5 text-teal-500" />}
                  </div>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({business.reviews.length} yorum)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{business.address}, {business.district}, {business.city}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {business.phone && (
                    <a href={`tel:${business.phone}`}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      {business.phone}
                    </a>
                  )}
                  {isPremium && session?.user ? (
                    <AppointmentModal
                      businessId={business.id}
                      businessName={business.name}
                      services={business.services.map((s) => ({
                        id: s.id, name: s.name, duration: s.duration,
                        price: s.price ? Number(s.price) : null,
                      }))}
                    />
                  ) : isPremium ? (
                    <Link href={`/giris?callbackUrl=${canonicalUrl}`}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Randevu Al
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {business.description && (
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>ℹ️</span> Hakkında
                </h2>
                <p className="text-gray-700 leading-relaxed">{business.description}</p>
              </section>
            )}

            {business.services.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-orange-500" /> Hizmetler & Fiyatlar
                </h2>
                <div className="space-y-3">
                  {business.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {service.category && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {service.category === 'kopek' ? '🐕 Köpek' : service.category === 'kedi' ? '🐈 Kedi' : '🐾 Tüm'}
                            </span>
                          )}
                          {service.duration && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />~{service.duration} dk
                            </span>
                          )}
                        </div>
                        {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                      </div>
                      {service.price ? (
                        <span className="font-semibold text-orange-600 text-lg">{formatPrice(Number(service.price))}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Fiyat sorunuz</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {business.photos.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-teal-500" /> Galeri
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {business.photos.map((photo) => (
                    <div key={photo.id} className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                      <Image src={photo.url} alt={photo.caption || business.name} fill
                        className="object-cover hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Yorumlar
                {business.reviews.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-1">({business.reviews.length})</span>
                )}
              </h2>
              {business.reviews.length > 0 ? (
                <div className="space-y-5">
                  {business.reviews.map((review) => (
                    <div key={review.id} className="pb-5 border-b border-gray-100 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-orange-600">
                          {review.user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 text-sm">{review.user.name || 'Anonim'}</span>
                            {review.isVerified && (
                              <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">✓ Onaylı</span>
                            )}
                            <span className="text-xs text-gray-400">{formatShortDate(review.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          {review.comment && <p className="text-gray-700 text-sm mt-2 leading-relaxed">{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p>Henüz yorum yok. İlk yorumu siz yapın!</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">İletişim & Konum</h3>
              <div className="space-y-3 text-sm">
                {business.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${business.phone}`} className="text-gray-700 hover:text-orange-500">{business.phone}</a>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{business.address}</span>
                </div>
                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline truncate">Web Sitesi</a>
                  </div>
                )}
                {business.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`https://instagram.com/${business.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-orange-500">{business.instagram}</a>
                  </div>
                )}
              </div>
              {business.lat && business.lng && (
                <a href={`https://maps.google.com/?q=${business.lat},${business.lng}`} target="_blank" rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-red-500" /> Haritada Aç
                </a>
              )}
            </div>

            {business.workingHours.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" /> Çalışma Saatleri
                </h3>
                <div className="space-y-2 text-sm">
                  {business.workingHours.map((wh) => {
                    const isToday = wh.dayOfWeek === new Date().getDay()
                    return (
                      <div key={wh.id} className={`flex items-center justify-between py-1 ${isToday ? 'font-semibold text-orange-600' : 'text-gray-700'}`}>
                        <span>{getDayName(wh.dayOfWeek)}{isToday && ' (Bugün)'}</span>
                        <span>{wh.isClosed ? <span className="text-red-500">Kapalı</span> : `${wh.openTime} – ${wh.closeTime}`}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-orange-50 rounded-xl border border-orange-200 p-5">
              <p className="text-sm text-orange-800 font-medium mb-2">Bu işletmenin sahibi misiniz?</p>
              <p className="text-xs text-orange-700 mb-3">Profili düzenleyin, randevu alın ve müşterilerinizi yönetin.</p>
              <Link href={`/kayit?role=business&businessId=${business.id}`}
                className="block text-center text-sm font-medium bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Profilimi Talep Et
              </Link>
            </div>
          </div>
        </div>
      </div>

      {business.content && (
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-gray max-w-none text-gray-700 prose-headings:font-bold prose-h2:text-xl prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: business.content }}
            />
          </div>
        </div>
      )}
    </>
  )
}
