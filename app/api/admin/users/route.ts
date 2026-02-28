import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/users — Kullanıcı listesi
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki.' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const role = searchParams.get('role') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20

    const where: any = {}
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ]
    }
    if (role) where.role = role

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { pets: true, appointments: true } },
          businesses: { select: { id: true, name: true, plan: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, pageSize })
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// PATCH /api/admin/users — Kullanıcı güncelle
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki.' }, { status: 403 })
    }

    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 })

    const user = await db.user.update({
      where: { id },
      data,
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
