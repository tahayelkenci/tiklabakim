import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı').max(100),
  email: z.string().email('Geçersiz email adresi'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  phone: z.string().optional(),
  role: z.enum(['PET_OWNER', 'BUSINESS_OWNER']).default('PET_OWNER'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, phone, role } = parsed.data

    // Email kullanılıyor mu?
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı.' },
        { status: 409 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Kayıt hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
