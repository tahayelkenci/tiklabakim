import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/neighborhoods?districtId=xxx
export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const districtId = req.nextUrl.searchParams.get('districtId')
  if (!districtId) return NextResponse.json({ error: 'districtId gerekli.' }, { status: 400 })

  const neighborhoods = await db.neighborhood.findMany({
    where: { districtId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { businesses: true } } },
  })
  return NextResponse.json(neighborhoods)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const body = await req.json()
  const { districtId, name, slug, isPublished, seoTitle, seoDescription, seoContent } = body

  if (!districtId || !name || !slug) {
    return NextResponse.json({ error: 'districtId, ad ve slug zorunludur.' }, { status: 400 })
  }

  const existing = await db.neighborhood.findUnique({ where: { districtId_slug: { districtId, slug } } })
  if (existing) return NextResponse.json({ error: 'Bu slug bu ilçede zaten mevcut.' }, { status: 409 })

  const neighborhood = await db.neighborhood.create({
    data: {
      districtId,
      name,
      slug,
      isPublished: isPublished ?? false,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      seoContent: seoContent || null,
    },
    include: { _count: { select: { businesses: true } } },
  })
  return NextResponse.json(neighborhood, { status: 201 })
}
