import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const body = await req.json()
  const { name, slug, description, icon, order, isActive } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'Ad ve slug zorunludur.' }, { status: 400 })
  }

  try {
    const category = await db.category.create({
      data: { name, slug, description: description || null, icon: icon || null, order: order ?? 0, isActive: isActive ?? true },
    })
    return NextResponse.json(category, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Bu slug zaten kullanımda.' }, { status: 409 })
  }
}
