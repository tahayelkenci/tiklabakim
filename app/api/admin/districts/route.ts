import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const body = await req.json()
  const { cityId, name, slug, isPublished = false } = body

  if (!cityId || !name || !slug) {
    return NextResponse.json({ error: 'cityId, name ve slug zorunludur' }, { status: 400 })
  }

  const existing = await db.district.findUnique({
    where: { cityId_slug: { cityId, slug } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Bu slug bu şehirde zaten mevcut' }, { status: 409 })
  }

  const district = await db.district.create({
    data: { cityId, name, slug, isPublished },
  })

  return NextResponse.json(district, { status: 201 })
}
