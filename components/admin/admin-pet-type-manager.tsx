'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Save, Loader2, PawPrint, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PetType {
  id: string
  name: string
  slug: string
  icon: string | null
  isActive: boolean
  seoTitle: string | null
  seoDescription: string | null
  seoContent: string | null
}

interface Props {
  petTypes: PetType[]
}

const emptyForm = {
  name: '', slug: '', icon: '', isActive: true,
  seoTitle: '', seoDescription: '', seoContent: '',
}

const slugify = (str: string) =>
  str.toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function AdminPetTypeManager({ petTypes }: Props) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const startAdd = () => {
    setForm(emptyForm)
    setEditId(null)
    setShowAdd(true)
    setError('')
  }

  const startEdit = (pt: PetType) => {
    setForm({
      name: pt.name,
      slug: pt.slug,
      icon: pt.icon || '',
      isActive: pt.isActive,
      seoTitle: pt.seoTitle || '',
      seoDescription: pt.seoDescription || '',
      seoContent: pt.seoContent || '',
    })
    setEditId(pt.id)
    setShowAdd(false)
    setError('')
  }

  const cancel = () => {
    setShowAdd(false)
    setEditId(null)
    setError('')
  }

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      setError('Ad ve slug zorunludur.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/admin/pet-types/${editId}` : '/api/admin/pet-types'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Hata oluştu.')
        return
      }
      cancel()
      router.refresh()
    } catch {
      setError('Sunucu hatası.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu pet türünü silmek istediğinize emin misiniz?')) return
    setDeleting(id)
    await fetch(`/api/admin/pet-types/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  const handleToggle = async (pt: PetType) => {
    await fetch(`/api/admin/pet-types/${pt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !pt.isActive }),
    })
    router.refresh()
  }

  const showForm = showAdd || !!editId

  return (
    <div>
      {!showForm && (
        <div className="mb-6">
          <Button onClick={startAdd} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Pet Türü
          </Button>
        </div>
      )}

      {showForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-orange-500" />
            {editId ? 'Pet Türü Düzenle' : 'Yeni Pet Türü Ekle'}
          </h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad <span className="text-red-500">*</span></label>
              <Input
                value={form.name}
                onChange={(e) => setForm({
                  ...form,
                  name: e.target.value,
                  slug: editId ? form.slug : slugify(e.target.value),
                })}
                placeholder="Köpek"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug <span className="text-red-500">*</span></label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="kopek"
              />
              <p className="text-xs text-gray-400 mt-1">/pet-kuafor/{form.slug}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">İkon (emoji)</label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="🐕"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <div
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex items-center ${form.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${form.isActive ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SEO Başlık</label>
              <Input
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                placeholder="Köpek Kuaförleri — Türkiye"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SEO Açıklama</label>
              <Input
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                placeholder="Meta açıklama..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Sayfa İçeriği (HTML)</label>
              <textarea
                value={form.seoContent}
                onChange={(e) => setForm({ ...form, seoContent: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y font-mono"
                placeholder="<h2>Köpek Kuaförü Hakkında</h2><p>...</p>"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={cancel}>İptal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {petTypes.map((pt) => (
          <div
            key={pt.id}
            className={`bg-white rounded-xl border p-4 flex items-center justify-between ${
              editId === pt.id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl">
                {pt.icon || '🐾'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{pt.name}</span>
                  {pt.isActive
                    ? <CheckCircle className="w-4 h-4 text-green-500" />
                    : <XCircle className="w-4 h-4 text-red-400" />
                  }
                </div>
                <span className="text-xs text-gray-400 font-mono">/pet-kuafor/{pt.slug}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(pt)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  pt.isActive
                    ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600'
                    : 'bg-red-50 text-red-600 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                {pt.isActive ? 'Aktif' : 'Pasif'}
              </button>
              <button
                onClick={() => startEdit(pt)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(pt.id)}
                disabled={deleting === pt.id}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting === pt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {petTypes.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <PawPrint className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Henüz pet türü yok. İlk pet türünü ekleyin.</p>
        </div>
      )}
    </div>
  )
}
