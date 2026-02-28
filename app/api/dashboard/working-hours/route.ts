import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const hoursSchema = z.object({
  hours: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      openTime: z.string(),
      closeTime: z.string(),
      isClosed: z.boolean(),
    })
  ),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const business = await db.business.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })

    if (!business) {
      return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = hoursSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })
    }

    // Tümünü sil ve yeniden oluştur
    await db.workingHours.deleteMany({ where: { businessId: business.id } })
    await db.workingHours.createMany({
      data: parsed.data.hours.map((h) => ({
        businessId: business.id,
        ...h,
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
