import type { Metadata } from 'next'
import { db } from '@/lib/db'

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({ where: { slug: 'gizlilik' } })
  return {
    title: page?.metaTitle || page?.title || 'Gizlilik Politikası | Tıkla Bakım',
    description: page?.metaDesc || 'Tıkla Bakım gizlilik politikası ve kişisel veri koruma hükümleri.',
  }
}

export default async function GizlilikPage() {
  const page = await db.page.findUnique({ where: { slug: 'gizlilik' } })

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gizlilik Politikası</h1>
        <p className="text-sm text-gray-500 mb-10">Son güncelleme: Ocak 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Genel Bilgiler</h2>
            <p className="text-gray-600 leading-relaxed">
              Tıkla Bakım ("biz", "bizim" veya "platform") olarak kişisel verilerinizin gizliliğini korumayı taahhüt ediyoruz.
              Bu politika, tiklabakim.com üzerinden toplanan kişisel verilerin nasıl işlendiğini açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Toplanan Veriler</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Aşağıdaki kişisel verilerinizi toplayabiliriz:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Ad, soyad ve iletişim bilgileri (email, telefon)</li>
              <li>Hesap bilgileri (kullanıcı adı, şifreli parola)</li>
              <li>Evcil hayvan bilgileri (ad, tür, ırk, doğum tarihi)</li>
              <li>Randevu geçmişi ve tercihleri</li>
              <li>Platform kullanım verileri (IP adresi, tarayıcı bilgisi)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Verilerin Kullanım Amacı</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Kişisel verilerinizi şu amaçlarla işleriz:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Hesabınızı oluşturmak ve yönetmek</li>
              <li>Randevu oluşturma ve yönetim hizmetleri sunmak</li>
              <li>Bildirim ve hatırlatma göndermek</li>
              <li>Platform güvenliğini sağlamak</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Veri Paylaşımı</h2>
            <p className="text-gray-600 leading-relaxed">
              Kişisel verilerinizi üçüncü taraflarla satmaz veya kiralamayız.
              Yalnızca hizmet sunumu için gerekli olan ve gizlilik taahhüdü veren iş ortaklarımızla sınırlı ölçüde paylaşabiliriz.
              Yasal zorunluluk durumunda yetkili makamlarla paylaşım yapılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Veri Güvenliği</h2>
            <p className="text-gray-600 leading-relaxed">
              Verilerinizi korumak için endüstri standartlarında güvenlik önlemleri kullanıyoruz.
              Şifreler bcrypt ile hashlenerek saklanmakta, bağlantılar HTTPS ile şifrelenmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Haklarınız</h2>
            <p className="text-gray-600 leading-relaxed mb-3">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Kişisel verilerinize erişim hakkı</li>
              <li>Verilerin düzeltilmesini talep etme hakkı</li>
              <li>Verilerin silinmesini talep etme hakkı</li>
              <li>Veri işlemeye itiraz etme hakkı</li>
              <li>Veri taşınabilirliği hakkı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. İletişim</h2>
            <p className="text-gray-600 leading-relaxed">
              Gizlilik politikamız hakkında sorularınız için{' '}
              <a href="mailto:kvkk@tiklabakim.com" className="text-orange-500 hover:underline">
                kvkk@tiklabakim.com
              </a>{' '}
              adresine yazabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
