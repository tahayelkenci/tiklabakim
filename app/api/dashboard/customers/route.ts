import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

    const business = await db.business.findFirst({
      where: { ownerId: session.user.id },
      select: { id: true },
    })
    if (!business) return NextResponse.json([])

    // İşletmenin tüm randevularından müşteri listesi
    const appointments = await db.appointment.findMany({
      where: { businessId: business.id },
      include: {
        pet: { select: { name: true, type: true, breed: true } },
        user: { select: { name: true, phone: true } },
      },
      orderBy: { date: 'desc' },
    })

    // Pet bazında grupla
    const petMap = new Map<string, any>()
    for (const apt of appointments) {
      const key = apt.petId
      if (!petMap.has(key)) {
        petMap.set(key, {
          petId: apt.petId,
          petName: apt.pet.name,
          petType: apt.pet.type,
          petBreed: apt.pet.breed,
          userName: apt.user.name,
          userPhone: apt.user.phone,
          lastVisit: apt.status === 'COMPLETED' ? apt.date : null,
          totalVisits: 0,
          noShowCount: 0,
        })
      }
      const entry = petMap.get(key)!
      if (apt.status === 'COMPLETED') {
        entry.totalVisits++
        if (!entry.lastVisit || apt.date > entry.lastVisit) {
          entry.lastVisit = apt.date
        }
      }
      if (apt.status === 'NO_SHOW') {
        entry.noShowCount++
      }
    }

    return NextResponse.json(Array.from(petMap.values()))
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
