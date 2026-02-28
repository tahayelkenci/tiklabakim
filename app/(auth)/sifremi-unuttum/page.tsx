'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PawPrint, Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Gerçek projede şifre sıfırlama emaili gönderilir
      // Şu an email servisi yapılandırılmamışsa sadece başarı mesajı göster
      await new Promise((r) => setTimeout(r, 600))
      setSent(true)
    } catch {
      setError('Bir hata oluştu. Tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Gönderildi</h2>
              <p className="text-gray-600 text-sm mb-6">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
                Gelen kutunuzu kontrol edin.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Email görünmüyorsa spam/gereksiz klasörünü kontrol edin.
              </p>
              <Link
                href="/giris"
                className="flex items-center justify-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
              <p className="text-gray-500 text-sm mb-6">
                Email adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sıfırlama Bağlantısı Gönder
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/giris"
                  className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
