import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const serviceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().optional(),
  price: z.number().optional().nullable(),
  duration: z.number().optional().nullable(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

    const service = await db.service.findUnique({
      where: { id: params.id },
      include: { business: true },
    })
    if (!service) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 })
    if (service.business.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = serviceSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Geçersiz veri.' }, { status: 400 })

    const updated = await db.service.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

    const service = await db.service.findUnique({
      where: { id: params.id },
      include: { business: true },
    })
    if (!service) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 })
    if (service.business.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki.' }, { status: 403 })
    }

    await db.service.update({ where: { id: params.id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
