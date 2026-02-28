import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Para formatı (Türk Lirası)
 */
export function formatPrice(amount: number | string | null): string {
  if (amount === null || amount === undefined) return 'Fiyat belirtilmemiş'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Tarih formatı
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Kısa tarih formatı
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Saat formatı
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Tarih + Saat
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Kaç zaman önce
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Az önce'
  if (minutes < 60) return `${minutes} dakika önce`
  if (hours < 24) return `${hours} saat önce`
  if (days < 30) return `${days} gün önce`
  return formatShortDate(d)
}

/**
 * Yıldız rating
 */
export function getStarRating(rating: number): string {
  return '⭐'.repeat(Math.round(rating))
}

/**
 * Plan badge rengi
 */
export function getPlanColor(plan: string): string {
  const colors: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    BASIC: 'bg-blue-100 text-blue-700',
    PREMIUM: 'bg-amber-100 text-amber-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  }
  return colors[plan] || colors.FREE
}

/**
 * Plan Türkçe ismi
 */
export function getPlanName(plan: string): string {
  const names: Record<string, string> = {
    FREE: 'Ücretsiz',
    BASIC: 'Temel',
    PREMIUM: 'Premium',
    ENTERPRISE: 'Kurumsal',
  }
  return names[plan] || plan
}

/**
 * Randevu durumu Türkçe
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Bekliyor',
    CONFIRMED: 'Onaylandı',
    IN_PROGRESS: 'Devam Ediyor',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal Edildi',
    NO_SHOW: 'Gelmedi',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-teal-100 text-teal-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-gray-100 text-gray-600',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

/**
 * Pet türü Türkçe
 */
export function getPetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    DOG: 'Köpek',
    CAT: 'Kedi',
    RABBIT: 'Tavşan',
    BIRD: 'Kuş',
    OTHER: 'Diğer',
  }
  return labels[type] || type
}

export function getPetTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    DOG: '🐕',
    CAT: '🐈',
    RABBIT: '🐇',
    BIRD: '🐦',
    OTHER: '🐾',
  }
  return emojis[type] || '🐾'
}

/**
 * Haftanın günü
 */
export function getDayName(day: number): string {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  return days[day] || ''
}

/**
 * İşletme listeleme skoru hesapla
 */
export function calculateFeaturedScore(params: {
  plan: string
  avgRating: number
  reviewCount: number
  adBid?: number
}): number {
  const planWeights: Record<string, number> = {
    ENTERPRISE: 4,
    PREMIUM: 3,
    BASIC: 2,
    FREE: 1,
  }
  const planWeight = planWeights[params.plan] || 1
  const adBid = params.adBid || 0

  return (
    planWeight * 40 +
    params.avgRating * 30 +
    Math.min(params.reviewCount, 100) * 0.2 +
    adBid * 10
  )
}

/**
 * Sayfalama yardımcı
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  delta = 2
): (number | '...')[] {
  const range: (number | '...')[] = []
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i)
  }
  if (currentPage - delta > 2) range.unshift('...')
  if (currentPage + delta < totalPages - 1) range.push('...')
  range.unshift(1)
  if (totalPages !== 1) range.push(totalPages)
  return range
}
