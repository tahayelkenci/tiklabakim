import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/dashboard/photos — İşletmenin tüm fotoğraflarını listele
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

  const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 })

  const photos = await db.businessPhoto.findMany({
    where: { businessId: business.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(photos)
}

// POST /api/dashboard/photos — Yeni fotoğraf ekle
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

  const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 })

  const body = await req.json()
  const { url, caption } = body
  if (!url) return NextResponse.json({ error: 'URL gerekli.' }, { status: 400 })

  const maxOrder = await db.businessPhoto.aggregate({
    where: { businessId: business.id },
    _max: { order: true },
  })
  const order = (maxOrder._max.order ?? -1) + 1

  const photo = await db.businessPhoto.create({
    data: { businessId: business.id, url, caption: caption || null, order },
  })

  return NextResponse.json(photo, { status: 201 })
}
