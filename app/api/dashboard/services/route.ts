import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const serviceSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().default('tum'),
  price: z.number().optional().nullable(),
  duration: z.number().optional().nullable(),
  description: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

    const business = await db.business.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })
    if (!business) return NextResponse.json({ error: 'İşletme yok.' }, { status: 404 })

    const body = await req.json()
    const parsed = serviceSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })

    const service = await db.service.create({
      data: { ...parsed.data, businessId: business.id },
    })

    return NextResponse.json(service, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
