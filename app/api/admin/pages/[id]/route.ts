import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { title, content, metaTitle, metaDesc, isActive } = body

  const page = await db.page.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content: content || null }),
      ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
      ...(metaDesc !== undefined && { metaDesc: metaDesc || null }),
      ...(isActive !== undefined && { isActive }),
    },
  })
  return NextResponse.json(page)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const { id } = await params
  const page = await db.page.findUnique({ where: { id } })
  if (page?.isSystem) return NextResponse.json({ error: 'Sistem sayfaları silinemez.' }, { status: 400 })

  await db.page.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
