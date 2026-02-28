import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { generateBusinessSlug } from '@/lib/slug'

// GET /api/businesses — Filtrelenmiş işletme listesi
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const district = searchParams.get('district')
    const search = searchParams.get('search')
    const plan = searchParams.get('plan')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '12'), 50)
    const skip = (page - 1) * pageSize

    const where: any = { isActive: true }
    if (city) where.city = city
    if (district) where.district = district
    if (plan) where.plan = plan
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ]
    }

    const [businesses, total] = await Promise.all([
      db.business.findMany({
        where,
        include: {
          services: { where: { isActive: true }, take: 3, orderBy: { order: 'asc' } },
          reviews: { select: { rating: true } },
          photos: { take: 1, orderBy: { order: 'asc' } },
        },
        orderBy: [{ featuredScore: 'desc' }, { plan: 'desc' }],
        skip,
        take: pageSize,
      }),
      db.business.count({ where }),
    ])

    const enriched = businesses.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description,
      address: b.address,
      city: b.city,
      district: b.district,
      phone: b.phone,
      logo: b.logo,
      coverPhoto: b.coverPhoto || b.photos[0]?.url,
      plan: b.plan,
      isVerified: b.isVerified,
      isFeatured: b.isFeatured,
      avgRating:
        b.reviews.length > 0
          ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length
          : 0,
      reviewCount: b.reviews.length,
      services: b.services.map((s) => ({
        name: s.name,
        price: s.price ? Number(s.price) : null,
      })),
    }))

    return NextResponse.json({
      businesses: enriched,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('İşletme listesi hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

const createBusinessSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email(), z.literal('')]).optional().transform(v => v || null),
  website: z.union([z.string().url(), z.literal('')]).optional().transform(v => v || null),
  address: z.string().min(2),
  city: z.string().min(2),
  district: z.string().min(2),
  neighborhood: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
})

// POST /api/businesses — Yeni işletme oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    if (session.user.role !== 'BUSINESS_OWNER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetersiz yetki.' }, { status: 403 })
    }

    // Kullanıcının zaten bir işletmesi var mı?
    const existing = await db.business.findFirst({
      where: { ownerId: session.user.id },
    })
    if (existing && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Zaten bir işletmeniz var.' }, { status: 409 })
    }

    const body = await req.json()
    const parsed = createBusinessSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const data = parsed.data
    const baseSlug = generateBusinessSlug(data.name, data.district)

    // Slug benzersizliği
    let slug = baseSlug
    let counter = 1
    while (await db.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const business = await db.business.create({
      data: {
        ...data,
        slug,
        ownerId: session.user.id,
      },
    })

    return NextResponse.json(business, { status: 201 })
  } catch (error) {
    console.error('İşletme oluşturma hatası:', error)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
