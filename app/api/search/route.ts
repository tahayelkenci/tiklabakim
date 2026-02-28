import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

// GET /api/search?q=... — Arama önerileri
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions: any[] = []

    // İşletme adı arama
    const businesses = await db.business.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { district: { contains: q } },
          { city: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        city: true,
        district: true,
        slug: true,
      },
      take: 5,
      orderBy: { featuredScore: 'desc' },
    })

    businesses.forEach((b) => {
      suggestions.push({
        type: 'business',
        label: `${b.name} — ${b.district}`,
        url: `/pet-kuafor/${b.city}/${b.district}/${b.slug}`,
      })
    })

    // Şehir/İlçe arama
    const districts = await db.business.findMany({
      where: {
        isActive: true,
        district: { contains: q },
      },
      select: { city: true, district: true },
      distinct: ['city', 'district'],
      take: 3,
    })

    districts.forEach((d) => {
      if (!businesses.find((b) => b.district === d.district)) {
        suggestions.push({
          type: 'district',
          label: `${d.district} Pet Kuaförleri`,
          url: `/pet-kuafor/${d.city}/${d.district}`,
        })
      }
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    return NextResponse.json({ suggestions: [] })
  }
}
