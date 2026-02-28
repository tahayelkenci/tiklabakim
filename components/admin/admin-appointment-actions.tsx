'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2 } from 'lucide-react'

const TRANSITIONS: Record<string, { next: string; label: string; color: string }[]> = {
  PENDING: [
    { next: 'CONFIRMED', label: 'Onayla', color: 'text-green-600 hover:bg-green-50' },
    { next: 'CANCELLED', label: 'İptal Et', color: 'text-red-600 hover:bg-red-50' },
  ],
  CONFIRMED: [
    { next: 'IN_PROGRESS', label: 'Başlat', color: 'text-purple-600 hover:bg-purple-50' },
    { next: 'CANCELLED', label: 'İptal Et', color: 'text-red-600 hover:bg-red-50' },
  ],
  IN_PROGRESS: [
    { next: 'COMPLETED', label: 'Tamamla', color: 'text-green-600 hover:bg-green-50' },
    { next: 'NO_SHOW', label: 'Gelmedi', color: 'text-gray-600 hover:bg-gray-50' },
  ],
}

interface Props {
  appointmentId: string
  currentStatus: string
}

export function AdminAppointmentActions({ appointmentId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const transitions = TRANSITIONS[currentStatus] || []

  if (transitions.length === 0) return <span className="text-xs text-gray-300">—</span>

  const update = async (status: string) => {
    setLoading(true)
    await fetch(`/api/admin/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-auto" />

  return (
    <div className="flex items-center justify-end gap-1">
      {transitions.map((t) => (
        <button
          key={t.next}
          onClick={() => update(t.next)}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${t.color}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
