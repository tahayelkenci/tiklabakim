'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Phone } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel, getPetTypeEmoji } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

type Status = 'all' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const { toast } = useToast()

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' ? '/api/appointments' : `/api/appointments?status=${filter}`
      const res = await fetch(url)
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
  }, [filter])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast({ title: 'Güncellendi', description: 'Randevu durumu güncellendi.' })
        loadAppointments()
      }
    } catch {
      toast({ title: 'Hata', description: 'Güncellenemedi.', variant: 'destructive' })
    }
  }

  const statuses: { value: Status; label: string }[] = [
    { value: 'all', label: 'Tümü' },
    { value: 'PENDING', label: 'Bekleyenler' },
    { value: 'CONFIRMED', label: 'Onaylananlar' },
    { value: 'IN_PROGRESS', label: 'Devam Edenler' },
    { value: 'COMPLETED', label: 'Tamamlananlar' },
    { value: 'CANCELLED', label: 'İptal Edilenler' },
    { value: 'NO_SHOW', label: 'Gelmeyenler' },
  ]

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Randevular</h1>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s.value
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Randevu Bulunamadı</h3>
          <p className="text-gray-500 text-sm">Bu kategoride randevu yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Pet & Müşteri Bilgisi */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {getPetTypeEmoji(apt.pet.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{apt.pet.name}</span>
                      {apt.pet.breed && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {apt.pet.breed}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      Sahip: {apt.user.name}
                    </div>
                    {apt.service && (
                      <div className="text-sm text-gray-500">
                        Hizmet: {apt.service.name}
                      </div>
                    )}
                    {apt.notes && (
                      <div className="text-xs text-gray-400 mt-1 italic">
                        &ldquo;{apt.notes}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                {/* Tarih & Durum */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-gray-600 justify-end mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm">{formatDateTime(apt.date)}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                </div>
              </div>

              {/* Aksiyonlar */}
              {apt.status === 'PENDING' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Onayla
                  </button>
                  <button
                    onClick={() => updateStatus(apt.id, 'CANCELLED')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reddet
                  </button>
                  {apt.user.phone && (
                    <a
                      href={`tel:${apt.user.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Ara
                    </a>
                  )}
                </div>
              )}

              {apt.status === 'CONFIRMED' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => updateStatus(apt.id, 'IN_PROGRESS')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    ✂️ Bakım Başladı
                  </button>
                  <button
                    onClick={() => updateStatus(apt.id, 'NO_SHOW')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Gelmedi
                  </button>
                </div>
              )}

              {apt.status === 'IN_PROGRESS' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => updateStatus(apt.id, 'COMPLETED')}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Bakım Tamamlandı
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
