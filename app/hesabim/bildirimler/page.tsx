'use client'

import { useState, useEffect } from 'react'
import { Bell, Loader2, CheckCheck } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export default function BildirimlerPage() {
  const [data, setData] = useState<any>({ notifications: [], unreadCount: 0 })
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    const res = await fetch('/api/notifications')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    loadNotifications()
  }

  useEffect(() => { loadNotifications() }, [])

  const typeIcons: Record<string, string> = {
    APPOINTMENT_CONFIRMED: '✅',
    APPOINTMENT_REJECTED: '❌',
    GROOMING_COMPLETED: '🎉',
    APPOINTMENT_REMINDER: '⏰',
    NEW_APPOINTMENT_REQUEST: '📅',
    VACCINE_DUE: '💉',
    REVIEW_RECEIVED: '⭐',
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
          {data.unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{data.unreadCount} okunmamış</p>
          )}
        </div>
        {data.unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600"
          >
            <CheckCheck className="w-4 h-4" />
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : data.notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Henüz bildiriminiz yok.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.notifications.map((n: any) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${
                !n.isRead ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
              }`}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {typeIcons[n.type] || '🔔'}
              </span>
              <div className="flex-1">
                <div className={`font-medium text-sm ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {n.title}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
