import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { name, slug, isPublished, seoTitle, seoDescription, seoContent } = body

  const neighborhood = await db.neighborhood.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(isPublished !== undefined && { isPublished }),
      ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
      ...(seoDescription !== undefined && { seoDescription: seoDescription || null }),
      ...(seoContent !== undefined && { seoContent: seoContent || null }),
    },
    include: { _count: { select: { businesses: true } } },
  })
  return NextResponse.json(neighborhood)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const { id } = await params
  await db.neighborhood.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
