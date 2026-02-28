'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Building2, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

interface CityItem { id: string; name: string; slug: string }
interface DistrictItem { id: string; name: string; slug: string }
interface Category { id: string; name: string; slug: string; icon?: string | null }

export default function YeniIsletmePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [cities, setCities] = useState<CityItem[]>([])
  const [districts, setDistricts] = useState<DistrictItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    website: '',
    instagram: '',
    categoryId: '',
  })

  // Şehirler ve kategorileri yükle
  useEffect(() => {
    Promise.all([
      fetch('/api/cities').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([cityData, catData]) => {
      setCities(Array.isArray(cityData) ? cityData : [])
      setCategories(Array.isArray(catData) ? catData : [])
      if (catData.length === 1) setForm((prev) => ({ ...prev, categoryId: catData[0].id }))
    }).catch(() => {})
  }, [])

  // Şehir değişince ilçeleri yükle
  useEffect(() => {
    if (!form.city) { setDistricts([]); return }
    fetch(`/api/cities/${form.city}/districts`)
      .then((r) => r.json())
      .then((data) => setDistricts(Array.isArray(data) ? data : []))
      .catch(() => setDistricts([]))
  }, [form.city])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address || !form.city || !form.district) {
      toast({ title: 'Eksik bilgi', description: 'Zorunlu alanları doldurun.', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categoryId: form.categoryId || null }),
      })

      if (res.ok) {
        toast({ title: 'İşletme oluşturuldu!', description: 'Profilinizi düzenleyebilirsiniz.' })
        router.push('/dashboard/profil')
        router.refresh()
      } else {
        const data = await res.json()
        toast({ title: 'Hata', description: data.error || 'İşletme oluşturulamadı.', variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">İşletme Oluştur</h1>
        <p className="text-gray-500 mt-1">Platformda yerinizi alın ve müşterilere ulaşın.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ana Kategori */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-orange-500 text-lg">🏷️</span>
            Ana Kategori
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="w-full border border-input rounded-md px-3 py-2 text-sm"
            >
              <option value="">Kategori seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Eklenmesini istediğiniz bir kategori yoksa admin ile iletişime geçin.
            </p>
          </div>
        </div>

        {/* Temel Bilgiler */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" />
            Temel Bilgiler
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                İşletme Adı <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Örn: Pawsome Pet Salon"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="İşletmenizi tanıtın..."
                className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* İletişim */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-orange-500" />
            İletişim
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Telefon <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0212 000 00 00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@isletme.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Web Sitesi</label>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
              <Input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@kullaniciadi"
              />
            </div>
          </div>
        </div>

        {/* Konum */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            Konum
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adres <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Mahalle, Cadde, Bina No"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Şehir <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value, district: '' })}
                  required
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Şehir seçin</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  İlçe <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  required
                  disabled={!form.city || districts.length === 0}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="">
                    {form.city && districts.length === 0 ? 'Yükleniyor...' : 'İlçe seçin'}
                  </option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.slug}>{d.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Listede yoksa admin ile iletişime geçin.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
            İptal
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            İşletme Oluştur
          </Button>
        </div>
      </form>
    </div>
  )
}
