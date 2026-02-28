'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewPetPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'DOG',
    breed: '',
    birthDate: '',
    weight: '',
    gender: '',
    notes: '',
    allergies: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          weight: form.weight ? parseFloat(form.weight) : undefined,
        }),
      })
      if (res.ok) {
        toast({ title: 'Pet eklendi!' })
        router.push('/hesabim/petlerim')
      } else {
        const err = await res.json()
        toast({ title: 'Hata', description: err.error, variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <Link
        href="/hesabim/petlerim"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Pet Ekle</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg space-y-4">
        {/* Pet Türü */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pet Türü</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { value: 'DOG', emoji: '🐕', label: 'Köpek' },
              { value: 'CAT', emoji: '🐈', label: 'Kedi' },
              { value: 'RABBIT', emoji: '🐇', label: 'Tavşan' },
              { value: 'BIRD', emoji: '🐦', label: 'Kuş' },
              { value: 'OTHER', emoji: '🐾', label: 'Diğer' },
            ].map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setForm({ ...form, type: pt.value })}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  form.type === pt.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl">{pt.emoji}</div>
                <div className="text-xs mt-1">{pt.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad *</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Max, Luna, Karamel..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cinsi</label>
            <Input
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              placeholder="Golden Retriever"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cinsiyet</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-input rounded-md px-3 py-2 text-sm"
            >
              <option value="">Belirtilmedi</option>
              <option value="Erkek">Erkek</option>
              <option value="Dişi">Dişi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Doğum Tarihi</label>
            <Input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ağırlık (kg)</label>
            <Input
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              placeholder="5.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Özel Notlar</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Hassasiyetler, özel durumlar..."
            className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Alerjiler</label>
          <Input
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder="Varsa alerjileri yazın"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Pet Ekle
        </Button>
      </form>
    </div>
  )
}
