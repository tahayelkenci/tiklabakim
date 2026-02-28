import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// DELETE /api/dashboard/photos/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

  const photo = await db.businessPhoto.findUnique({ where: { id: params.id } })
  if (!photo) return NextResponse.json({ error: 'Fotoğraf bulunamadı.' }, { status: 404 })

  const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business || photo.businessId !== business.id) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
  }

  await db.businessPhoto.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

// PATCH /api/dashboard/photos/[id] — caption veya order güncelle
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })

  const photo = await db.businessPhoto.findUnique({ where: { id: params.id } })
  if (!photo) return NextResponse.json({ error: 'Fotoğraf bulunamadı.' }, { status: 404 })

  const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business || photo.businessId !== business.id) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })
  }

  const body = await req.json()
  const updated = await db.businessPhoto.update({
    where: { id: params.id },
    data: {
      ...(body.caption !== undefined && { caption: body.caption }),
      ...(body.order !== undefined && { order: body.order }),
    },
  })

  return NextResponse.json(updated)
}
