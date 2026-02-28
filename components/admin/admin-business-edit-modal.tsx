'use client'

import { useState, useEffect } from 'react'
import { Pencil, X, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface Business {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  address: string
  city: string
  district: string
  plan: string
  isActive: boolean
  isVerified: boolean
  isFeatured: boolean
  description?: string | null
  website?: string | null
  instagram?: string | null
  categoryId?: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
}

interface CityItem { id: string; name: string; slug: string }
interface DistrictItem { id: string; name: string; slug: string }

interface Props {
  business: Business
  categories: Category[]
}

export function AdminBusinessEditModal({ business, categories }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [cities, setCities] = useState<CityItem[]>([])
  const [districts, setDistricts] = useState<DistrictItem[]>([])

  const [form, setForm] = useState({
    name: business.name,
    phone: business.phone || '',
    email: business.email || '',
    address: business.address,
    city: business.city,
    district: business.district,
    plan: business.plan,
    isActive: business.isActive,
    isVerified: business.isVerified,
    isFeatured: business.isFeatured,
    description: business.description || '',
    website: business.website || '',
    instagram: business.instagram || '',
    categoryId: business.categoryId || '',
  })

  // Şehirleri yükle
  useEffect(() => {
    if (!open) return
    fetch('/api/cities')
      .then((r) => r.json())
      .then((data) => setCities(data))
      .catch(() => {})
  }, [open])

  // Seçili şehre göre ilçeleri yükle
  useEffect(() => {
    if (!form.city) { setDistricts([]); return }
    fetch(`/api/cities/${form.city}/districts`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setDistricts(data) : setDistricts([]))
      .catch(() => setDistricts([]))
  }, [form.city])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Hata oluştu.')
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError('Sunucu hatası.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Düzenle"
      >
        <Pencil className="w-4 h-4" />
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">İşletme Düzenle</h2>
            <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Ana Kategori */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Ana Kategori</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="">— Kategorisiz —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">İşletme Adı</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Adres</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              {/* Şehir dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Şehir</label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value, district: '' })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Şehir seçin</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                  {/* Mevcut şehir listede yoksa göster */}
                  {form.city && !cities.find((c) => c.slug === form.city) && (
                    <option value={form.city}>{form.city} (mevcut)</option>
                  )}
                </select>
              </div>

              {/* İlçe dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">İlçe</label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  disabled={!form.city}
                >
                  <option value="">İlçe seçin</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.slug}>{d.name}</option>
                  ))}
                  {/* Mevcut ilçe listede yoksa göster */}
                  {form.district && !districts.find((d) => d.slug === form.district) && (
                    <option value={form.district}>{form.district} (mevcut)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="FREE">FREE</option>
                  <option value="BASIC">BASIC</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Web Sitesi</label>
                <Input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instagram</label>
                <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Durum toggle'ları */}
            <div className="flex gap-6 pt-2">
              {[
                { key: 'isActive', label: 'Aktif' },
                { key: 'isVerified', label: 'Doğrulanmış' },
                { key: 'isFeatured', label: 'Öne Çıkan' },
              ].map((toggle) => (
                <label key={toggle.key} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setForm({ ...form, [toggle.key]: !form[toggle.key as keyof typeof form] })}
                    className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center ${
                      form[toggle.key as keyof typeof form] ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${
                      form[toggle.key as keyof typeof form] ? 'translate-x-4' : ''
                    }`} />
                  </div>
                  <span className="text-sm text-gray-700">{toggle.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-5 pb-5">
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
