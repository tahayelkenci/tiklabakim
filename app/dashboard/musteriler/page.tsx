'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { formatShortDate, getPetTypeEmoji } from '@/lib/utils'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter((c) =>
    c.petName.toLowerCase().includes(search.toLowerCase()) ||
    c.userName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Müşteri CRM</h1>

      {/* Arama */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Pet adı veya müşteri ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">Müşteri bulunamadı.</p>
            </div>
          ) : (
            filtered.map((customer, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                      {getPetTypeEmoji(customer.petType)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {customer.petName}
                        {customer.petBreed && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            {customer.petBreed}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        👤 {customer.userName}
                        {customer.userPhone && ` · 📞 ${customer.userPhone}`}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                        <span>Son Ziyaret: {customer.lastVisit ? formatShortDate(customer.lastVisit) : '—'}</span>
                        <span>Toplam: {customer.totalVisits} ziyaret</span>
                        {customer.noShowCount > 0 && (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {customer.noShowCount} no-show
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
