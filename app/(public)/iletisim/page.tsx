export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { IletisimForm } from '@/components/public/iletisim-form'

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({ where: { slug: 'iletisim' } })
  return {
    title: page?.metaTitle || page?.title || 'İletişim | Tıkla Bakım',
    description: page?.metaDesc || 'Sorularınız için bize ulaşın, en kısa sürede yanıt vereceğiz.',
  }
}

export default async function IletisimPage() {
  const page = await db.page.findUnique({ where: { slug: 'iletisim' } })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center pt-16 pb-4 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{page?.title || 'İletişim'}</h1>
        <p className="text-lg text-gray-600">Sorularınız için bize ulaşın, en kısa sürede yanıt vereceğiz.</p>
      </div>
      {page?.content && (
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      )}
      <IletisimForm />
    </div>
  )
}
