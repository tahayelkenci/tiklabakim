'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/slug'

interface SearchSuggestion {
  type: 'city' | 'district' | 'business'
  label: string
  url: string
}

const POPULAR_CITIES = [
  { name: 'İstanbul', slug: 'istanbul' },
  { name: 'Ankara', slug: 'ankara' },
  { name: 'İzmir', slug: 'izmir' },
  { name: 'Bursa', slug: 'bursa' },
  { name: 'Antalya', slug: 'antalya' },
  { name: 'Adana', slug: 'adana' },
  { name: 'Konya', slug: 'konya' },
  { name: 'Gaziantep', slug: 'gaziantep' },
  { name: 'Mersin', slug: 'mersin' },
  { name: 'Kayseri', slug: 'kayseri' },
]

export function SearchBox({ placeholder = 'Şehir veya ilçe ara...' }: { placeholder?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions || [])
        }
      } catch {
        // Hata durumunda şehir önerileri
        const cityMatches = POPULAR_CITIES.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase())
        ).map((c) => ({
          type: 'city' as const,
          label: `${c.name} Pet Kuaförleri`,
          url: `/pet-kuafor/${c.slug}`,
        }))
        setSuggestions(cityMatches)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/arama?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSuggestionClick = (url: string) => {
    setShowDropdown(false)
    setQuery('')
    router.push(url)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center px-4">
            <MapPin className="w-5 h-5 text-orange-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            className="flex-1 py-4 text-gray-800 placeholder-gray-400 outline-none text-base bg-transparent"
            autoComplete="off"
          />
          <button
            type="submit"
            className="m-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ara</span>
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(s.url)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-400">
                {s.type === 'city' ? '🏙️' : s.type === 'district' ? '📍' : '✂️'}
              </span>
              <span className="text-gray-700 text-sm">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
