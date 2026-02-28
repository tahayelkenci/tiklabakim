import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { BusinessDetailView } from '@/components/business/business-detail-view'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const [cat, business] = await Promise.all([
    db.category.findUnique({ where: { slug: category } }),
    db.business.findFirst({
      where: { slug, isActive: true },
      select: { name: true, description: true, metaTitle: true, metaDesc: true },
    }),
  ])
  if (!cat?.isActive || !business) return { title: 'Bulunamadı' }
  return {
    title: business.metaTitle || `${business.name} — ${cat.name} | Tıkla Bakım`,
    description: business.metaDesc || business.description || undefined,
    alternates: { canonical: `/${category}/${slug}` },
  }
}

export default async function CategoryBusinessPage({ params }: Props) {
  const { category, slug } = await params

  const cat = await db.category.findUnique({ where: { slug: category } })
  if (!cat?.isActive) notFound()

  // Verify business belongs to this category
  const business = await db.business.findFirst({
    where: { slug, isActive: true, categoryId: cat.id },
    select: { id: true },
  })
  if (!business) notFound()

  return <BusinessDetailView slug={slug} categorySlug={category} categoryName={cat.name} />
}
