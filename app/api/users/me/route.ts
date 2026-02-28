import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/users/me — Oturum açmış kullanıcı bilgileri
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, image: true, createdAt: true },
    })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// PATCH /api/users/me — Profil güncelle
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const { name, phone } = await req.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Ad Soyad boş olamaz.' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name: name.trim(), phone: phone?.trim() || null },
      select: { id: true, name: true, email: true, phone: true },
    })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
