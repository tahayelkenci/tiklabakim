import Link from 'next/link'
import { PawPrint, Mail, Phone, Instagram, Facebook } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Marka */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Tıkla<span className="text-orange-400">Bakım</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Türkiye&apos;nin en kapsamlı pet kuaför arama ve randevu platformu.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="mailto:info@tiklabakim.com" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Popüler Şehirler */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popüler Şehirler</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['İstanbul', 'istanbul'],
                ['Ankara', 'ankara'],
                ['İzmir', 'izmir'],
                ['Bursa', 'bursa'],
                ['Antalya', 'antalya'],
                ['Adana', 'adana'],
              ].map(([name, slug]) => (
                <li key={slug}>
                  <Link
                    href={`/pet-kuafor/${slug}`}
                    className="hover:text-orange-400 transition-colors"
                  >
                    {name} Pet Kuaförleri
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hizmetler */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hizmetler</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pet-kuafor/kopek" className="hover:text-orange-400 transition-colors">
                  Köpek Kuaförleri
                </Link>
              </li>
              <li>
                <Link href="/pet-kuafor/kedi" className="hover:text-orange-400 transition-colors">
                  Kedi Kuaförleri
                </Link>
              </li>
              <li>
                <Link href="/kayit?role=business" className="hover:text-orange-400 transition-colors">
                  İşletmeni Ekle
                </Link>
              </li>
              <li>
                <Link href="/kayit" className="hover:text-orange-400 transition-colors">
                  Üye Ol
                </Link>
              </li>
              <li>
                <Link href="/arama" className="hover:text-orange-400 transition-colors">
                  Kuaför Ara
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim & Yasal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kurumsal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hakkimizda" className="hover:text-orange-400 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-orange-400 transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/gizlilik" className="hover:text-orange-400 transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="hover:text-orange-400 transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="hover:text-orange-400 transition-colors">
                  KVKK
                </Link>
              </li>
            </ul>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>info@tiklabakim.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© {currentYear} Tıkla Bakım. Tüm hakları saklıdır.</p>
            <p>Türkiye&apos;nin Pet Kuaför Platformu 🐾</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
