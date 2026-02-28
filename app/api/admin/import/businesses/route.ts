/**
 * Toplu İşletme İçe Aktarma API
 * POST /api/admin/import/businesses
 *
 * Body: { businesses: Business[], dryRun?: boolean }
 *
 * Her bir işletme nesnesi şu alanları destekler:
 * {
 *   name: string           (zorunlu)
 *   slug: string           (zorunlu, benzersiz)
 *   address: string        (zorunlu)
 *   city: string           (zorunlu, şehir slug'ı — örn: "istanbul")
 *   district: string       (zorunlu, ilçe slug'ı — örn: "kadikoy")
 *   categorySlug?: string  (örn: "pet-kuafor") — varsayılan: "pet-kuafor"
 *   phone?: string
 *   email?: string
 *   website?: string
 *   description?: string
 *   lat?: number
 *   lng?: number
 *   plan?: "FREE"|"BASIC"|"PREMIUM"|"ENTERPRISE"
 *   isActive?: boolean
 *   isVerified?: boolean
 *   instagram?: string
 *   facebook?: string
 * }
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

interface BusinessImportItem {
  name: string
  slug: string
  address: string
  city: string
  district: string
  categorySlug?: string
  phone?: string
  email?: string
  website?: string
  description?: string
  lat?: number
  lng?: number
  plan?: string
  isActive?: boolean
  isVerified?: boolean
  isFeatured?: boolean
  instagram?: string
  facebook?: string
}

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const body = await req.json()
  const { businesses, dryRun = false } = body as {
    businesses: BusinessImportItem[]
    dryRun?: boolean
  }

  if (!Array.isArray(businesses) || businesses.length === 0) {
    return NextResponse.json({ error: '"businesses" dizisi boş veya eksik' }, { status: 400 })
  }

  if (businesses.length > 500) {
    return NextResponse.json({ error: 'Tek seferde en fazla 500 işletme aktarılabilir' }, { status: 400 })
  }

  // Kategori haritasını yükle
  const categories = await db.category.findMany({ select: { id: true, slug: true } })
  const categoryMap: Record<string, string> = {}
  categories.forEach((c) => { categoryMap[c.slug] = c.id })

  const results = {
    total: businesses.length,
    created: 0,
    skipped: 0,
    errors: [] as { slug: string; reason: string }[],
    dryRun,
  }

  for (const biz of businesses) {
    // Zorunlu alan kontrolü
    if (!biz.name || !biz.slug || !biz.address || !biz.city || !biz.district) {
      results.errors.push({
        slug: biz.slug || '(slug yok)',
        reason: 'name, slug, address, city, district zorunludur',
      })
      continue
    }

    // Slug benzersizlik kontrolü
    const existing = await db.business.findUnique({ where: { slug: biz.slug } })
    if (existing) {
      results.skipped++
      results.errors.push({ slug: biz.slug, reason: 'Bu slug zaten mevcut — atlandı' })
      continue
    }

    const categoryId = categoryMap[biz.categorySlug || 'pet-kuafor'] || categoryMap['pet-kuafor'] || null

    const allowedPlans = ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE']
    const plan = biz.plan && allowedPlans.includes(biz.plan) ? biz.plan : 'FREE'

    if (!dryRun) {
      try {
        await db.business.create({
          data: {
            name: biz.name,
            slug: biz.slug,
            address: biz.address,
            city: biz.city,
            district: biz.district,
            phone: biz.phone || null,
            email: biz.email || null,
            website: biz.website || null,
            description: biz.description || null,
            lat: biz.lat || null,
            lng: biz.lng || null,
            plan,
            isActive: biz.isActive !== undefined ? biz.isActive : true,
            isVerified: biz.isVerified !== undefined ? biz.isVerified : false,
            isFeatured: biz.isFeatured || false,
            instagram: biz.instagram || null,
            facebook: biz.facebook || null,
            categoryId,
            featuredScore: plan === 'ENTERPRISE' ? 200 : plan === 'PREMIUM' ? 150 : plan === 'BASIC' ? 100 : 0,
          },
        })
        results.created++
      } catch (e: any) {
        results.errors.push({ slug: biz.slug, reason: e.message || 'Veritabanı hatası' })
      }
    } else {
      // Dry run — sadece say
      results.created++
    }
  }

  return NextResponse.json({
    ...results,
    message: dryRun
      ? `DRY RUN: ${results.created} işletme oluşturulabilir, ${results.skipped} atlanır`
      : `${results.created} işletme oluşturuldu, ${results.skipped} atlandı`,
  })
}
