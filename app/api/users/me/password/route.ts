import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// PATCH /api/users/me/password — Şifre değiştir
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Tüm alanları doldurun.' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalı.' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user?.password) {
      return NextResponse.json({ error: 'Şifre değiştirilemiyor (OAuth hesabı).' }, { status: 400 })
    }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Mevcut şifre yanlış.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
