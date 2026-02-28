/**
 * Tıkla Bakım — Seed Script
 * Çalıştır: npx ts-node --project tsconfig.seed.json scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

// ============================================================
// PET TÜRLERİ
// ============================================================
const PET_TYPES = [
  { name: 'Köpek', slug: 'kopek', icon: '🐕', isActive: true },
  { name: 'Kedi', slug: 'kedi', icon: '🐈', isActive: true },
  { name: 'Tavşan', slug: 'tavsan', icon: '🐇', isActive: true },
  { name: 'Kuş', slug: 'kus', icon: '🦜', isActive: true },
]

// ============================================================
// KATEGORİLER
// ============================================================
const CATEGORIES = [
  {
    name: 'Pet Kuaför',
    slug: 'pet-kuafor',
    description: 'Kedi ve köpek kuaförü, yıkama, tıraş, bakım hizmetleri',
    icon: '🐾',
    order: 1,
  },
]

// ============================================================
// ŞEHİRLER VE İLÇELER
// ============================================================
const CITIES_DATA = [
  {
    name: 'İstanbul',
    slug: 'istanbul',
    districts: [
      { name: 'Adalar', slug: 'adalar' },
      { name: 'Arnavutköy', slug: 'arnavutkoy' },
      { name: 'Ataşehir', slug: 'atasehir' },
      { name: 'Avcılar', slug: 'avcilar' },
      { name: 'Bağcılar', slug: 'bagcilar' },
      { name: 'Bahçelievler', slug: 'bahcelievler' },
      { name: 'Bakırköy', slug: 'bakirkoy' },
      { name: 'Başakşehir', slug: 'basaksehir' },
      { name: 'Bayrampaşa', slug: 'bayrampasa' },
      { name: 'Beşiktaş', slug: 'besiktas' },
      { name: 'Beykoz', slug: 'beykoz' },
      { name: 'Beylikdüzü', slug: 'beylikduzu' },
      { name: 'Beyoğlu', slug: 'beyoglu' },
      { name: 'Büyükçekmece', slug: 'buyukcekmece' },
      { name: 'Çatalca', slug: 'catalca' },
      { name: 'Çekmeköy', slug: 'cekmekoy' },
      { name: 'Esenler', slug: 'esenler' },
      { name: 'Esenyurt', slug: 'esenyurt' },
      { name: 'Eyüpsultan', slug: 'eyupsultan' },
      { name: 'Fatih', slug: 'fatih' },
      { name: 'Gaziosmanpaşa', slug: 'gaziosmanpasa' },
      { name: 'Güngören', slug: 'gungoren' },
      { name: 'Kadıköy', slug: 'kadikoy' },
      { name: 'Kağıthane', slug: 'kagithane' },
      { name: 'Kartal', slug: 'kartal' },
      { name: 'Küçükçekmece', slug: 'kucukcekmece' },
      { name: 'Maltepe', slug: 'maltepe' },
      { name: 'Pendik', slug: 'pendik' },
      { name: 'Sancaktepe', slug: 'sancaktepe' },
      { name: 'Sarıyer', slug: 'sariyer' },
      { name: 'Silivri', slug: 'silivri' },
      { name: 'Sultanbeyli', slug: 'sultanbeyli' },
      { name: 'Sultangazi', slug: 'sultangazi' },
      { name: 'Şile', slug: 'sile' },
      { name: 'Şişli', slug: 'sisli' },
      { name: 'Tuzla', slug: 'tuzla' },
      { name: 'Ümraniye', slug: 'umraniye' },
      { name: 'Üsküdar', slug: 'uskudar' },
      { name: 'Zeytinburnu', slug: 'zeytinburnu' },
    ],
  },
  {
    name: 'Ankara',
    slug: 'ankara',
    districts: [
      { name: 'Akyurt', slug: 'akyurt' },
      { name: 'Altındağ', slug: 'altindag' },
      { name: 'Bala', slug: 'bala' },
      { name: 'Beypazarı', slug: 'beypazari' },
      { name: 'Çankaya', slug: 'cankaya' },
      { name: 'Çubuk', slug: 'cubuk' },
      { name: 'Elmadağ', slug: 'elmadag' },
      { name: 'Etimesgut', slug: 'etimesgut' },
      { name: 'Gölbaşı', slug: 'golbasi' },
      { name: 'Haymana', slug: 'haymana' },
      { name: 'Kazan', slug: 'kazan' },
      { name: 'Keçiören', slug: 'kecioren' },
      { name: 'Kızılcahamam', slug: 'kizilcahamam' },
      { name: 'Mamak', slug: 'mamak' },
      { name: 'Nallıhan', slug: 'nallihan' },
      { name: 'Polatlı', slug: 'polatli' },
      { name: 'Pursaklar', slug: 'pursaklar' },
      { name: 'Sincan', slug: 'sincan' },
      { name: 'Yenimahalle', slug: 'yenimahalle' },
    ],
  },
  {
    name: 'İzmir',
    slug: 'izmir',
    districts: [
      { name: 'Aliağa', slug: 'aliaga' },
      { name: 'Balçova', slug: 'balcova' },
      { name: 'Bayraklı', slug: 'bayrakli' },
      { name: 'Bergama', slug: 'bergama' },
      { name: 'Bornova', slug: 'bornova' },
      { name: 'Buca', slug: 'buca' },
      { name: 'Çeşme', slug: 'cesme' },
      { name: 'Çiğli', slug: 'cigli' },
      { name: 'Gaziemir', slug: 'gaziemir' },
      { name: 'Güzelbahçe', slug: 'guzelbahce' },
      { name: 'Karabağlar', slug: 'karabaglar' },
      { name: 'Karşıyaka', slug: 'karsiyaka' },
      { name: 'Kemalpaşa', slug: 'kemalpasa' },
      { name: 'Konak', slug: 'konak' },
      { name: 'Menderes', slug: 'menderes' },
      { name: 'Menemen', slug: 'menemen' },
      { name: 'Narlıdere', slug: 'narlidere' },
      { name: 'Seferihisar', slug: 'seferihisar' },
      { name: 'Selçuk', slug: 'selcuk' },
      { name: 'Tire', slug: 'tire' },
      { name: 'Torbalı', slug: 'torbali' },
      { name: 'Urla', slug: 'urla' },
    ],
  },
  {
    name: 'Bursa',
    slug: 'bursa',
    districts: [
      { name: 'Gemlik', slug: 'gemlik' },
      { name: 'İnegöl', slug: 'inegol' },
      { name: 'İznik', slug: 'iznik' },
      { name: 'Mudanya', slug: 'mudanya' },
      { name: 'Mustafakemalpaşa', slug: 'mustafakemalpasa' },
      { name: 'Nilüfer', slug: 'nilufer' },
      { name: 'Osmangazi', slug: 'osmangazi' },
      { name: 'Orhangazi', slug: 'orhangazi' },
      { name: 'Yenişehir', slug: 'yenisehir' },
      { name: 'Yıldırım', slug: 'yildirim' },
    ],
  },
  {
    name: 'Antalya',
    slug: 'antalya',
    districts: [
      { name: 'Aksu', slug: 'aksu' },
      { name: 'Alanya', slug: 'alanya' },
      { name: 'Döşemealtı', slug: 'dosemealti' },
      { name: 'Kemer', slug: 'kemer' },
      { name: 'Kepez', slug: 'kepez' },
      { name: 'Konyaaltı', slug: 'konyaalti' },
      { name: 'Kumluca', slug: 'kumluca' },
      { name: 'Manavgat', slug: 'manavgat' },
      { name: 'Muratpaşa', slug: 'muratpasa' },
      { name: 'Serik', slug: 'serik' },
    ],
  },
  {
    name: 'Adana',
    slug: 'adana',
    districts: [
      { name: 'Ceyhan', slug: 'ceyhan' },
      { name: 'Çukurova', slug: 'cukurova' },
      { name: 'Karataş', slug: 'karatas' },
      { name: 'Seyhan', slug: 'seyhan' },
      { name: 'Yüreğir', slug: 'yuregir' },
    ],
  },
  {
    name: 'Konya',
    slug: 'konya',
    districts: [
      { name: 'Karatay', slug: 'karatay' },
      { name: 'Meram', slug: 'meram' },
      { name: 'Selçuklu', slug: 'selcuklu' },
      { name: 'Ereğli', slug: 'eregli' },
      { name: 'Akşehir', slug: 'aksehir' },
    ],
  },
  {
    name: 'Gaziantep',
    slug: 'gaziantep',
    districts: [
      { name: 'Şahinbey', slug: 'sahinbey' },
      { name: 'Şehitkamil', slug: 'sehitkamil' },
      { name: 'Nizip', slug: 'nizip' },
      { name: 'İslahiye', slug: 'islahiye' },
      { name: 'Oğuzeli', slug: 'oguzeli' },
    ],
  },
  {
    name: 'Mersin',
    slug: 'mersin',
    districts: [
      { name: 'Akdeniz', slug: 'akdeniz' },
      { name: 'Erdemli', slug: 'erdemli' },
      { name: 'Mezitli', slug: 'mezitli' },
      { name: 'Silifke', slug: 'silifke' },
      { name: 'Tarsus', slug: 'tarsus' },
      { name: 'Toroslar', slug: 'toroslar' },
      { name: 'Yenişehir', slug: 'yenisehir' },
    ],
  },
  {
    name: 'Kayseri',
    slug: 'kayseri',
    districts: [
      { name: 'Develi', slug: 'develi' },
      { name: 'Kocasinan', slug: 'kocasinan' },
      { name: 'Melikgazi', slug: 'melikgazi' },
      { name: 'Talas', slug: 'talas' },
      { name: 'Yahyalı', slug: 'yahyali' },
    ],
  },
  {
    name: 'Eskişehir',
    slug: 'eskisehir',
    districts: [
      { name: 'Odunpazarı', slug: 'odunpazari' },
      { name: 'Tepebaşı', slug: 'tepebasi' },
      { name: 'Sivrihisar', slug: 'sivrihisar' },
      { name: 'Mihalıççık', slug: 'mihalliccik' },
    ],
  },
  {
    name: 'Trabzon',
    slug: 'trabzon',
    districts: [
      { name: 'Akçaabat', slug: 'akcaabat' },
      { name: 'Arsin', slug: 'arsin' },
      { name: 'Ortahisar', slug: 'ortahisar' },
      { name: 'Maçka', slug: 'macka' },
      { name: 'Yomra', slug: 'yomra' },
    ],
  },
  {
    name: 'Samsun',
    slug: 'samsun',
    districts: [
      { name: 'Atakum', slug: 'atakum' },
      { name: 'Bafra', slug: 'bafra' },
      { name: 'Canik', slug: 'canik' },
      { name: 'İlkadım', slug: 'ilkadim' },
      { name: 'Tekkeköy', slug: 'tekkekoy' },
    ],
  },
  {
    name: 'Denizli',
    slug: 'denizli',
    districts: [
      { name: 'Merkezefendi', slug: 'merkezefendi' },
      { name: 'Pamukkale', slug: 'pamukkale' },
      { name: 'Çivril', slug: 'civril' },
      { name: 'Tavas', slug: 'tavas' },
    ],
  },
  {
    name: 'Manisa',
    slug: 'manisa',
    districts: [
      { name: 'Akhisar', slug: 'akhisar' },
      { name: 'Salihli', slug: 'salihli' },
      { name: 'Şehzadeler', slug: 'sehzadeler' },
      { name: 'Turgutlu', slug: 'turgutlu' },
      { name: 'Yunusemre', slug: 'yunusemre' },
    ],
  },
  {
    name: 'Balıkesir',
    slug: 'balikesir',
    districts: [
      { name: 'Altıeylül', slug: 'altieylul' },
      { name: 'Ayvalık', slug: 'ayvalik' },
      { name: 'Bandırma', slug: 'bandirma' },
      { name: 'Edremit', slug: 'edremit' },
      { name: 'Karesi', slug: 'karesi' },
    ],
  },
  {
    name: 'Malatya',
    slug: 'malatya',
    districts: [
      { name: 'Battalgazi', slug: 'battalgazi' },
      { name: 'Doğanşehir', slug: 'dogansehir' },
      { name: 'Yeşilyurt', slug: 'yesilyurt' },
      { name: 'Akçadağ', slug: 'akcadag' },
    ],
  },
  {
    name: 'Kahramanmaraş',
    slug: 'kahramanmaras',
    districts: [
      { name: 'Dulkadiroğlu', slug: 'dulkadiroglu' },
      { name: 'Elbistan', slug: 'elbistan' },
      { name: 'Onikişubat', slug: 'onikişubat' },
      { name: 'Afşin', slug: 'afsin' },
    ],
  },
]

// ============================================================
// ÖRNEK İŞLETMELER
// ============================================================
const SAMPLE_BUSINESSES = [
  {
    name: 'Pawsome Pet Salon',
    slug: 'pawsome-pet-salon-kadikoy',
    city: 'istanbul',
    district: 'kadikoy',
    address: 'Moda Cad. No:15, Kadıköy, İstanbul',
    phone: '0216 345 67 89',
    lat: 40.9882,
    lng: 29.0295,
    plan: 'PREMIUM' as const,
    description: 'Kadıköy\'ün en sevilen pet kuaförü. Köpek ve kedi bakımında uzmanız.',
    services: [
      { name: 'Tam Bakım (Köpek)', category: 'kopek', price: 450, duration: 120 },
      { name: 'Banyo + Kurutma', category: 'kopek', price: 250, duration: 60 },
      { name: 'Kedi Tıraşı', category: 'kedi', price: 350, duration: 90 },
      { name: 'Tırnak Kesimi', category: 'tum', price: 80, duration: 15 },
    ],
    workingHours: [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 1, openTime: '09:00', closeTime: '19:00', isClosed: false },
      { dayOfWeek: 2, openTime: '09:00', closeTime: '19:00', isClosed: false },
      { dayOfWeek: 3, openTime: '09:00', closeTime: '19:00', isClosed: false },
      { dayOfWeek: 4, openTime: '09:00', closeTime: '19:00', isClosed: false },
      { dayOfWeek: 5, openTime: '09:00', closeTime: '19:00', isClosed: false },
      { dayOfWeek: 6, openTime: '10:00', closeTime: '17:00', isClosed: false },
    ],
  },
  {
    name: 'PetStyle Kuaför',
    slug: 'petstyle-kuafor-besiktas',
    city: 'istanbul',
    district: 'besiktas',
    address: 'Barbaros Blv. No:42, Beşiktaş, İstanbul',
    phone: '0212 256 78 90',
    lat: 41.0438,
    lng: 29.0059,
    plan: 'BASIC' as const,
    description: 'Beşiktaş\'ta uygun fiyatlı köpek ve kedi bakımı.',
    services: [
      { name: 'Banyo + Makas', category: 'kopek', price: 300, duration: 90 },
      { name: 'Kedi Bakımı', category: 'kedi', price: 280, duration: 60 },
    ],
    workingHours: [
      { dayOfWeek: 0, openTime: '10:00', closeTime: '18:00', isClosed: true },
      { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayOfWeek: 6, openTime: '10:00', closeTime: '16:00', isClosed: false },
    ],
  },
  {
    name: 'Pati Pati Pet Spa',
    slug: 'pati-pati-pet-spa-sisli',
    city: 'istanbul',
    district: 'sisli',
    address: 'Halaskargazi Cad. No:78, Şişli, İstanbul',
    phone: '0212 323 45 67',
    lat: 41.0602,
    lng: 28.9878,
    plan: 'ENTERPRISE' as const,
    isFeatured: true,
    description: 'İstanbul\'un en premium pet spa\'sı. VIP bakım hizmetleri.',
    services: [
      { name: 'VIP Tam Bakım', category: 'kopek', price: 800, duration: 180 },
      { name: 'Premium Kedi Bakımı', category: 'kedi', price: 600, duration: 120 },
      { name: 'Banyo Paketi', category: 'tum', price: 350, duration: 90 },
      { name: 'Tırnak + Kulak Temizliği', category: 'tum', price: 150, duration: 30 },
    ],
    workingHours: [
      { dayOfWeek: 0, openTime: '11:00', closeTime: '19:00', isClosed: false },
      { dayOfWeek: 1, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { dayOfWeek: 2, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { dayOfWeek: 3, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { dayOfWeek: 4, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { dayOfWeek: 5, openTime: '09:00', closeTime: '20:00', isClosed: false },
      { dayOfWeek: 6, openTime: '10:00', closeTime: '18:00', isClosed: false },
    ],
  },
]

async function main() {
  console.log('🌱 Tıkla Bakım Seed başlıyor...')

  // ── Pet türleri ───────────────────────────────────────────
  console.log('\n🐾 Pet türleri ekleniyor...')
  for (const pt of PET_TYPES) {
    await db.petType.upsert({
      where: { slug: pt.slug },
      update: { name: pt.name, icon: pt.icon, isActive: pt.isActive },
      create: pt,
    })
    console.log(`✅ Pet türü: ${pt.name}`)
  }

  // ── Admin kullanıcı ──────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tiklabakim.com'
  const adminPassword = 'Admin123!'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Tıkla Bakım Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin oluşturuldu: ${admin.email}`)

  // ── Kategoriler ──────────────────────────────────────────
  console.log('\n📂 Kategoriler ekleniyor...')
  const categoryMap: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const category = await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, order: cat.order },
      create: cat,
    })
    categoryMap[cat.slug] = category.id
    console.log(`✅ Kategori: ${category.name}`)
  }

  // ── Şehirler ve ilçeler ─────────────────────────────────
  console.log('\n🏙️  Şehirler ve ilçeler ekleniyor...')
  // Örnek işletmeleri olan ilçeler otomatik yayımlanır
  const PUBLISHED_CITIES = ['istanbul']
  const PUBLISHED_DISTRICTS: Record<string, string[]> = {
    istanbul: ['kadikoy', 'besiktas', 'sisli'],
  }

  for (const cityData of CITIES_DATA) {
    const isPublished = PUBLISHED_CITIES.includes(cityData.slug)
    const city = await db.city.upsert({
      where: { slug: cityData.slug },
      update: { name: cityData.name, isPublished },
      create: { name: cityData.name, slug: cityData.slug, isPublished },
    })

    for (const dist of cityData.districts) {
      const distPublished = (PUBLISHED_DISTRICTS[cityData.slug] || []).includes(dist.slug)
      await db.district.upsert({
        where: { cityId_slug: { cityId: city.id, slug: dist.slug } },
        update: { name: dist.name, isPublished: distPublished },
        create: { name: dist.name, slug: dist.slug, cityId: city.id, isPublished: distPublished },
      })
    }
    console.log(`✅ ${city.name}: ${cityData.districts.length} ilçe (yayım: ${isPublished ? '✓' : '✗'})`)
  }

  // ── Örnek işletmeler ─────────────────────────────────────
  console.log('\n🏪 Örnek işletmeler ekleniyor...')
  const petKuaforCategoryId = categoryMap['pet-kuafor']

  for (const bizData of SAMPLE_BUSINESSES) {
    const { services, workingHours, ...businessData } = bizData

    const existing = await db.business.findUnique({
      where: { slug: businessData.slug },
    })

    if (!existing) {
      const business = await db.business.create({
        data: {
          ...businessData,
          isActive: true,
          isVerified: true,
          featuredScore: businessData.plan === 'ENTERPRISE' ? 200 : businessData.plan === 'PREMIUM' ? 150 : 100,
          categoryId: petKuaforCategoryId,
        },
      })

      await db.service.createMany({
        data: services.map((s, i) => ({
          businessId: business.id,
          ...s,
          price: s.price,
          order: i,
          isActive: true,
        })),
      })

      await db.workingHours.createMany({
        data: workingHours.map((wh) => ({
          businessId: business.id,
          ...wh,
        })),
      })

      console.log(`✅ İşletme oluşturuldu: ${business.name}`)
    } else {
      // Mevcut işletmelere kategori ata (categoryId yoksa)
      if (!existing.categoryId && petKuaforCategoryId) {
        await db.business.update({
          where: { id: existing.id },
          data: { categoryId: petKuaforCategoryId },
        })
      }
      console.log(`⏭️  Zaten mevcut: ${businessData.name}`)
    }
  }

  console.log('\n🎉 Seed tamamlandı!')
  console.log('\n📝 Notlar:')
  console.log('   - Site: Tıkla Bakım / tiklabakim.com')
  console.log('   - Admin paneli: /admin')
  console.log(`   - Admin email: ${adminEmail}`)
  console.log(`   - Admin şifre: ${adminPassword}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
