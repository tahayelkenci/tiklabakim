import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile } from '@/lib/upload'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapın.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const subfolder = (formData.get('subfolder') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: 'Dosya seçilmedi.' }, { status: 400 })
    }

    // Güvenli subfolder
    const allowedSubfolders = ['businesses', 'pets', 'appointments', 'avatars']
    const safeSubfolder = allowedSubfolders.includes(subfolder) ? subfolder : 'general'

    const result = await uploadFile(file, safeSubfolder)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Upload hatası:', error)
    return NextResponse.json({ error: 'Yükleme başarısız.' }, { status: 500 })
  }
}
