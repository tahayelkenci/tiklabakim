import Link from 'next/link'
import { PawPrint } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🐾</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sayfa Bulunamadı</h2>
        <p className="text-gray-500 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/pet-kuafor"
            className="px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
          >
            Kuaför Ara
          </Link>
        </div>
      </div>
    </div>
  )
}
