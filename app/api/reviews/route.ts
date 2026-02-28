import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const reviewSchema = z.object({
  businessId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

// POST /api/reviews — Yorum ekle
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { businessId, rating, comment } = parsed.data

    // Daha önce yorum yapmış mı?
    const existing = await db.review.findUnique({
      where: { businessId_userId: { businessId, userId: session.user.id } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Bu işletme için zaten yorum yaptınız.' },
        { status: 409 }
      )
    }

    // Gerçek randevudan mı?
    const hasCompletedAppointment = await db.appointment.findFirst({
      where: {
        businessId,
        userId: session.user.id,
        status: 'COMPLETED',
      },
    })

    const review = await db.review.create({
      data: {
        businessId,
        userId: session.user.id,
        rating,
        comment,
        isVerified: !!hasCompletedAppointment,
      },
      include: {
        user: { select: { name: true } },
      },
    })

    // İşletmenin featuredScore'unu güncelle
    const allReviews = await db.review.findMany({
      where: { businessId, isVisible: true },
      select: { rating: true },
    })
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
        : 0

    const business = await db.business.findUnique({ where: { id: businessId } })
    if (business) {
      const planWeights: Record<string, number> = {
        ENTERPRISE: 4, PREMIUM: 3, BASIC: 2, FREE: 1,
      }
      const planWeight = planWeights[business.plan] || 1
      const newScore =
        planWeight * 40 + avgRating * 30 + Math.min(allReviews.length, 100) * 0.2

      await db.business.update({
        where: { id: businessId },
        data: { featuredScore: Math.round(newScore) },
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Yorum ekleme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
