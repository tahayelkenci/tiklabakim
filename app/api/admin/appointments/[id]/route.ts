import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const { status } = await req.json()

  const appointment = await db.appointment.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json(appointment)
}
