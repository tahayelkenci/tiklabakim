import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// PATCH /api/dashboard/business — Temel bilgileri güncelle
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

    const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
    if (!business) return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 })

    const body = await req.json()
    const allowedFields = [
      'name', 'description', 'phone', 'email', 'website', 'address',
      'instagram', 'facebook', 'logo', 'coverPhoto', 'content',
      'metaTitle', 'metaDesc',
    ]
    const data: Record<string, any> = {}
    for (const field of allowedFields) {
      if (field in body) data[field] = body[field] ?? null
    }

    const updated = await db.business.update({ where: { id: business.id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// GET /api/dashboard/business — İşletme sahibinin kendi işletmesi
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const business = await db.business.findFirst({
      where: { ownerId: session.user.id },
      include: {
        services: { where: { isActive: true }, orderBy: { order: 'asc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        photos: { orderBy: { order: 'asc' } },
        _count: {
          select: {
            appointments: true,
            reviews: true,
          },
        },
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
