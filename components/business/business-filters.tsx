'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Filter, X } from 'lucide-react'

interface Props {
  city: string
  district: string
  searchParams: {
    hizmet?: string
    tur?: string
    siralama?: string
    puan?: string
  }
}

const PET_TYPES = [
  { value: 'kopek', label: '🐕 Köpek' },
  { value: 'kedi', label: '🐈 Kedi' },
  { value: 'tavsan', label: '🐇 Tavşan' },
  { value: 'kus', label: '🐦 Kuş' },
]

const SERVICES = [
  { value: 'banyo', label: 'Banyo' },
  { value: 'tam-bakim', label: 'Tam Bakım' },
  { value: 'tirnak', label: 'Tırnak Kesimi' },
  { value: 'makas', label: 'Makas & Tıraş' },
  { value: 'kurutma', label: 'Kurutma' },
]

const RATINGS = [
  { value: '4', label: '4+ Yıldız' },
  { value: '3', label: '3+ Yıldız' },
]

export function BusinessFilters({ city, district, searchParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams as any)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('sayfa')
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  const hasFilters = searchParams.tur || searchParams.hizmet || searchParams.puan

  return (
    <>
      {/* Mobil filtre toggle */}
      <button
        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium mb-4"
        onClick={() => setOpen(!open)}
      >
        <Filter className="w-4 h-4" />
        Filtreler
        {hasFilters && (
          <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            !
          </span>
        )}
      </button>

      {/* Filtre paneli */}
      <div className={`${open ? 'block' : 'hidden lg:block'} bg-white rounded-xl border border-gray-200 p-5 sticky top-20`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Filtreler</h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Temizle
            </button>
          )}
        </div>

        {/* Pet Türü */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Pet Türü</h4>
          <div className="space-y-2">
            {PET_TYPES.map((pt) => (
              <label key={pt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="tur"
                  value={pt.value}
                  checked={searchParams.tur === pt.value}
                  onChange={() =>
                    updateFilter('tur', searchParams.tur === pt.value ? null : pt.value)
                  }
                  className="accent-orange-500"
                />
                <span className="text-sm text-gray-700">{pt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hizmet */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Hizmet</h4>
          <div className="space-y-2">
            {SERVICES.map((s) => (
              <label key={s.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchParams.hizmet === s.value}
                  onChange={() =>
                    updateFilter('hizmet', searchParams.hizmet === s.value ? null : s.value)
                  }
                  className="accent-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Minimum Puan */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Puan</h4>
          <div className="space-y-2">
            {RATINGS.map((r) => (
              <label key={r.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="puan"
                  value={r.value}
                  checked={searchParams.puan === r.value}
                  onChange={() =>
                    updateFilter('puan', searchParams.puan === r.value ? null : r.value)
                  }
                  className="accent-orange-500"
                />
                <span className="text-sm text-gray-700">{r.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
