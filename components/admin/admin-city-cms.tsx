'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Globe, EyeOff, MapPin, Save, Loader2, Building2, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { slugify } from '@/lib/slug'

interface District {
  id: string
  name: string
  slug: string
  isPublished: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  seoContent?: string | null
}

interface City {
  id: string
  name: string
  slug: string
  isPublished: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  seoContent?: string | null
  districts: District[]
  _count: { districts: number }
}

interface Props {
  cities: City[]
  businessCountMap: Record<string, number>
}

interface EditState {
  seoTitle: string
  seoDescription: string
  seoContent: string
}

// ── SeoEditor dışarıda tanımlı — her render'da yeniden oluşmaz ──────────────
interface SeoEditorProps {
  editForm: EditState
  setEditForm: (form: EditState) => void
  saving: boolean
  onSave: () => void
  onCancel: () => void
}

function SeoEditor({ editForm, setEditForm, saving, onSave, onCancel }: SeoEditorProps) {
  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">SEO Başlığı</label>
        <Input
          value={editForm.seoTitle}
          onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })}
          placeholder="Kadıköy Pet Kuaförleri | En İyi 10 İşletme"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Meta Açıklama</label>
        <Input
          value={editForm.seoDescription}
          onChange={(e) => setEditForm({ ...editForm, seoDescription: e.target.value })}
          placeholder="Kadıköy'deki en iyi pet kuaförlerini keşfedin..."
        />
        <p className="text-xs text-gray-400 mt-0.5">{editForm.seoDescription.length}/160 karakter</p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Sayfa Alt İçeriği (SEO Metni)
        </label>
        <textarea
          value={editForm.seoContent}
          onChange={(e) => setEditForm({ ...editForm, seoContent: e.target.value })}
          rows={6}
          placeholder="<h2>Kadıköy'de Pet Kuaförü</h2>&#10;<p>Kadıköy ilçesi İstanbul'un...</p>&#10;&#10;Temel HTML etiketleri kullanabilirsiniz: &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;"
          className="w-full border border-input rounded-md px-3 py-2 text-sm resize-y font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-gray-400 mt-0.5">HTML desteklenir. Bu metin işletme listesinin altında görünür.</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>İptal</Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Kaydet
        </Button>
      </div>
    </div>
  )
}

// ── NeighborhoodSection — ilçe altındaki semtleri yönetir ────────────────────
interface NeighborhoodSectionProps {
  districtId: string
  districtSlug: string
  citySlug: string
}

