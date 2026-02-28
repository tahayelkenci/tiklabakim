import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/notifications — Kullanıcı bildirimleri
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await db.notification.count({
      where: { userId: session.user.id, isRead: false },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// PATCH /api/notifications — Okundu işaretle
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const { id } = await req.json()

    if (id) {
      // Tek bildirimi okundu işaretle
      await db.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { isRead: true },
      })
    } else {
      // Tümünü okundu işaretle
      await db.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
