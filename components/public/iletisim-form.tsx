'use client'

import { useState } from 'react'
import { Mail, MapPin, Clock, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function IletisimForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: 'Email',
              lines: ['destek@tiklabakim.com', 'info@tiklabakim.com'],
              color: 'text-orange-500 bg-orange-50',
            },
            {
              icon: Clock,
              title: 'Çalışma Saatleri',
              lines: ['Pazartesi – Cuma', '09:00 – 18:00'],
              color: 'text-teal-500 bg-teal-50',
            },
            {
              icon: MapPin,
              title: 'Adres',
              lines: ['İstanbul, Türkiye'],
              color: 'text-blue-500 bg-blue-50',
            },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3`}>
                <c.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{c.title}</h3>
              {c.lines.map((l, j) => (
                <p key={j} className="text-sm text-gray-600">{l}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Mesajınız İletildi!</h2>
              <p className="text-gray-600">En kısa sürede size geri döneceğiz.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mesaj Gönder</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ahmet Yılmaz"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Konu</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Mesajınızın konusu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mesaj</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  placeholder="Mesajınızı buraya yazın..."
                  required
                  className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Gönder
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
