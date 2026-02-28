import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const SYSTEM_PAGES = [
  { slug: 'hakkimizda', title: 'Hakkımızda', isSystem: true },
  { slug: 'iletisim', title: 'İletişim', isSystem: true },
  { slug: 'gizlilik', title: 'Gizlilik Politikası', isSystem: true },
  { slug: 'kullanim-kosullari', title: 'Kullanım Koşulları', isSystem: true },
  { slug: 'kvkk', title: 'KVKK', isSystem: true },
]

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  // Sistem sayfalarını otomatik oluştur (yoksa)
  for (const sp of SYSTEM_PAGES) {
    await db.page.upsert({
      where: { slug: sp.slug },
      update: {},
      create: { slug: sp.slug, title: sp.title, isSystem: true, isActive: true },
    })
  }

  const pages = await db.page.findMany({ orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }] })
  return NextResponse.json(pages)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  const body = await req.json()
  const { slug, title, content, metaTitle, metaDesc, isActive } = body

  if (!slug || !title) return NextResponse.json({ error: 'Slug ve başlık zorunludur.' }, { status: 400 })

  const existing = await db.page.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Bu slug zaten kullanılıyor.' }, { status: 409 })

  const page = await db.page.create({
    data: {
      slug,
      title,
      content: content || null,
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
      isActive: isActive ?? true,
      isSystem: false,
    },
  })
  return NextResponse.json(page, { status: 201 })
}
