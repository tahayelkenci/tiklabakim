import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tiklabakim.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Statik sayfalar
  const staticPages = [
    { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/pet-kuafor', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/giris', priority: 0.3, changeFrequency: 'monthly' as const },
    { url: '/kayit', priority: 0.4, changeFrequency: 'monthly' as const },
  ]

  entries.push(
    ...staticPages.map((p) => ({
      url: `${SITE_URL}${p.url}`,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    }))
  )

  // Şehir sayfaları
  const cities = await db.business.findMany({
    where: { isActive: true },
    select: { city: true },
    distinct: ['city'],
  })

  entries.push(
    ...cities.map((c) => ({
      url: `${SITE_URL}/pet-kuafor/${c.city}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  )

  // İlçe sayfaları
  const districts = await db.business.findMany({
    where: { isActive: true },
    select: { city: true, district: true },
    distinct: ['city', 'district'],
  })

  entries.push(
    ...districts.map((d) => ({
      url: `${SITE_URL}/pet-kuafor/${d.city}/${d.district}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  )

  // İşletme profil sayfaları
  const businesses = await db.business.findMany({
    where: { isActive: true },
    select: {
      city: true,
      district: true,
      slug: true,
      updatedAt: true,
      plan: true,
    },
  })

  entries.push(
    ...businesses.map((b) => ({
      url: `${SITE_URL}/pet-kuafor/${b.city}/${b.district}/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: (b.plan === 'FREE' ? 'monthly' : 'weekly') as 'monthly' | 'weekly',
      priority: b.plan === 'ENTERPRISE' ? 0.8 : b.plan === 'PREMIUM' ? 0.7 : 0.5,
    }))
  )

  return entries
}
