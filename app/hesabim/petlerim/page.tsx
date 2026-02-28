'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusCircle, Loader2, Syringe, Scissors } from 'lucide-react'
import { getPetTypeEmoji, formatShortDate } from '@/lib/utils'

export default function PetlerimPage() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pets')
      .then((r) => r.json())
      .then((data) => setPets(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Petlerim</h1>
        <Link
          href="/hesabim/petlerim/yeni"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Pet Ekle
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">🐾</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz Pet Eklemediniz</h3>
          <p className="text-gray-500 text-sm mb-6">
            Petinizi ekleyin ve bakım geçmişini takip edin.
          </p>
          <Link
            href="/hesabim/petlerim/yeni"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            İlk Petini Ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-orange-100 to-teal-100 flex items-center justify-center text-6xl">
                {getPetTypeEmoji(pet.type)}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-xl text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-500">
                  {pet.type === 'DOG' ? '🐕 Köpek' : pet.type === 'CAT' ? '🐈 Kedi' : pet.type}
                  {pet.breed && ` · ${pet.breed}`}
                </p>
                {pet.weight && (
                  <p className="text-sm text-gray-500 mt-0.5">{pet.weight} kg</p>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    {pet._count?.groomingRecords || 0} bakım
                  </span>
                  <span className="flex items-center gap-1">
                    <Syringe className="w-3 h-3" />
                    {pet._count?.appointments || 0} randevu
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/hesabim/petlerim/${pet.id}`}
                    className="flex-1 text-center py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Profil
                  </Link>
                  <Link
                    href="/pet-kuafor"
                    className="flex-1 text-center py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    Randevu Al
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
