import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { isPublished, name, slug, seoTitle, seoDescription, seoContent } = body

  const district = await db.district.update({
    where: { id },
    data: {
      ...(isPublished !== undefined && { isPublished }),
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
      ...(seoDescription !== undefined && { seoDescription: seoDescription || null }),
      ...(seoContent !== undefined && { seoContent: seoContent || null }),
    },
  })

  return NextResponse.json(district)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { id } = await params

  await db.district.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
