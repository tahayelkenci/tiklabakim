import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// GET /api/businesses/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const business = await db.business.findUnique({
      where: { id: params.id },
      include: {
        services: { where: { isActive: true }, orderBy: { order: 'asc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        reviews: {
          where: { isVisible: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        photos: { orderBy: { order: 'asc' } },
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

const updateBusinessSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().min(5).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
})

// PATCH /api/businesses/[id] — İşletme güncelle
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const business = await db.business.findUnique({ where: { id: params.id } })
    if (!business) {
      return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 })
    }

    // Yetki kontrolü
    if (session.user.role !== 'ADMIN' && business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Yetersiz yetki.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateBusinessSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const updated = await db.business.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('İşletme güncelleme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
