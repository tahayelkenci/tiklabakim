export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fiyatlandırma | Tıkla Bakım',
  description: 'Tıkla Bakım işletme planları ve fiyatları. Ücretsiz başlayın, büyüdükçe yükseltin.',
}

const plans = [
  {
    name: 'Ücretsiz',
    key: 'FREE',
    price: 0,
    period: '/ay',
    color: 'bg-gray-50 border-gray-200',
    btnColor: 'bg-gray-800 hover:bg-gray-900 text-white',
    badge: null,
    features: [
      { text: 'Temel profil sayfası', ok: true },
      { text: 'İletişim bilgileri', ok: true },
      { text: 'Hizmet listesi', ok: true },
      { text: 'Online randevu alma', ok: false },
      { text: 'Öne çıkarma', ok: false },
      { text: 'Müşteri CRM', ok: false },
      { text: 'Kampanya oluşturma', ok: false },
      { text: 'Öncelikli destek', ok: false },
    ],
  },
  {
    name: 'Basic',
    key: 'BASIC',
    price: 299,
    period: '/ay',
    color: 'bg-blue-50 border-blue-200',
    btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    badge: null,
    features: [
      { text: 'Temel profil sayfası', ok: true },
      { text: 'İletişim bilgileri', ok: true },
      { text: 'Hizmet listesi', ok: true },
      { text: 'Online randevu alma', ok: true },
      { text: 'Öne çıkarma', ok: false },
      { text: 'Müşteri CRM', ok: true },
      { text: 'Kampanya oluşturma', ok: false },
      { text: 'Öncelikli destek', ok: false },
    ],
  },
  {
    name: 'Premium',
    key: 'PREMIUM',
    price: 599,
    period: '/ay',
    color: 'bg-white border-amber-400 border-2 shadow-lg',
    btnColor: 'bg-orange-500 hover:bg-orange-600 text-white',
    badge: 'En Popüler',
    features: [
      { text: 'Temel profil sayfası', ok: true },
      { text: 'İletişim bilgileri', ok: true },
      { text: 'Hizmet listesi', ok: true },
      { text: 'Online randevu alma', ok: true },
      { text: 'Öne çıkarma (şehir)', ok: true },
      { text: 'Müşteri CRM', ok: true },
      { text: 'Kampanya oluşturma', ok: true },
      { text: 'Öncelikli destek', ok: false },
    ],
  },
  {
    name: 'Kurumsal',
    key: 'ENTERPRISE',
    price: 999,
    period: '/ay',
    color: 'bg-purple-50 border-purple-300',
    btnColor: 'bg-purple-700 hover:bg-purple-800 text-white',
    badge: null,
    features: [
      { text: 'Temel profil sayfası', ok: true },
      { text: 'İletişim bilgileri', ok: true },
      { text: 'Hizmet listesi', ok: true },
      { text: 'Online randevu alma', ok: true },
      { text: 'Öne çıkarma (Türkiye)', ok: true },
      { text: 'Müşteri CRM', ok: true },
      { text: 'Kampanya oluşturma', ok: true },
      { text: 'Öncelikli destek', ok: true },
    ],
  },
]

export default function FiyatlandirmaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Basit & Şeffaf Fiyatlandırma
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ücretsiz başlayın, işletmeniz büyüdükçe yükseltin. İstediğiniz zaman plan değiştirebilirsiniz.
          </p>
        </div>

        {/* Plan Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl border p-6 flex flex-col relative ${plan.color}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {f.ok
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    }
                    <span className={f.ok ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/kayit?role=business"
                className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.btnColor}`}
              >
                {plan.price === 0 ? 'Ücretsiz Başla' : 'Planı Seç'}
              </Link>
            </div>
          ))}
        </div>

        {/* SSS */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Planımı istediğim zaman değiştirebilir miyim?',
                a: 'Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. Değişiklikler hemen geçerli olur.',
              },
              {
                q: 'Ödeme nasıl yapılır?',
                a: 'Kredi kartı veya banka kartıyla aylık ödeme yapabilirsiniz. İyzico güvenli ödeme altyapısı kullanılmaktadır.',
              },
              {
                q: 'Ücretsiz plan sonsuza kadar ücretsiz mi?',
                a: 'Evet, Ücretsiz plan için herhangi bir süre kısıtı yoktur. İstediğiniz zaman ücretsiz kullanmaya devam edebilirsiniz.',
              },
              {
                q: 'Plan yükseltince mevcut verilerim ne olur?',
                a: 'Tüm verileriniz (randevular, müşteriler, yorumlar) korunur. Yeni plan özellikleri hemen aktif olur.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Daha fazla bilgi almak için</p>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Bizimle İletişime Geçin
          </Link>
        </div>
      </div>
    </div>
  )
}
