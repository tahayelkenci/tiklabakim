import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/cities/[slug]/districts — ilgili şehrin ilçelerini döner
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const city = await db.city.findUnique({
    where: { slug: params.slug },
    include: {
      districts: {
        where: { isPublished: true },
        orderBy: { name: 'asc' },
      },
    },
  })

  if (!city) {
    return NextResponse.json({ error: 'Şehir bulunamadı.' }, { status: 404 })
  }

  return NextResponse.json(city.districts)
}
