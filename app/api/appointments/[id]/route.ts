import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import {
  notifyAppointmentConfirmed,
  notifyAppointmentRejected,
  notifyGroomingCompleted,
} from '@/lib/notifications'

const updateSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  groomingNotes: z.string().optional(),
  totalPrice: z.number().optional(),
  noShow: z.boolean().optional(),
})

// PATCH /api/appointments/[id] — Randevu güncelle (kuaför için)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const appointment = await db.appointment.findUnique({
      where: { id: params.id },
      include: { business: true },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 })
    }

    // Yetki kontrolü
    const isOwner = appointment.business.ownerId === session.user.id
    const isPetOwner = appointment.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isPetOwner && !isAdmin) {
      return NextResponse.json({ error: 'Yetersiz yetki.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const data: any = { ...parsed.data }

    // İptal — sadece pet sahibi veya admin
    if (parsed.data.status === 'CANCELLED' && !isPetOwner && !isAdmin) {
      return NextResponse.json({ error: 'Randevuyu sadece müşteri iptal edebilir.' }, { status: 403 })
    }

    // Tamamlandı ise completedAt set et
    if (parsed.data.status === 'COMPLETED') {
      data.completedAt = new Date()
    }

    const updated = await db.appointment.update({
      where: { id: params.id },
      data,
    })

    // Bildirimler
    if (parsed.data.status === 'CONFIRMED') {
      await notifyAppointmentConfirmed(params.id)
    } else if (parsed.data.status === 'CANCELLED') {
      await notifyAppointmentRejected(params.id)
    } else if (parsed.data.status === 'COMPLETED') {
      await notifyGroomingCompleted(params.id)
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Randevu güncelleme hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// DELETE /api/appointments/[id] — Randevu iptal et
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const appointment = await db.appointment.findUnique({
      where: { id: params.id },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 })
    }

    if (appointment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki.' }, { status: 403 })
    }

    // 2 saat öncesine kadar iptal edilebilir
    const hoursUntil = (appointment.date.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntil < 2 && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Randevu 2 saatten az süre kala iptal edilemez.' },
        { status: 400 }
      )
    }

    await db.appointment.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
