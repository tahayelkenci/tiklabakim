'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Loader2, Save, Link2, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UserBusiness {
  id: string
  name: string
  city: string
  district: string
  plan?: string
  isActive?: boolean
}

interface User {
  id: string
  name?: string | null
  email: string
  phone?: string | null
  role: string
  isActive: boolean
  businesses: UserBusiness[]
}

interface Props {
  user: User
  availableBusinesses: { id: string; name: string; city: string; district: string }[]
}

export function AdminUserEditModal({ user, availableBusinesses }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState('')
  const [selectedBusinessId, setSelectedBusinessId] = useState('')

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    isActive: user.isActive,
  })

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  const handleLink = async () => {
    if (!selectedBusinessId) return
    setLinking(true)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkBusinessId: selectedBusinessId }),
    })
    setLinking(false)
    setSelectedBusinessId('')
    router.refresh()
  }

  const handleUnlink = async (businessId: string) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unlinkBusinessId: businessId }),
    })
    router.refresh()
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
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Kullanıcı Düzenle</h2>
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

            {/* Profil Bilgileri */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Profil Bilgileri</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ad Soyad</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  >
                    <option value="PET_OWNER">Pet Sahibi</option>
                    <option value="BUSINESS_OWNER">İşletmeci</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                      className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center ${form.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${form.isActive ? 'translate-x-4' : ''}`} />
                    </div>
                    <span className="text-sm text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>
            </div>

            {/* İşletme Bağlama (sadece BUSINESS_OWNER için) */}
            {(form.role === 'BUSINESS_OWNER' || user.role === 'BUSINESS_OWNER') && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700">Bağlı İşletmeler</h3>

                {/* Mevcut bağlı işletmeler */}
                {user.businesses.length > 0 ? (
                  <div className="space-y-2">
                    {user.businesses.map((b) => (
                      <div key={b.id} className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{b.name}</span>
                          <span className="text-xs text-gray-500 ml-2">{b.district}, {b.city}</span>
                        </div>
                        <button
                          onClick={() => handleUnlink(b.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Bağlantıyı kaldır"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Henüz bağlı işletme yok.</p>
                )}

                {/* Yeni işletme bağla */}
                {availableBusinesses.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Yeni İşletme Bağla</label>
                    <div className="flex gap-2">
                      <select
                        value={selectedBusinessId}
                        onChange={(e) => setSelectedBusinessId(e.target.value)}
                        className="flex-1 border border-input rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">Sahipsiz işletme seçin...</option>
                        {availableBusinesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.district}, {b.city})
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        onClick={handleLink}
                        disabled={!selectedBusinessId || linking}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {linking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
