import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await db.page.findUnique({ where: { slug } })
  if (!page || !page.isActive) return {}
  return {
    title: page.metaTitle || page.title,
    description: page.metaDesc ?? undefined,
  }
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params
  const page = await db.page.findUnique({ where: { slug } })

  if (!page || !page.isActive || page.isSystem) notFound()

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-orange-50 to-teal-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-12">
        {page.content ? (
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-gray-500 text-center">İçerik henüz eklenmedi.</p>
        )}
      </section>
    </div>
  )
}
