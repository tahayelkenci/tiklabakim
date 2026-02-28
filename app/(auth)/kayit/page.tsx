'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PawPrint, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'business' ? 'BUSINESS_OWNER' : 'PET_OWNER'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    role: defaultRole,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.passwordConfirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (form.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      return
    }

    setLoading(true)
    try {
      // 1. Kayıt API
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          role: form.role,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Kayıt başarısız oldu.')
        return
      }

      // 2. Otomatik giriş
      const loginResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (loginResult?.error) {
        // Kayıt oldu ama auto-login başarısız → login sayfasına yönlendir
        window.location.href = '/giris?registered=1'
        return
      }

      // 3. Tam sayfa yenileme + role'e göre yönlendirme
      window.location.href = form.role === 'BUSINESS_OWNER' ? '/dashboard' : '/hesabim'
    } catch {
      setError('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Pet<span className="text-orange-500">Pati</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ücretsiz Kayıt Ol</h1>
          <p className="text-gray-500 text-sm mb-6">
            Zaten üye misiniz?{' '}
            <Link href="/giris" className="text-orange-500 hover:underline font-medium">
              Giriş yapın
            </Link>
          </p>

          {/* Rol Seçimi */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'PET_OWNER', emoji: '🐾', label: 'Pet Sahibiyim' },
              { value: 'BUSINESS_OWNER', emoji: '✂️', label: 'İşletme Sahibiyim' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, role: opt.value })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  form.role === opt.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-sm font-medium text-gray-800">{opt.label}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
              <Input
                type="text"
                placeholder="Ahmet Yılmaz"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="ornek@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Telefon <span className="text-gray-400 font-normal text-xs">(opsiyonel)</span>
              </label>
              <Input
                type="tel"
                placeholder="0532 000 00 00"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifre</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="En az 8 karakter"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifre Tekrar</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.passwordConfirm}
                onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                required
                autoComplete="new-password"
              />
            </div>

            <p className="text-xs text-gray-500">
              Kaydolarak{' '}
              <Link href="/kullanim-kosullari" className="text-orange-500 hover:underline">
                Kullanım Koşulları
              </Link>{' '}
              ve{' '}
              <Link href="/gizlilik" className="text-orange-500 hover:underline">
                Gizlilik Politikası
              </Link>
              &apos;nı kabul etmiş olursunuz.
            </p>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ücretsiz Kaydol
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
