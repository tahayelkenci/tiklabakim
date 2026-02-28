import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const body = await req.json()
  const { name, slug, description, icon, order, isActive } = body

  const category = await db.category.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description: description || null }),
      ...(icon !== undefined && { icon: icon || null }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json(category)
}
