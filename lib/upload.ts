import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Dosya yükleme (cPanel yerel depolama)
 */
export async function uploadFile(
  file: File,
  subfolder: string = 'general'
): Promise<UploadResult> {
  try {
    // Tip kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Desteklenmeyen dosya türü. Sadece JPEG, PNG, WebP ve GIF.' }
    }

    // Boyut kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'Dosya çok büyük. Maksimum 5MB.' }
    }

    // Klasör oluştur
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR, subfolder)
    await mkdir(uploadPath, { recursive: true })

    // Benzersiz dosya adı
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${uuidv4()}.${ext}`
    const filePath = path.join(uploadPath, filename)

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL üret (public klasörüne göre)
    const url = `/uploads/${subfolder}/${filename}`
    return { success: true, url }
  } catch (error) {
    console.error('Dosya yükleme hatası:', error)
    return { success: false, error: 'Dosya yüklenemedi.' }
  }
}

/**
 * Birden fazla dosya yükleme
 */
export async function uploadFiles(
  files: File[],
  subfolder: string = 'general'
): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadFile(file, subfolder)))
}

/**
 * Dosya silme
 */
export async function deleteFile(url: string): Promise<boolean> {
  try {
    const { unlink } = await import('fs/promises')
    const filePath = path.join(process.cwd(), 'public', url)
    await unlink(filePath)
    return true
  } catch {
    return false
  }
}
