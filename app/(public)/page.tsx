import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { SearchBox } from '@/components/search/search-box'
import { BusinessCard } from '@/components/business/business-card'
import { Star, MapPin, Scissors, Shield, Clock, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'PetPati — Türkiye\'nin Pet Kuaför Platformu',
  description:
    'Türkiye\'deki tüm pet kuaförlerini karşılaştır. Fiyatlar, yorumlar ve online randevu. 10.000+ pet kuaförü tek platformda.',
}

// ISG - 1 saatte bir yenile
export const revalidate = 3600

async function getFeaturedBusinesses() {
  try {
    const businesses = await db.business.findMany({
      where: {
        isActive: true,
        plan: { in: ['PREMIUM', 'ENTERPRISE'] },
      },
      include: {
        services: {
          where: { isActive: true },
          take: 3,
          orderBy: { order: 'asc' },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [
        { featuredScore: 'desc' },
        { plan: 'desc' },
      ],
      take: 6,
    })

    return businesses.map((b) => ({
      ...b,
      avgRating:
        b.reviews.length > 0
          ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
          : 0,
      reviewCount: b.reviews.length,
    }))
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const [businessCount, cityCount] = await Promise.all([
      db.business.count({ where: { isActive: true } }),
      db.business.groupBy({ by: ['city'], where: { isActive: true } }),
    ])
    return { businessCount, cityCount: cityCount.length }
  } catch {
    return { businessCount: 0, cityCount: 0 }
  }
}

const POPULAR_CITIES = [
  { name: 'İstanbul', slug: 'istanbul', emoji: '🌉' },
  { name: 'Ankara', slug: 'ankara', emoji: '🏛️' },
  { name: 'İzmir', slug: 'izmir', emoji: '🌊' },
  { name: 'Bursa', slug: 'bursa', emoji: '🏔️' },
  { name: 'Antalya', slug: 'antalya', emoji: '🌴' },
  { name: 'Adana', slug: 'adana', emoji: '🌶️' },
  { name: 'Konya', slug: 'konya', emoji: '🌿' },
  { name: 'Gaziantep', slug: 'gaziantep', emoji: '🍖' },
]

const FEATURES = [
  {
    icon: <Star className="w-6 h-6 text-amber-500" />,
    title: 'Doğrulanmış Yorumlar',
    desc: 'Gerçek randevulardan gelen güvenilir değerlendirmeler',
  },
  {
    icon: <Clock className="w-6 h-6 text-teal-500" />,
    title: 'Online Randevu',
    desc: '7/24 çevrimiçi randevu alın, zaman kaybetmeyin',
  },
  {
    icon: <MapPin className="w-6 h-6 text-orange-500" />,
    title: 'Konum Bazlı Arama',
    desc: 'Size en yakın pet kuaförlerini keşfedin',
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-500" />,
    title: 'Güvenli Platform',
    desc: 'Tüm işletmeler onaylı ve güvenilir',
  },
]

export default async function HomePage() {
  const [featuredBusinesses, stats] = await Promise.all([
    getFeaturedBusinesses(),
    getStats(),
  ])

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-teal-50 pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200 rounded-full opacity-20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              🐾 Türkiye&apos;nin Pet Kuaför Platformu
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Petinize En İyi
              <span className="text-orange-500"> Bakımı</span>
              <br />
              Hak Ediyor
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              {stats.businessCount > 0 ? stats.businessCount.toLocaleString('tr-TR') : '10.000'}+ pet kuaförü, yorumlar, fiyatlar ve online randevu tek platformda.
            </p>

            {/* Arama */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBox placeholder="Şehir veya ilçe ara... (örn. Kadıköy, Beşiktaş)" />
            </div>

            {/* Hızlı filtreler */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-sm text-gray-500">Hızlı arama:</span>
              {[
                { label: '🐕 Köpek', href: '/pet-kuafor/kopek' },
                { label: '🐈 Kedi', href: '/pet-kuafor/kedi' },
                { label: '📍 İstanbul', href: '/pet-kuafor/istanbul' },
                { label: '📍 Ankara', href: '/pet-kuafor/ankara' },
              ].map((tag) => (
                <Link
                  key={tag.href}
                  href={tag.href}
                  className="px-4 py-1.5 bg-white border border-gray-200 hover:border-orange-400 text-gray-700 hover:text-orange-600 rounded-full text-sm transition-colors shadow-sm"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="bg-orange-500 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: `${stats.businessCount > 0 ? (stats.businessCount / 1000).toFixed(0) + 'K+' : '10K+'}`, label: 'Pet Kuaförü' },
              { value: `${stats.cityCount > 0 ? stats.cityCount + '+' : '81'}`, label: 'Şehir' },
              { value: '50K+', label: 'Mutlu Müşteri' },
              { value: '4.8★', label: 'Ortalama Puan' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-orange-100 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popüler Şehirler */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Popüler Şehirler</h2>
            <p className="text-gray-600">Türkiye&apos;nin her şehrinde pet kuaförleri</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/pet-kuafor/${city.slug}`}
                className="group flex flex-col items-center justify-center gap-3 p-6 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-2xl transition-all"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {city.emoji}
                </span>
                <div className="text-center">
                  <div className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {city.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Pet Kuaförleri</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Öne Çıkan İşletmeler */}
      {featuredBusinesses.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Öne Çıkan İşletmeler
                </h2>
                <p className="text-gray-600">En çok tercih edilen premium kuaförler</p>
              </div>
              <Link
                href="/pet-kuafor"
                className="text-orange-500 hover:text-orange-600 font-medium text-sm"
              >
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((business) => (
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
          </div>
        </section>
      )}

      {/* Neden PetPati */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Neden Tıkla Bakım?</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Petiniz için en doğru kuaförü bulmanın en kolay yolu
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-50">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İşletme Sahipleri CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pet Kuaförü mü İşletiyorsunuz?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Tıkla BakımPetPati&apos;ye katılınapos;a katılın, müşteri tabanınızı büyütün ve online randevu alın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kayit?role=business"
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              İşletmeni Ücretsiz Ekle
            </Link>
            <Link
              href="/fiyatlandirma"
              className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Planları İncele
            </Link>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'PetPati\'de nasıl randevu alabilirim?',
                a: 'Üye olduktan sonra favori pet kuaförünüzün profilini açın, "Randevu Al" butonuna tıklayın ve uygun tarih/saati seçin.',
              },
              {
                q: 'Tıkla Bakım ücretsiz mi?',
                a: 'Pet sahipleri için tamamen ücretsizdir. İşletme sahipleri için ücretsiz ve premium planlar mevcuttur.',
              },
              {
                q: 'İşletmemi nasıl ekleyebilirim?',
                a: 'İşletme sahibi olarak üye olun, işletme bilgilerinizi girin ve yayına alın. Ücretsiz plan ile başlayabilirsiniz.',
              },
              {
                q: 'Randevumu iptal edebilir miyim?',
                a: 'Evet, randevu saatinden en az 2 saat öncesine kadar ücretsiz iptal yapabilirsiniz.',
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-gray-50 rounded-xl p-5 cursor-pointer">
                <summary className="font-semibold text-gray-900 list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Tıkla Bakım',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tiklabakim.com',
            description: 'Türkiye\'nin Pet Kuaför Platformu',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tiklabakim.com'}/arama?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </>
  )
}
