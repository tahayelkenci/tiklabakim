'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Save, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export default function DashboardAyarlarPage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'profil' | 'sifre'>('profil')
  const [saving, setSaving] = useState(false)

  const [profil, setProfil] = useState({ name: '', phone: '' })
  const [sifre, setSifre] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (session?.user) {
      setProfil({ name: session.user.name || '', phone: '' })
    }
  }, [session])

  const saveProfil = async () => {
    if (!profil.name.trim()) {
      toast({ title: 'Hata', description: 'Ad Soyad boş olamaz.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profil),
      })
      if (res.ok) {
        await update({ name: profil.name })
        toast({ title: 'Kaydedildi', description: 'Profil bilgileri güncellendi.' })
      } else {
        const d = await res.json()
        toast({ title: 'Hata', description: d.error, variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  const saveSifre = async () => {
    if (sifre.newPassword !== sifre.confirmPassword) {
      toast({ title: 'Hata', description: 'Yeni şifreler eşleşmiyor.', variant: 'destructive' })
      return
    }
    if (sifre.newPassword.length < 6) {
      toast({ title: 'Hata', description: 'Şifre en az 6 karakter.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: sifre.currentPassword, newPassword: sifre.newPassword }),
      })
      if (res.ok) {
        setSifre({ currentPassword: '', newPassword: '', confirmPassword: '' })
        toast({ title: 'Kaydedildi', description: 'Şifreniz değiştirildi.' })
      } else {
        const d = await res.json()
        toast({ title: 'Hata', description: d.error, variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hesap Ayarları</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'profil', label: 'Profil', icon: User },
          { key: 'sifre', label: 'Şifre', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profil' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <Input value={session?.user?.email || ''} disabled className="bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
            <Input value={profil.name} onChange={(e) => setProfil({ ...profil, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
            <Input value={profil.phone} onChange={(e) => setProfil({ ...profil, phone: e.target.value })} placeholder="0532 000 00 00" />
          </div>
          <Button onClick={saveProfil} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      )}

      {activeTab === 'sifre' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mevcut Şifre</label>
            <Input type="password" value={sifre.currentPassword} onChange={(e) => setSifre({ ...sifre, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre</label>
            <Input type="password" value={sifre.newPassword} onChange={(e) => setSifre({ ...sifre, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre (Tekrar)</label>
            <Input type="password" value={sifre.confirmPassword} onChange={(e) => setSifre({ ...sifre, confirmPassword: e.target.value })} />
          </div>
          <Button onClick={saveSifre} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Lock className="w-4 h-4 mr-2" />
            Şifreyi Değiştir
          </Button>
        </div>
      )}
    </div>
  )
}
