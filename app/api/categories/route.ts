import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/categories — aktif kategorileri döner
export async function GET() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(categories)
}
