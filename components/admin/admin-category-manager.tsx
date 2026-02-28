'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, X, Save, Loader2, Tag, Building2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  isActive: boolean
  order: number
  _count: { businesses: number }
}

interface Props {
  categories: Category[]
}

const emptyForm = { name: '', slug: '', description: '', icon: '', order: 0, isActive: true }

export function AdminCategoryManager({ categories }: Props) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const slugify = (str: string) =>
    str.toLowerCase()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const startAdd = () => {
    setForm(emptyForm)
    setEditId(null)
    setShowAdd(true)
    setError('')
  }

  const startEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      order: cat.order,
      isActive: cat.isActive,
    })
    setEditId(cat.id)
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
      const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories'
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

  const handleToggle = async (cat: Category) => {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !cat.isActive }),
    })
    router.refresh()
  }

  const FormSection = () => (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="w-4 h-4 text-orange-500" />
        {editId ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
      </h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Kategori Adı <span className="text-red-500">*</span></label>
          <Input
            value={form.name}
            onChange={(e) => setForm({
              ...form,
              name: e.target.value,
              slug: editId ? form.slug : slugify(e.target.value),
            })}
            placeholder="Pet Kuaför"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug <span className="text-red-500">*</span></label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            placeholder="pet-kuafor"
          />
          <p className="text-xs text-gray-400 mt-1">URL: /{form.slug}/istanbul/kadikoy</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">İkon (emoji)</label>
          <Input
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="🐾"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sıra</label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Kategori açıklaması..."
          />
        </div>
        <div className="flex items-center gap-2">
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
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={cancel}>İptal</Button>
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
  )

  return (
    <div>
      {!showAdd && !editId && (
        <div className="mb-6">
          <Button onClick={startAdd} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Kategori
          </Button>
        </div>
      )}

      {(showAdd || editId) && <FormSection />}

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-white rounded-xl border p-4 flex items-center justify-between ${
              editId === cat.id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl">
                {cat.icon || '🏷️'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{cat.name}</span>
                  {cat.isActive
                    ? <CheckCircle className="w-4 h-4 text-green-500" />
                    : <XCircle className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400 font-mono">/{cat.slug}/</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Building2 className="w-3 h-3" />
                    {cat._count.businesses} işletme
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(cat)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  cat.isActive
                    ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600'
                    : 'bg-red-50 text-red-600 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                {cat.isActive ? 'Aktif' : 'Pasif'}
              </button>
              <button
                onClick={() => startEdit(cat)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-400">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Henüz kategori yok. İlk kategoriyi ekleyin.</p>
        </div>
      )}
    </div>
  )
}
