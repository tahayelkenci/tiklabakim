import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { name, slug, icon, isActive, seoTitle, seoDescription, seoContent } = body

  const petType = await db.petType.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(icon !== undefined && { icon: icon || null }),
      ...(isActive !== undefined && { isActive }),
      ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
      ...(seoDescription !== undefined && { seoDescription: seoDescription || null }),
      ...(seoContent !== undefined && { seoContent: seoContent || null }),
    },
  })
  return NextResponse.json(petType)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const { id } = await params
  await db.petType.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
