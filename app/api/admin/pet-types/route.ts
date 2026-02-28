import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const petTypes = await db.petType.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(petTypes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const body = await req.json()
  const { name, slug, icon, isActive, seoTitle, seoDescription, seoContent } = body

  if (!name || !slug) return NextResponse.json({ error: 'Ad ve slug zorunludur.' }, { status: 400 })

  const existing = await db.petType.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 409 })

  const petType = await db.petType.create({
    data: { name, slug, icon: icon || null, isActive: isActive ?? true, seoTitle: seoTitle || null, seoDescription: seoDescription || null, seoContent: seoContent || null },
  })
  return NextResponse.json(petType, { status: 201 })
}
