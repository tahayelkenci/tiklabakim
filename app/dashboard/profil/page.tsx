'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Save, Plus, Trash2, Upload, ImageIcon, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getDayName } from '@/lib/utils'

export default function DashboardProfilePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [workingHours, setWorkingHours] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'services' | 'hours' | 'photos'>('basic')

  useEffect(() => {
    loadBusiness()
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    const res = await fetch('/api/dashboard/photos')
    if (res.ok) setPhotos(await res.json())
  }

  const uploadPhoto = async (file: File) => {
    if (!file) return
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload?subfolder=businesses', { method: 'POST', body: fd })
      if (!res.ok) { toast({ title: 'Hata', description: 'Yükleme başarısız.', variant: 'destructive' }); return }
      const { url } = await res.json()
      const addRes = await fetch('/api/dashboard/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (addRes.ok) {
        await loadPhotos()
        toast({ title: 'Fotoğraf eklendi.' })
      }
    } finally {
      setUploadingPhoto(false)
    }
  }

  const deletePhoto = async (photoId: string) => {
    await fetch(`/api/dashboard/photos/${photoId}`, { method: 'DELETE' })
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  const setCoverPhoto = async (url: string) => {
    const res = await fetch('/api/dashboard/business', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverPhoto: url }),
    })
    if (res.ok) {
      setBusiness({ ...business, coverPhoto: url })
      toast({ title: 'Kapak fotoğrafı güncellendi.' })
    }
  }

  const loadBusiness = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/business')
      if (res.ok) {
        const data = await res.json()
        setBusiness(data)
        setServices(data.services || [])
        setWorkingHours(
          data.workingHours.length > 0
            ? data.workingHours
            : Array.from({ length: 7 }, (_, i) => ({
                dayOfWeek: i,
                openTime: '09:00',
                closeTime: '18:00',
                isClosed: i === 0,
              }))
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const saveBasicInfo = async () => {
    if (!business) return
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business),
      })
      if (res.ok) {
        toast({ title: 'Kaydedildi', description: 'Bilgiler güncellendi.' })
      } else {
        const err = await res.json()
        toast({ title: 'Hata', description: err.error, variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  const saveWorkingHours = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: workingHours }),
      })
      if (res.ok) {
        toast({ title: 'Kaydedildi', description: 'Çalışma saatleri güncellendi.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const saveService = async (service: any) => {
    const method = service.id ? 'PATCH' : 'POST'
    const url = service.id ? `/api/dashboard/services/${service.id}` : '/api/dashboard/services'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    })
    if (res.ok) {
      toast({ title: 'Kaydedildi' })
      loadBusiness()
    }
  }

  const deleteService = async (serviceId: string) => {
    const res = await fetch(`/api/dashboard/services/${serviceId}`, { method: 'DELETE' })
    if (res.ok) loadBusiness()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">İşletme bulunamadı.</p>
      </div>
    )
  }

  const tabs = [
    { key: 'basic', label: 'Temel Bilgiler' },
    { key: 'content', label: 'Sayfa İçeriği' },
    { key: 'services', label: 'Hizmetler' },
    { key: 'hours', label: 'Çalışma Saatleri' },
    { key: 'photos', label: 'Fotoğraflar' },
  ]

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Düzenle</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Temel Bilgiler */}
      {activeTab === 'basic' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">İşletme Adı</label>
              <Input
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</label>
              <textarea
                value={business.description || ''}
                onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                rows={4}
                className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                <Input
                  value={business.phone || ''}
                  onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <Input
                  type="email"
                  value={business.email || ''}
                  onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Web Sitesi</label>
              <Input
                type="url"
                value={business.website || ''}
                onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adres</label>
              <Input
                value={business.address || ''}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                <Input
                  value={business.instagram || ''}
                  onChange={(e) => setBusiness({ ...business, instagram: e.target.value })}
                  placeholder="@kullaniciadi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
                <Input
                  value={business.facebook || ''}
                  onChange={(e) => setBusiness({ ...business, facebook: e.target.value })}
                />
              </div>
            </div>
          </div>
          <Button
            onClick={saveBasicInfo}
            disabled={saving}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      )}

      {/* Sayfa İçeriği */}
      {activeTab === 'content' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-3xl">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Sayfa İçeriği</h2>
            <p className="text-sm text-gray-500">
              İşletme sayfanızın alt bölümüne eklenecek içerik. Hizmetlerinizi, hikayenizi veya müşterilere iletmek istediğiniz bilgileri yazabilirsiniz.
              Temel HTML etiketleri desteklenir: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;h2&gt;</code>{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;p&gt;</code>{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;strong&gt;</code>{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;ul&gt;&lt;li&gt;</code>
            </p>
          </div>

          <textarea
            value={business.content || ''}
            onChange={(e) => setBusiness({ ...business, content: e.target.value })}
            rows={18}
            placeholder={`<h2>Hakkımızda</h2>\n<p>İşletmeniz hakkında bilgi girin...</p>\n\n<h2>Neden Biz?</h2>\n<ul>\n  <li>Uzman ekibimiz</li>\n  <li>Güvenli ortam</li>\n</ul>`}
            className="w-full border border-input rounded-md px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {/* HTML Önizleme */}
          {business.content && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Önizleme:</p>
              <div
                className="border border-gray-100 rounded-lg p-4 prose prose-sm prose-gray max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: business.content }}
              />
            </div>
          )}

          <Button
            onClick={saveBasicInfo}
            disabled={saving}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      )}

      {/* Hizmetler */}
      {activeTab === 'services' && (
        <div className="max-w-2xl space-y-4">
          {services.map((service, idx) => (
            <div key={service.id || idx} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Hizmet Adı</label>
                  <Input
                    value={service.name}
                    onChange={(e) => {
                      const updated = [...services]
                      updated[idx] = { ...updated[idx], name: e.target.value }
                      setServices(updated)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pet Türü</label>
                  <select
                    value={service.category}
                    onChange={(e) => {
                      const updated = [...services]
                      updated[idx] = { ...updated[idx], category: e.target.value }
                      setServices(updated)
                    }}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  >
                    <option value="tum">Tüm Petler</option>
                    <option value="kopek">Köpek</option>
                    <option value="kedi">Kedi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fiyat (₺)</label>
                  <Input
                    type="number"
                    value={service.price || ''}
                    onChange={(e) => {
                      const updated = [...services]
                      updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) }
                      setServices(updated)
                    }}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Süre (dk)</label>
                  <Input
                    type="number"
                    value={service.duration || ''}
                    onChange={(e) => {
                      const updated = [...services]
                      updated[idx] = { ...updated[idx], duration: parseInt(e.target.value) }
                      setServices(updated)
                    }}
                    placeholder="60"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => saveService(service)}
                  className="text-sm text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Kaydet
                </button>
                {service.id && (
                  <button
                    onClick={() => deleteService(service.id)}
                    className="text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              setServices([
                ...services,
                { name: '', category: 'tum', price: null, duration: 60 },
              ])
            }
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl text-sm text-gray-500 hover:text-orange-600 transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Hizmet Ekle
          </button>
        </div>
      )}

      {/* Çalışma Saatleri */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <div className="space-y-3">
            {workingHours.map((wh, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700">
                  {getDayName(wh.dayOfWeek)}
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={wh.isClosed}
                    onChange={(e) => {
                      const updated = [...workingHours]
                      updated[idx] = { ...updated[idx], isClosed: e.target.checked }
                      setWorkingHours(updated)
                    }}
                    className="accent-orange-500"
                  />
                  <span className="text-xs text-gray-500">Kapalı</span>
                </label>
                {!wh.isClosed && (
                  <>
                    <input
                      type="time"
                      value={wh.openTime}
                      onChange={(e) => {
                        const updated = [...workingHours]
                        updated[idx] = { ...updated[idx], openTime: e.target.value }
                        setWorkingHours(updated)
                      }}
                      className="border border-input rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-400 text-sm">—</span>
                    <input
                      type="time"
                      value={wh.closeTime}
                      onChange={(e) => {
                        const updated = [...workingHours]
                        updated[idx] = { ...updated[idx], closeTime: e.target.value }
                        setWorkingHours(updated)
                      }}
                      className="border border-input rounded px-2 py-1 text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
          <Button
            onClick={saveWorkingHours}
            disabled={saving}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Saatleri Kaydet
          </Button>
        </div>
      )}

      {/* Fotoğraflar */}
      {activeTab === 'photos' && (
        <div className="max-w-3xl">
          {/* Kapak ve Logo */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <h3 className="font-semibold text-gray-900 mb-4">Ana Görseller</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kapak Fotoğrafı URL</label>
                <div className="flex gap-2">
                  <Input
                    value={business.coverPhoto || ''}
                    onChange={(e) => setBusiness({ ...business, coverPhoto: e.target.value })}
                    placeholder="https://..."
                  />
                  <Button
                    size="sm"
                    onClick={() => saveBasicInfo()}
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {business.coverPhoto && (
                  <img src={business.coverPhoto} alt="Kapak" className="mt-2 h-24 w-full object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                <div className="flex gap-2">
                  <Input
                    value={business.logo || ''}
                    onChange={(e) => setBusiness({ ...business, logo: e.target.value })}
                    placeholder="https://..."
                  />
                  <Button
                    size="sm"
                    onClick={() => saveBasicInfo()}
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {business.logo && (
                  <img src={business.logo} alt="Logo" className="mt-2 h-24 w-24 object-contain rounded-lg border border-gray-200" />
                )}
              </div>
            </div>
          </div>

          {/* Galeri Fotoğrafları */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Galeri ({photos.length})</h3>
              <Button
                size="sm"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {uploadingPhoto
                  ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  : <Upload className="w-3.5 h-3.5 mr-1.5" />
                }
                Fotoğraf Yükle
              </Button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) uploadPhoto(e.target.files[0]) }}
              />
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Henüz galeri fotoğrafı yok.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group aspect-square">
                    <img
                      src={photo.url}
                      alt={photo.caption || ''}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCoverPhoto(photo.url)}
                        className="p-1.5 bg-white/90 rounded-full hover:bg-white"
                        title="Kapak fotoğrafı yap"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="p-1.5 bg-white/90 rounded-full hover:bg-white"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                    {business.coverPhoto === photo.url && (
                      <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        Kapak
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
