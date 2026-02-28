'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, Clock, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface Service {
  id: string
  name: string
  duration?: number | null
  price?: number | null
}

interface Props {
  businessId: string
  businessName: string
  services: Service[]
}

export function AppointmentModal({ businessId, businessName, services }: Props) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pets, setPets] = useState<any[]>([])
  const [petsLoaded, setPetsLoaded] = useState(false)
  const [form, setForm] = useState({
    petId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: '',
  })

  const loadPets = async () => {
    if (petsLoaded) return
    try {
      const res = await fetch('/api/pets')
      if (res.ok) {
        const data = await res.json()
        setPets(data)
        setPetsLoaded(true)
      }
    } catch {}
  }

  const handleOpen = () => {
    setOpen(true)
    loadPets()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.petId || !form.date || !form.time) {
      toast({ title: 'Hata', description: 'Pet, tarih ve saat seçin.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const datetime = new Date(`${form.date}T${form.time}:00`)
      const selectedService = services.find((s) => s.id === form.serviceId)

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          petId: form.petId,
          serviceId: form.serviceId || null,
          date: datetime.toISOString(),
          duration: selectedService?.duration || 60,
          notes: form.notes,
        }),
      })

      if (res.ok) {
        toast({
          title: 'Randevu Talebiniz Gönderildi!',
          description: 'İşletme onayladığında bildirim alacaksınız.',
        })
        setOpen(false)
        setForm({ petId: '', serviceId: '', date: '', time: '', notes: '' })
      } else {
        const err = await res.json()
        toast({
          title: 'Hata',
          description: err.error || 'Randevu alınamadı.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({ title: 'Hata', description: 'Bir sorun oluştu.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Min date = bugün
  const minDate = new Date().toISOString().split('T')[0]
  // Max date = 3 ay sonra
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
        id="randevu"
      >
        <Calendar className="w-4 h-4" />
        Randevu Al
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Randevu Al</h2>
                <p className="text-sm text-gray-500">{businessName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Pet Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pet Seçin *
                </label>
                {pets.length === 0 ? (
                  <div className="text-sm text-orange-600 bg-orange-50 rounded-lg p-3">
                    Henüz pet profiliniz yok.{' '}
                    <a href="/hesabim/petlerim" className="underline font-medium">
                      Pet ekleyin
                    </a>
                  </div>
                ) : (
                  <select
                    value={form.petId}
                    onChange={(e) => setForm({ ...form, petId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  >
                    <option value="">Pet seçin...</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.type === 'DOG' ? 'Köpek' : pet.type === 'CAT' ? 'Kedi' : pet.type})
                        {pet.breed ? ` - ${pet.breed}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Hizmet Seçimi */}
              {services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hizmet
                  </label>
                  <select
                    value={form.serviceId}
                    onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Hizmet seçin (opsiyonel)</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.duration ? ` (~${s.duration} dk)` : ''}
                        {s.price ? ` — ${formatPrice(s.price)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tarih */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tarih *
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={minDate}
                    max={maxDate}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Saat *
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    min="08:00"
                    max="20:00"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notlar (opsiyonel)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Petiniz hakkında özel bilgiler, istekleriniz..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || pets.length === 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Randevu Talebini Gönder
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
