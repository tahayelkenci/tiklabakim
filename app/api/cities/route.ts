import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/cities — yayınlanmış şehirleri döner
export async function GET() {
  const cities = await db.city.findMany({
    where: { isPublished: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(cities)
}
