'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Save, Loader2, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Page {
  id: string
  slug: string
  title: string
  content: string | null
  metaTitle: string | null
  metaDesc: string | null
  isActive: boolean
  isSystem: boolean
}

interface Props {
  pages: Page[]
}

const emptyForm = { title: '', slug: '', content: '', metaTitle: '', metaDesc: '', isActive: true }

const slugify = (str: string) =>
  str.toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function AdminPageManager({ pages }: Props) {
  const router = useRouter()
  const [editId, setEditId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const startEdit = (page: Page) => {
    setEditId(page.id)
    setShowAdd(false)
    setForm({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      metaTitle: page.metaTitle || '',
      metaDesc: page.metaDesc || '',
      isActive: page.isActive,
    })
    setError('')
  }

  const cancel = () => {
    setEditId(null)
    setShowAdd(false)
    setError('')
  }

  const handleSave = async () => {
    if (!form.title || (!editId && !form.slug)) {
      setError('Başlık zorunludur.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editId ? `/api/admin/pages/${editId}` : '/api/admin/pages'
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
    if (!confirm('Bu sayfayı silmek istediğinize emin misiniz?')) return
    setDeleting(id)
    await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  const getPageUrl = (page: Page) =>
    page.isSystem ? `/${page.slug}` : `/sayfa/${page.slug}`

  const systemPages = pages.filter((p) => p.isSystem)
  const customPages = pages.filter((p) => !p.isSystem)

  const PageForm = ({ title }: { title: string }) => (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4 text-orange-500" />
        {title}
      </h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sayfa Başlığı <span className="text-red-500">*</span></label>
            <Input
              value={form.title}
              onChange={(e) => setForm({
                ...form,
                title: e.target.value,
                slug: editId ? form.slug : slugify(e.target.value),
              })}
              placeholder="Hakkımızda"
            />
          </div>
          {!editId && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug <span className="text-red-500">*</span></label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="hakkimizda"
              />
              <p className="text-xs text-gray-400 mt-1">/sayfa/{form.slug}</p>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SEO Başlığı</label>
          <Input
            value={form.metaTitle}
            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            placeholder="Hakkımızda | Tıkla Bakım"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SEO Açıklama</label>
          <Input
            value={form.metaDesc}
            onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
            placeholder="Meta açıklama (160 karakter)"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sayfa İçeriği (HTML)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
            placeholder={`<h1>Hakkımızda</h1>\n<p>İçerik buraya...</p>\n\n<h2>Misyonumuz</h2>\n<p>...</p>`}
          />
          {form.content && (
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer">Önizleme</summary>
              <div
                className="mt-2 border border-gray-100 rounded-lg p-4 prose prose-sm prose-gray max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </details>
          )}
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
      <div className="flex justify-end gap-3 mt-5">
        <Button variant="outline" onClick={cancel}>İptal</Button>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          Kaydet
        </Button>
      </div>
    </div>
  )

  const PageRow = ({ page }: { page: Page }) => (
    <div
      key={page.id}
      className={`bg-white rounded-xl border p-4 flex items-start justify-between gap-4 ${
        editId === page.id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-orange-500" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{page.title}</span>
            {page.isSystem && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Sistem</span>
            )}
            {!page.isActive && (
              <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Pasif</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 font-mono">{getPageUrl(page)}</span>
            <a
              href={getPageUrl(page)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-500"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {page.content && (
            <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
              {page.content.replace(/<[^>]+>/g, ' ').slice(0, 80)}...
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => startEdit(page)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {!page.isSystem && (
          <button
            onClick={() => handleDelete(page.id)}
            disabled={deleting === page.id}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting === page.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div>
      {/* Yeni Sayfa Butonu */}
      {!showAdd && !editId && (
        <div className="mb-6">
          <Button onClick={() => { setShowAdd(true); setForm(emptyForm); setError('') }} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Sayfa Ekle
          </Button>
        </div>
      )}

      {showAdd && <PageForm title="Yeni Sayfa Ekle" />}

      {/* Sistem Sayfaları */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sistem Sayfaları</h2>
        <div className="space-y-3">
          {systemPages.map((page) => (
            <div key={page.id}>
              <PageRow page={page} />
              {editId === page.id && <div className="mt-3"><PageForm title={`"${page.title}" Düzenle`} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Özel Sayfalar */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Özel Sayfalar</h2>
        <div className="space-y-3">
          {customPages.map((page) => (
            <div key={page.id}>
              <PageRow page={page} />
              {editId === page.id && <div className="mt-3"><PageForm title={`"${page.title}" Düzenle`} /></div>}
            </div>
          ))}
        </div>
        {customPages.length === 0 && !showAdd && (
          <div className="text-center py-10 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Henüz özel sayfa eklenmedi.</p>
          </div>
        )}
      </div>
    </div>
  )
}
