import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createPetSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['DOG', 'CAT', 'RABBIT', 'BIRD', 'OTHER']),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  weight: z.number().optional(),
  gender: z.string().optional(),
  notes: z.string().optional(),
  allergies: z.string().optional(),
})

// GET /api/pets — Kullanıcının petleri
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const pets = await db.pet.findMany({
      where: { ownerId: session.user.id, isActive: true },
      include: {
        vaccines: { orderBy: { date: 'desc' }, take: 5 },
        _count: { select: { appointments: true, groomingRecords: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(pets)
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// POST /api/pets — Yeni pet ekle
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    // Herhangi bir giriş yapmış kullanıcı pet ekleyebilir (işletme sahipleri de)
    const body = await req.json()
    const parsed = createPetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { birthDate, ...rest } = parsed.data

    const pet = await db.pet.create({
      data: {
        ...rest,
        ownerId: session.user.id,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    })

    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
