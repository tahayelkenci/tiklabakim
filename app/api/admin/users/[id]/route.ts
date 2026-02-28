import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// PATCH /api/admin/users/[id] — kullanıcı güncelle + işletme bağla
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, phone, role, isActive, linkBusinessId, unlinkBusinessId } = body

  // İşletme bağlama
  if (linkBusinessId) {
    await db.business.update({
      where: { id: linkBusinessId },
      data: { ownerId: params.id },
    })
    return NextResponse.json({ ok: true })
  }

  // İşletme bağını kaldır
  if (unlinkBusinessId) {
    await db.business.update({
      where: { id: unlinkBusinessId },
      data: { ownerId: null },
    })
    return NextResponse.json({ ok: true })
  }

  // Kullanıcı güncelle
  const user = await db.user.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, phone: true },
  })

  return NextResponse.json(user)
}
