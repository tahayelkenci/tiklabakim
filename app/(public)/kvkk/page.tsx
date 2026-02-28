import type { Metadata } from 'next'
import { db } from '@/lib/db'

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({ where: { slug: 'kvkk' } })
  return {
    title: page?.metaTitle || page?.title || 'KVKK Aydınlatma Metni | Tıkla Bakım',
    description: page?.metaDesc || 'Tıkla Bakım KVKK (Kişisel Verilerin Korunması Kanunu) aydınlatma metni.',
  }
}

export default async function KvkkPage() {
  const page = await db.page.findUnique({ where: { slug: 'kvkk' } })

  if (page?.content) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-orange-50 to-teal-50 py-12">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          </div>
        </section>
        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KVKK Aydınlatma Metni</h1>
        <p className="text-sm text-gray-500 mb-2">6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında</p>
        <p className="text-sm text-gray-500 mb-10">Son güncelleme: Ocak 2025</p>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-8">
          <p className="text-sm text-orange-800">
            <strong>Veri Sorumlusu:</strong> Tıkla Bakım Teknoloji A.Ş., İstanbul, Türkiye
            <br />
            <strong>İletişim:</strong> kvkk@tiklabakim.com
          </p>
        </div>

        <div className="space-y-8">
          {[
            { title: '1. Kişisel Verilerin İşlenme Amacı', items: ['Üyelik oluşturulması ve hesap yönetimi', 'Platform hizmetlerinin sunulması (randevu, profil)', 'İşletme ve pet sahiplerinin eşleştirilmesi', 'Yasal yükümlülüklerin yerine getirilmesi', 'Platformun güvenliğinin sağlanması', 'Müşteri hizmetleri ve destek'] },
            { title: '2. İşlenen Kişisel Veri Kategorileri', items: ['Kimlik verileri: Ad, soyad', 'İletişim verileri: Email, telefon numarası', 'Hesap verileri: Kullanıcı adı, şifreli parola (hash)', 'İşlem verileri: Randevu geçmişi', 'Teknik veriler: IP adresi, tarayıcı bilgisi, oturum bilgisi', 'Evcil hayvan bilgileri: Ad, tür, ırk, sağlık notları'] },
            { title: '3. Kişisel Verilerin Aktarımı', items: ['Yasal zorunluluk halinde kamu kurumlarına', 'Hizmet alınan teknik altyapı sağlayıcılarına (veri işleyen sıfatıyla)', 'Ödeme işlemleri için lisanslı ödeme kuruluşlarına'] },
            { title: '4. Hukuki Dayanaklar', items: ['KVKK Madde 5/2-a: Açık rıza', 'KVKK Madde 5/2-c: Sözleşmenin kurulması veya ifası', 'KVKK Madde 5/2-ç: Veri sorumlusunun hukuki yükümlülüğü', 'KVKK Madde 5/2-f: Meşru menfaat'] },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                {section.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. KVKK Kapsamındaki Haklarınız</h2>
            <p className="text-gray-600 mb-3">KVKK nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmesi halinde bunların düzeltilmesini isteme</li>
              <li>Verilerin silinmesini veya yok edilmesini isteme</li>
              <li>İşleme itiraz etme</li>
              <li>Zararın giderilmesini talep etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Başvuru Yöntemi</h2>
            <p className="text-gray-600 leading-relaxed">
              KVKK kapsamındaki haklarınızı kullanmak için{' '}
              <a href="mailto:kvkk@tiklabakim.com" className="text-orange-500 hover:underline">kvkk@tiklabakim.com</a>{' '}
              adresine e-posta gönderebilir veya platform üzerinden yazılı başvuru yapabilirsiniz. Başvurularınız 30 gün içinde sonuçlandırılır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Çerezler (Cookies)</h2>
            <p className="text-gray-600 leading-relaxed">
              Platformumuz oturum yönetimi için zorunlu çerezler kullanmaktadır. Bu çerezler olmadan platform işlevleri düzgün çalışmaz. Üçüncü taraf reklam çerezleri kullanılmamaktadır.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
