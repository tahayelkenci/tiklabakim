import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Phone, Clock, CheckCircle, Crown } from 'lucide-react'
import { formatPrice, getPlanColor, getPlanName } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BusinessCardProps {
  business: {
    id: string
    slug: string
    name: string
    description?: string | null
    address: string
    city: string
    district: string
    phone?: string | null
    logo?: string | null
    coverPhoto?: string | null
    plan: string
    isVerified: boolean
    isFeatured: boolean
    avgRating?: number
    reviewCount?: number
    services?: { name: string; price?: number | null }[]
  }
  categorySlug?: string
  showPlan?: boolean
}

export function BusinessCard({ business, categorySlug = 'pet-kuafor', showPlan = true }: BusinessCardProps) {
  const isPremium = business.plan === 'PREMIUM' || business.plan === 'ENTERPRISE'
  const avgRating = business.avgRating || 0
  const reviewCount = business.reviewCount || 0

  const profileUrl = `/${categorySlug}/${business.slug}`

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden transition-shadow duration-200 hover:shadow-md ${
        isPremium ? 'border-amber-400 border-2' : 'border-gray-200'
      }`}
    >
      {/* Cover */}
      <div className="relative h-40 bg-gradient-to-r from-orange-100 to-teal-100">
        {business.coverPhoto ? (
          <Image
            src={business.coverPhoto}
            alt={business.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-20">✂️</span>
          </div>
        )}

        {/* Plan badge */}
        {showPlan && business.plan !== 'FREE' && (
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getPlanColor(business.plan)}`}
            >
              {business.plan === 'ENTERPRISE' && <Crown className="w-3 h-3" />}
              {getPlanName(business.plan)}
            </span>
          </div>
        )}

        {/* Öne çıkan */}
        {business.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white">
              ⭐ Öne Çıkan
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden -mt-8 border-2 border-white shadow-sm">
            {business.logo ? (
              <Image
                src={business.logo}
                alt={`${business.name} logo`}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                🐾
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 mt-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-gray-900 truncate">{business.name}</h3>
              {business.isVerified && (
                <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(avgRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </span>
              {reviewCount > 0 && (
                <span className="text-xs text-gray-400">({reviewCount} yorum)</span>
              )}
            </div>
          </div>
        </div>

        {/* Adres */}
        <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{business.district}, {business.city}</span>
        </div>

        {/* Telefon */}
        {business.phone && (
          <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{business.phone}</span>
          </div>
        )}

        {/* Hizmetler */}
        {business.services && business.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {business.services.slice(0, 3).map((service, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {service.name}
                {service.price && ` · ${formatPrice(service.price)}`}
              </span>
            ))}
            {business.services.length > 3 && (
              <span className="text-xs text-gray-400">
                +{business.services.length - 3} daha
              </span>
            )}
          </div>
        )}

        {/* Butonlar */}
        <div className="flex gap-2 mt-4">
          <Link
            href={profileUrl}
            className="flex-1 text-center py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Profil Gör
          </Link>
          {isPremium ? (
            <Link
              href={`${profileUrl}#randevu`}
              className="flex-1 text-center py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
            >
              Randevu Al
            </Link>
          ) : (
            <a
              href={`tel:${business.phone}`}
              className="flex-1 text-center py-2 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
            >
              Ara
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
