import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { notifyNewAppointmentRequest } from '@/lib/notifications'

const createAppointmentSchema = z.object({
  businessId: z.string(),
  petId: z.string(),
  serviceId: z.string().optional().nullable(),
  date: z.string().datetime(),
  duration: z.number().min(15).max(480).default(60),
  notes: z.string().optional(),
})

// POST /api/appointments — Randevu oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createAppointmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { businessId, petId, serviceId, date, duration, notes } = parsed.data

    // İşletme mevcut mu ve online randevu aktif mi?
    const business = await db.business.findUnique({ where: { id: businessId } })
    if (!business || !business.isActive) {
      return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 })
    }
    if (business.plan !== 'PREMIUM' && business.plan !== 'ENTERPRISE') {
      return NextResponse.json({ error: 'Bu işletme online randevu almıyor.' }, { status: 400 })
    }

    // Pet kullanıcıya ait mi?
    const pet = await db.pet.findUnique({ where: { id: petId } })
    if (!pet || pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Pet bulunamadı.' }, { status: 404 })
    }

    // Geçmiş tarih kontrolü
    const appointmentDate = new Date(date)
    if (appointmentDate <= new Date()) {
      return NextResponse.json({ error: 'Geçmiş tarih seçilemez.' }, { status: 400 })
    }

    // No-show kontrolü (3+ no-show olan kullanıcılar bloke)
    const noShowCount = await db.appointment.count({
      where: {
        userId: session.user.id,
        businessId,
        status: 'NO_SHOW',
      },
    })
    if (noShowCount >= 3) {
      return NextResponse.json(
        { error: 'Çok fazla randevuya gelmeme durumunuz var. Bu işletmeye randevu alamazsınız.' },
        { status: 403 }
      )
    }

    const appointment = await db.appointment.create({
      data: {
        businessId,
        petId,
        userId: session.user.id,
        serviceId: serviceId || null,
        date: appointmentDate,
        duration,
        notes,
        status: 'PENDING',
      },
    })

    // Kuaföre bildirim gönder
    await notifyNewAppointmentRequest(appointment.id)

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Randevu oluşturma hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// GET /api/appointments — Kullanıcının randevuları
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const businessId = searchParams.get('businessId')

    let where: any = {}

    if (session.user.role === 'PET_OWNER') {
      where.userId = session.user.id
    } else if (session.user.role === 'BUSINESS_OWNER') {
      // Kuaförün kendi işletmesinin randevuları
      const ownedBusiness = await db.business.findFirst({
        where: { ownerId: session.user.id },
        select: { id: true },
      })
      if (!ownedBusiness) return NextResponse.json([])
      where.businessId = ownedBusiness.id
    }

    if (status) where.status = status
    if (businessId && session.user.role === 'ADMIN') where.businessId = businessId

    const appointments = await db.appointment.findMany({
      where,
      include: {
        pet: { select: { name: true, type: true, breed: true, photo: true } },
        user: { select: { name: true, phone: true, email: true } },
        business: { select: { name: true, address: true } },
        service: { select: { name: true, price: true } },
        photos: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Randevu listesi hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