function NeighborhoodSection({ districtId, districtSlug, citySlug }: NeighborhoodSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [neighborhoods, setNeighborhoods] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditState>({ seoTitle: '', seoDescription: '', seoContent: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', slug: '', isPublished: false })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/neighborhoods?districtId=${districtId}`)
    setNeighborhoods(await res.json())
    setLoading(false)
  }

  const handleToggle = async () => {
    if (!isOpen && neighborhoods.length === 0) await load()
    setIsOpen(!isOpen)
  }

  const togglePublish = async (n: any) => {
    await fetch(`/api/admin/neighborhoods/${n.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !n.isPublished }),
    })
    await load()
  }

  const saveSeo = async (id: string) => {
    setSaving(true)
    await fetch(`/api/admin/neighborhoods/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSaving(false)
    setEditId(null)
    await load()
  }

  const addNeighborhood = async () => {
    if (!addForm.name || !addForm.slug) return
    setSaving(true)
    await fetch('/api/admin/neighborhoods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, districtId }),
    })
    setSaving(false)
    setShowAdd(false)
    setAddForm({ name: '', slug: '', isPublished: false })
    await load()
  }

  const deleteNeighborhood = async (id: string) => {
    if (!confirm('Bu semti silmek istediğinize emin misiniz?')) return
    await fetch(`/api/admin/neighborhoods/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="pl-10 pr-4 pb-3">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium py-1"
      >
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        Semtler {neighborhoods.length > 0 && `(${neighborhoods.length})`}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1.5 pl-4 border-l-2 border-purple-100">
          {loading && <div className="text-xs text-gray-400 py-2">Yükleniyor...</div>}

          {neighborhoods.map((n) => (
            <div key={n.id} className="bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex items-center gap-1.5 flex-1 text-xs min-w-0">
                  <span className="text-gray-700 truncate">{n.name}</span>
                  <span className="text-gray-400 font-mono shrink-0">/{n.slug}</span>
                  {n._count?.businesses > 0 && (
                    <span className="text-gray-400 shrink-0">({n._count.businesses})</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditId(editId === n.id ? null : n.id)
                      setEditForm({ seoTitle: n.seoTitle || '', seoDescription: n.seoDescription || '', seoContent: n.seoContent || '' })
                    }}
                    className="text-xs px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    SEO
                  </button>
                  <button
                    onClick={() => togglePublish(n)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      n.isPublished
                        ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600'
                        : 'bg-gray-200 text-gray-500 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {n.isPublished ? 'Yayımda' : 'Gizli'}
                  </button>
                  <button
                    onClick={() => deleteNeighborhood(n.id)}
                    className="p-0.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {editId === n.id && (
                <div className="px-3 pb-3">
                  <SeoEditor
                    editForm={editForm}
                    setEditForm={setEditForm}
                    saving={saving}
                    onSave={() => saveSeo(n.id)}
                    onCancel={() => setEditId(null)}
                  />
                </div>
              )}
            </div>
          ))}

          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 py-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Semt Ekle
            </button>
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Semt Adı</label>
                  <Input
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="Bostancı"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                  <Input
                    value={addForm.slug}
                    onChange={(e) => setAddForm({ ...addForm, slug: slugify(e.target.value) })}
                    placeholder="bostanci"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.isPublished}
                    onChange={(e) => setAddForm({ ...addForm, isPublished: e.target.checked })}
                    className="rounded"
                  />
                  Hemen Yayımla
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAdd(false)} className="h-7 text-xs">İptal</Button>
                  <Button
                    size="sm"
                    onClick={addNeighborhood}
                    disabled={saving || !addForm.name || !addForm.slug}
                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    Ekle
                  </Button>
                </div>
              </div>
            </div>
          )}

          {neighborhoods.length === 0 && !loading && !showAdd && (
            <p className="text-xs text-gray-400 py-1">Henüz semt eklenmedi.</p>
          )}
        </div>
      )}
    </div>
  )
}

export function AdminCityCms({ cities, businessCountMap }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editCity, setEditCity] = useState<string | null>(null)
  const [editDistrict, setEditDistrict] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditState>({ seoTitle: '', seoDescription: '', seoContent: '' })
  const [saving, setSaving] = useState(false)

  // İlçe ekleme
  const [showAddDistrict, setShowAddDistrict] = useState<string | null>(null) // city.id
  const [addDistrictForm, setAddDistrictForm] = useState({ name: '', slug: '' })
  const [addDistrictSaving, setAddDistrictSaving] = useState(false)

  // İlçe yeniden adlandırma
  const [renamingDistrict, setRenamingDistrict] = useState<string | null>(null) // district.id
  const [renameForm, setRenameForm] = useState({ name: '', slug: '' })
  const [renameSaving, setRenameSaving] = useState(false)

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const togglePublishCity = async (city: City) => {
    await fetch(`/api/admin/cities/${city.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !city.isPublished }),
    })
    router.refresh()
  }

  const togglePublishDistrict = async (district: District) => {
    await fetch(`/api/admin/districts/${district.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !district.isPublished }),
    })
    router.refresh()
  }

  const startEditCity = (city: City) => {
    setEditCity(city.id)
    setEditDistrict(null)
    setEditForm({
      seoTitle: city.seoTitle || '',
      seoDescription: city.seoDescription || '',
      seoContent: city.seoContent || '',
    })
  }

  const startEditDistrict = (district: District) => {
    setEditDistrict(district.id)
    setEditCity(null)
    setEditForm({
      seoTitle: district.seoTitle || '',
      seoDescription: district.seoDescription || '',
      seoContent: district.seoContent || '',
    })
  }

  const saveCity = async (cityId: string) => {
    setSaving(true)
    await fetch(`/api/admin/cities/${cityId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSaving(false)
    setEditCity(null)
    router.refresh()
  }

  const saveDistrict = async (districtId: string) => {
    setSaving(true)
    await fetch(`/api/admin/districts/${districtId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSaving(false)
    setEditDistrict(null)
    router.refresh()
  }

  const addDistrict = async (cityId: string) => {
    if (!addDistrictForm.name || !addDistrictForm.slug) return
    setAddDistrictSaving(true)
    const res = await fetch('/api/admin/districts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addDistrictForm, cityId }),
    })
    setAddDistrictSaving(false)
    if (res.ok) {
      setShowAddDistrict(null)
      setAddDistrictForm({ name: '', slug: '' })
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.error || 'Hata oluştu')
    }
  }

  const deleteDistrict = async (districtId: string, districtName: string) => {
    if (!confirm(`"${districtName}" ilçesini silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.`)) return
    await fetch(`/api/admin/districts/${districtId}`, { method: 'DELETE' })
    router.refresh()
  }

  const startRenameDistrict = (district: District) => {
    setRenamingDistrict(district.id)
    setRenameForm({ name: district.name, slug: district.slug })
    setEditDistrict(null)
  }

  const saveRenameDistrict = async (districtId: string) => {
    if (!renameForm.name || !renameForm.slug) return
    setRenameSaving(true)
    await fetch(`/api/admin/districts/${districtId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameForm.name, slug: renameForm.slug }),
    })
    setRenameSaving(false)
    setRenamingDistrict(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {cities.map((city) => {
        const publishedDistricts = city.districts.filter((d) => d.isPublished).length
        const isExpanded = expanded.has(city.id)

        return (
          <div key={city.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Şehir Başlığı */}
            <div className="flex items-center gap-3 p-4">
              <button
                onClick={() => toggleExpand(city.id)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                {isExpanded
                  ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                }
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="font-semibold text-gray-900">{city.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {publishedDistricts}/{city.districts.length} ilçe yayımda
                </span>
              </button>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => editCity === city.id ? setEditCity(null) : startEditCity(city)}
                  className="text-xs px-2.5 py-1 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                >
                  SEO Düzenle
                </button>
                <button
                  onClick={() => togglePublishCity(city)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    city.isPublished
                      ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  {city.isPublished ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {city.isPublished ? 'Yayımda' : 'Gizli'}
                </button>
              </div>
            </div>

            {/* SEO Editor - Şehir */}
            {editCity === city.id && (
              <div className="px-4 pb-4">
                <SeoEditor
                  editForm={editForm}
                  setEditForm={setEditForm}
                  saving={saving}
                  onSave={() => saveCity(city.id)}
                  onCancel={() => setEditCity(null)}
                />
              </div>
            )}

            {/* SEO Önizleme */}
            {!editCity && city.seoTitle && (
              <div className="px-4 pb-3 -mt-1">
                <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="font-medium">SEO:</span> {city.seoTitle}
                  {city.seoDescription && <span className="text-gray-300 mx-1">|</span>}
                  {city.seoDescription && <span>{city.seoDescription.slice(0, 60)}...</span>}
                </div>
              </div>
            )}

            {/* İlçeler */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {city.districts.map((district) => {
                  const bizCount = businessCountMap[`${city.slug}/${district.slug}`] || 0
                  const isRenaming = renamingDistrict === district.id

                  return (
                    <div key={district.id} className="border-b border-gray-50 last:border-0">
                      {/* İlçe Satırı */}
                      {isRenaming ? (
                        // Yeniden adlandırma formu
                        <div className="flex items-center gap-2 px-4 py-2 pl-10 bg-orange-50">
                          <Input
                            value={renameForm.name}
                            onChange={(e) => setRenameForm({ name: e.target.value, slug: slugify(e.target.value) })}
                            placeholder="İlçe adı"
                            className="h-7 text-xs flex-1"
                          />
                          <Input
                            value={renameForm.slug}
                            onChange={(e) => setRenameForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                            placeholder="slug"
                            className="h-7 text-xs w-32 font-mono"
                          />
                          <button
                            onClick={() => saveRenameDistrict(district.id)}
                            disabled={renameSaving}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            {renameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setRenamingDistrict(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Normal satır
                        <div className="flex items-center gap-3 px-4 py-3 pl-10">
                          <div className="flex items-center gap-1.5 flex-1">
                            <span className="text-sm text-gray-700">{district.name}</span>
                            <span className="text-xs text-gray-400 font-mono">/{district.slug}</span>
                            {bizCount > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                                <Building2 className="w-3 h-3" />
                                {bizCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => editDistrict === district.id ? setEditDistrict(null) : startEditDistrict(district)}
                              className="text-xs px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 font-medium"
                            >
                              SEO
                            </button>
                            <button
                              onClick={() => togglePublishDistrict(district)}
                              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                                district.isPublished
                                  ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600'
                                  : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                              }`}
                            >
                              {district.isPublished ? 'Yayımda' : 'Gizli'}
                            </button>
                            <button
                              onClick={() => startRenameDistrict(district)}
                              className="p-1 text-gray-300 hover:text-blue-500 transition-colors"
                              title="Yeniden Adlandır"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteDistrict(district.id, district.name)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* İlçe SEO editor */}
                      {!isRenaming && editDistrict === district.id && (
                        <div className="px-4 pb-4 pl-10">
                          <SeoEditor
                            editForm={editForm}
                            setEditForm={setEditForm}
                            saving={saving}
                            onSave={() => saveDistrict(district.id)}
                            onCancel={() => setEditDistrict(null)}
                          />
                        </div>
                      )}

                      {/* İlçe SEO önizleme */}
                      {!isRenaming && editDistrict !== district.id && district.seoTitle && (
                        <div className="px-4 pb-2 pl-10">
                          <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded">
                            <span className="font-medium">SEO:</span> {district.seoTitle}
                          </div>
                        </div>
                      )}

                      {/* Semt Yönetimi */}
                      {!isRenaming && (
                        <NeighborhoodSection
                          districtId={district.id}
                          districtSlug={district.slug}
                          citySlug={city.slug}
                        />
                      )}
                    </div>
                  )
                })}

                {/* Yeni İlçe Ekle */}
                {showAddDistrict === city.id ? (
                  <div className="px-4 py-3 pl-10 bg-orange-50 border-t border-orange-100">
                    <p className="text-xs font-medium text-gray-700 mb-2">Yeni İlçe Ekle</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">İlçe Adı</label>
                        <Input
                          value={addDistrictForm.name}
                          onChange={(e) => setAddDistrictForm({ name: e.target.value, slug: slugify(e.target.value) })}
                          placeholder="Kadıköy"
                          className="h-8 text-xs"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Slug</label>
                        <Input
                          value={addDistrictForm.slug}
                          onChange={(e) => setAddDistrictForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                          placeholder="kadikoy"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setShowAddDistrict(null); setAddDistrictForm({ name: '', slug: '' }) }}
                        className="h-7 text-xs"
                      >
                        İptal
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addDistrict(city.id)}
                        disabled={addDistrictSaving || !addDistrictForm.name || !addDistrictForm.slug}
                        className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {addDistrictSaving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        Ekle
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2 pl-10 border-t border-gray-50">
                    <button
                      onClick={() => setShowAddDistrict(city.id)}
                      className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Yeni İlçe Ekle
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
