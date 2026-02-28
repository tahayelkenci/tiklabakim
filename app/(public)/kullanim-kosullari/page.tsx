export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { db } from '@/lib/db'

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({ where: { slug: 'kullanim-kosullari' } })
  return {
    title: page?.metaTitle || page?.title || 'Kullanım Koşulları | Tıkla Bakım',
    description: page?.metaDesc || 'Tıkla Bakım platform kullanım koşulları ve hizmet şartları.',
  }
}

export default async function KullanimKosullariPage() {
  const page = await db.page.findUnique({ where: { slug: 'kullanim-kosullari' } })

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanım Koşulları</h1>
        <p className="text-sm text-gray-500 mb-10">Son güncelleme: Ocak 2025</p>

        <div className="space-y-8">
          {[
            { title: '1. Hizmetin Kapsamı', content: 'Tıkla Bakım, pet sahiplerini pet kuaförü işletmeleriyle buluşturan bir çevrimiçi platformdur. Platform üzerinden işletme profilleri görüntülenebilir, randevu alınabilir ve yorum bırakılabilir.' },
            { title: '2. Hesap Oluşturma', content: "Platform kullanımı için geçerli bir email adresi ile kayıt olunması gerekmektedir. Hesabınızın güvenliğinden siz sorumlusunuzdur. Şifrenizi kimseyle paylaşmayınız. Sahte bilgilerle hesap oluşturmak yasaktır ve hesabınız askıya alınabilir." },
            { title: '3. İşletme Sahipleri İçin Kurallar', content: 'İşletme profili oluşturan kullanıcılar gerçek bir işletmeyi temsil etmek zorundadır. Yanıltıcı bilgi girişi, sahte yorum manipülasyonu ve platformun kötüye kullanımı hesap kapatma sebebidir. Randevu taleplerini makul sürede yanıtlamak esastır.' },
            { title: '4. Pet Sahipleri İçin Kurallar', content: 'Randevularınızı makul sebep olmaksızın iptal etmemek veya randevuya gelmemek işletmeler açısından mağduriyet yaratır. Yorum bırakırken deneyiminizi dürüstçe aktarın; hakaret ve iftira içeren yorumlar kaldırılacaktır.' },
            { title: '5. Yasaklı İçerikler', content: "Platform üzerinde; hakaret içeren yorumlar, telif hakkı ihlali içeren görseller, spam mesajlar, yanıltıcı ilanlar ve yasadışı hizmet teklifleri kesinlikle yasaktır. Bu tür içerikler bildirim yapılmadan kaldırılır." },
            { title: '6. Ödeme ve İade', content: 'Abonelik planları aylık olarak ücretlendirilir. İade politikası hakkında detaylı bilgi için iletisim sayfamızı ziyaret ediniz.' },
            { title: '7. Sorumluluk Sınırı', content: "Tıkla Bakım, platform üzerinde ilan verilen işletmelerin hizmet kalitesinden doğrudan sorumlu değildir. Platform aracılık hizmeti vermektedir. İşletmeler ve pet sahipleri arasındaki anlaşmazlıklarda taraf değiliz; ancak çözüm sürecinde destek olmaya çalışırız." },
            { title: '8. Değişiklikler', content: 'Bu koşulları önceden haber vermeksizin değiştirme hakkımız saklıdır. Değişiklikler platform üzerinde yayımlanır ve yayımlandıktan sonra geçerli olur.' },
            { title: '9. Uygulanacak Hukuk', content: "Bu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Anlaşmazlıklarda İstanbul mahkemeleri yetkilidir." },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. İletişim</h2>
            <p className="text-gray-600 leading-relaxed">
              Kullanım koşullarına ilişkin sorularınız için{' '}
              <a href="mailto:destek@tiklabakim.com" className="text-orange-500 hover:underline">
                destek@tiklabakim.com
              </a>{' '}
              adresine yazabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
