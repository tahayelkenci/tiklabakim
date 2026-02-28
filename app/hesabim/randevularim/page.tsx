'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Loader2, MapPin, Scissors, X } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel, getPetTypeEmoji } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function RandevularimPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')
  const { toast } = useToast()

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  const cancelAppointment = async (id: string) => {
    if (!confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) return
    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ title: 'Randevu iptal edildi.' })
      loadAppointments()
    } else {
      const err = await res.json()
      toast({ title: 'Hata', description: err.error, variant: 'destructive' })
    }
  }

  const now = new Date()
  const filtered = appointments.filter((apt) => {
    if (filter === 'upcoming') {
      return (
        ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(apt.status) &&
        new Date(apt.date) >= now
      )
    }
    return ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(apt.status)
  })

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Randevularım</h1>
        <Link
          href="/pet-kuafor"
          className="text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          + Yeni Randevu Al
        </Link>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'upcoming', label: 'Yaklaşan' },
          { value: 'past', label: 'Geçmiş' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {filter === 'upcoming' ? 'Yaklaşan randevu yok' : 'Geçmiş randevu yok'}
          </h3>
          {filter === 'upcoming' && (
            <Link
              href="/pet-kuafor"
              className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
            >
              Kuaför Ara
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {getPetTypeEmoji(apt.pet.type)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {apt.pet.name} → {apt.business.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateTime(apt.date)}
                    </div>
                    {apt.service && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                        <Scissors className="w-3.5 h-3.5" />
                        {apt.service.name}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {apt.business.district}, {apt.business.city}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                  {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                    <button
                      onClick={() => cancelAppointment(apt.id)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                      İptal Et
                    </button>
                  )}
                </div>
              </div>

              {/* Bakım sonrası fotoğraflar */}
              {apt.photos && apt.photos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Bakım Fotoğrafları:</p>
                  <div className="flex gap-2">
                    {apt.photos.map((photo: any) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={photo.type}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
