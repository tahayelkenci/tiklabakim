export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { PawPrint, Heart, Shield, Star } from 'lucide-react'
import { db } from '@/lib/db'

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({ where: { slug: 'hakkimizda' } })
  return {
    title: page?.metaTitle || page?.title || 'Hakkımızda | Tıkla Bakım',
    description: page?.metaDesc || "Tıkla Bakım'ın hikayesi, misyonu ve vizyonu hakkında bilgi edinin.",
  }
}

export default async function HakkimizdaPage() {
  const page = await db.page.findUnique({ where: { slug: 'hakkimizda' } })

  if (page?.content) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-orange-50 to-teal-50 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-teal-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PawPrint className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hakkımızda</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tıkla Bakım, Türkiye'deki pet sahiplerini en iyi pet kuaförlerine bağlayan dijital platformdur.
          </p>
        </div>
      </section>

      {/* Misyon */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Misyonumuz</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Milyonlarca pet sahibinin en güvenilir, en kaliteli pet kuaförüne kolayca ulaşmasını sağlamak için çalışıyoruz.
              Her evcil hayvanın özenle bakılmayı hak ettiğine inanıyoruz.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Aynı zamanda pet kuaförü işletmecilerinin dijitalleşmesine ve daha fazla müşteriye ulaşmasına destek oluyoruz.
            </p>
          </div>
          <div className="bg-orange-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vizyonumuz</h2>
            <p className="text-gray-600 leading-relaxed">
              Türkiye'nin her şehrinde, her pet sahibinin yakınındaki en iyi pet kuaförüne tek tıkla ulaşabildiği
              güvenilir ve erişilebilir bir ekosistem kurmak.
            </p>
          </div>
        </div>
      </section>

      {/* Değerler */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Değerlerimiz</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: 'Hayvanlara Saygı', desc: 'Her evcil hayvanı bir aile üyesi olarak görüyoruz.', color: 'text-red-500 bg-red-50' },
              { icon: Shield, title: 'Güven', desc: 'Tüm işletmeler onay sürecinden geçer, şeffaflık önceliğimizdir.', color: 'text-blue-500 bg-blue-50' },
              { icon: Star, title: 'Kalite', desc: 'Yalnızca kaliteli ve müşteri memnuniyetine odaklı işletmeleri listeliyoruz.', color: 'text-amber-500 bg-amber-50' },
              { icon: PawPrint, title: 'Topluluk', desc: 'Pet sahipleri ve işletmecilerden oluşan güçlü bir topluluk inşa ediyoruz.', color: 'text-teal-500 bg-teal-50' },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <div className={`w-12 h-12 ${v.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bizimle Birlikte Büyüyün</h2>
        <p className="text-gray-600 mb-8">Pet kuaförü işletiyorsanız, platformumuza katılın ve daha fazla müşteriye ulaşın.</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/kayit?role=business"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            İşletme Kaydı
          </Link>
          <Link
            href="/iletisim"
            className="border border-gray-300 hover:border-orange-400 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            İletişime Geç
          </Link>
        </div>
      </section>
    </div>
  )
}
