# PetPati — Türkiye'nin Pet Kuaför Listeleme Platformu
## Proje Dokümantasyonu v1.0

---

## 1. PROJE VİZYONU & STRATEJİK HEDEFLER

**PetPati**, Türkiye'deki tüm pet kuaförlerini tek platformda toplayan, SEO odaklı gelir modeline sahip, listeleme + randevu + CRM çözümü sunan kapsamlı bir SaaS platformdur.

### Birincil Hedefler
- Google'da "kadıköy pet kuaförleri", "beşiktaş kedi kuaförü" gibi yerel aramalarda ilk sayfa / ilk sıra
- LLM (ChatGPT, Gemini, Claude) referans kaynağı olarak indexlenmek
- İşletmelere premium listeleme, reklam alanı ve dijital araçlar satmak
- Türkiye genelinde ölçeklenebilir SaaS gelir modeli

### Büyüme Yol Haritası
```
Faz 1 (0-3 ay)  → Google Maps API ile toplu veri çekimi + MVP yayını
Faz 2 (3-6 ay)  → İşletme sahipleri premium üyeliğe geçiş + randevu sistemi
Faz 3 (6-12 ay) → Mobil uygulama + CRM + kampanya sistemi
Faz 4 (12+ ay)  → Güzellik merkezleri, veteriner klinikleri gibi yeni kategoriler
```

---

## 2. TEKNİK MİMARİ

### 2.1 Tech Stack

| Katman | Teknoloji | Gerekçe |
|--------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | SSG/SSR hibrit, SEO mükemmel, RSC desteği |
| **Styling** | Tailwind CSS + shadcn/ui | Hızlı geliştirme, tutarlı tasarım sistemi |
| **Backend** | Next.js API Routes + tRPC | Type-safe, full-stack tek repo |
| **Database** | PostgreSQL (Supabase) | İlişkisel veri, PostGIS coğrafi sorgular |
| **ORM** | Prisma | Type-safe sorgular, migration yönetimi |
| **Auth** | NextAuth.js v5 | Multi-role auth, Google OAuth, credentials |
| **Cache** | Redis (Upstash) | Rate limiting, session cache, API cache |
| **Storage** | Cloudflare R2 | Fotoğraf depolama, CDN |
| **Search** | Meilisearch | Türkçe karakter destekli fuzzy search |
| **Maps** | Google Maps JavaScript API | Harita görüntüleme |
| **Veri Çekimi** | Google Places API | Tek seferlik toplu işletme verisi |
| **Email** | Resend + React Email | Bildirim emailleri |
| **Push** | Firebase Cloud Messaging | Mobil push bildirimleri |
| **Ödeme** | İyzico | Türkiye'ye özel ödeme altyapısı |
| **Analytics** | Plausible + Google Search Console | Privacy-first analytics |
| **Deployment** | Vercel + Supabase Cloud | Serverless, auto-scaling |
| **Monitoring** | Sentry + Axiom | Hata takibi, log yönetimi |

### 2.2 Monorepo Yapısı

```
petpati/
├── apps/
│   ├── web/                    # Next.js ana uygulama
│   └── mobile/                 # React Native (Expo) - Faz 3
├── packages/
│   ├── database/               # Prisma schema + migrations
│   ├── ui/                     # Ortak UI bileşenleri
│   ├── config/                 # ESLint, TypeScript, Tailwind config
│   └── types/                  # Ortak TypeScript tipleri
├── scripts/
│   ├── seed-google-maps.ts     # Tek seferlik Maps API veri çekimi
│   └── seo-sitemap.ts         # Sitemap üretici
└── docs/                       # Bu doküman
```

### 2.3 Veritabanı Şeması (Prisma)

```prisma
// Kullanıcı sistemi
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  phone         String?
  role          UserRole  @default(PET_OWNER)
  createdAt     DateTime  @default(now())
  
  // İlişkiler
  pets          Pet[]
  appointments  Appointment[]
  business      Business?
  reviews       Review[]
  notifications Notification[]
}

enum UserRole {
  PET_OWNER
  BUSINESS_OWNER
  ADMIN
}

// İşletme
model Business {
  id              String          @id @default(cuid())
  googlePlaceId   String?         @unique   // Google Maps referansı
  slug            String          @unique   // URL-friendly isim
  name            String
  description     String?
  phone           String?
  email           String?
  website         String?
  
  // Adres
  address         String
  city            String          // İstanbul
  district        String          // Kadıköy
  neighborhood    String?         // Moda
  lat             Float
  lng             Float
  
  // Plan
  plan            BusinessPlan    @default(FREE)
  planExpiresAt   DateTime?
  isVerified      Boolean         @default(false)
  isFeatured      Boolean         @default(false)
  featuredScore   Int             @default(0)  // Listeleme sıralaması
  
  // Reklam bakiyesi
  adBalance       Decimal         @default(0)
  
  // İçerik
  logo            String?
  coverPhoto      String?
  photos          String[]
  
  // Hizmetler ve meta
  services        Service[]
  workingHours    WorkingHours[]
  appointments    Appointment[]
  reviews         Review[]
  
  // Sosyal
  instagram       String?
  facebook        String?
  
  ownerId         String?         @unique
  owner           User?           @relation(fields: [ownerId], references: [id])
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([city, district])
  @@index([lat, lng])
  @@index([plan, featuredScore])
}

enum BusinessPlan {
  FREE        // Sadece temel bilgiler
  BASIC       // Profil düzenleme + galeri
  PREMIUM     // Önde listeleme + randevu + CRM
  ENTERPRISE  // Reklam + kampanya + tam CRM
}

// Hizmetler
model Service {
  id          String    @id @default(cuid())
  businessId  String
  business    Business  @relation(fields: [businessId], references: [id])
  name        String    // "Banyo + Kurutma", "Tam Bakım"
  category    String    // "kedi", "köpek", "tüm"
  petBreeds   String[]  // Hangi cinsler için
  price       Decimal?
  duration    Int?      // Dakika
  description String?
  isActive    Boolean   @default(true)
}

// Pet Profili
model Pet {
  id          String    @id @default(cuid())
  ownerId     String
  owner       User      @relation(fields: [ownerId], references: [id])
  name        String
  type        PetType   // kedi, köpek, tavşan vs.
  breed       String?
  birthDate   DateTime?
  weight      Float?
  gender      String?
  photo       String?
  notes       String?   // Özel notlar
  allergies   String?
  vaccines    Vaccine[]
  appointments Appointment[]
  groomingHistory GroomingRecord[]
}

enum PetType {
  DOG
  CAT
  RABBIT
  BIRD
  OTHER
}

// Randevu
model Appointment {
  id            String              @id @default(cuid())
  businessId    String
  business      Business            @relation(fields: [businessId], references: [id])
  petId         String
  pet           Pet                 @relation(fields: [petId], references: [id])
  userId        String
  user          User                @relation(fields: [userId], references: [id])
  serviceId     String?
  
  date          DateTime
  duration      Int                 // Dakika
  status        AppointmentStatus   @default(PENDING)
  notes         String?
  
  // No-show takibi
  noShow        Boolean             @default(false)
  noShowCount   Int                 @default(0)
  
  // Bakım sonrası
  beforePhotos  String[]
  afterPhotos   String[]
  groomingNotes String?
  completedAt   DateTime?
  
  createdAt     DateTime            @default(now())
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

// İnceleme / Puan
model Review {
  id          String    @id @default(cuid())
  businessId  String
  business    Business  @relation(fields: [businessId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  rating      Int       // 1-5
  comment     String?
  photos      String[]
  isVerified  Boolean   @default(false) // Gerçek randevudan mı?
  createdAt   DateTime  @default(now())
}

// Bakım geçmişi kaydı
model GroomingRecord {
  id          String    @id @default(cuid())
  petId       String
  pet         Pet       @relation(fields: [petId], references: [id])
  businessId  String
  date        DateTime
  services    String[]
  notes       String?
  photos      String[]
  price       Decimal?
}

// Çalışma saatleri
model WorkingHours {
  id          String    @id @default(cuid())
  businessId  String
  business    Business  @relation(fields: [businessId], references: [id])
  dayOfWeek   Int       // 0=Pazar, 1=Pazartesi...
  openTime    String    // "09:00"
  closeTime   String    // "18:00"
  isClosed    Boolean   @default(false)
}

// Bildirimler
model Notification {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  type        String
  title       String
  body        String
  data        Json?
  isRead      Boolean   @default(false)
  createdAt   DateTime  @default(now())
}

// Aşı kaydı
model Vaccine {
  id          String    @id @default(cuid())
  petId       String
  pet         Pet       @relation(fields: [petId], references: [id])
  name        String
  date        DateTime
  nextDueDate DateTime?
  notes       String?
}

// Reklam / Kampanya
model Campaign {
  id          String    @id @default(cuid())
  businessId  String
  title       String
  description String
  targetCity  String?
  targetDistrict String?
  targetPetType  PetType?
  budget      Decimal
  spent       Decimal   @default(0)
  isActive    Boolean   @default(true)
  startsAt    DateTime
  endsAt      DateTime
  createdAt   DateTime  @default(now())
}
```

---

## 3. URL & SEO MİMARİSİ

### 3.1 URL Yapısı (Genişletilebilir)

```
# Ana listeleme sayfaları
/pet-kuafor                          → Türkiye geneli
/pet-kuafor/istanbul                 → Şehir
/pet-kuafor/istanbul/kadikoy         → İlçe
/pet-kuafor/istanbul/kadikoy/moda    → Mahalle (ilerleyen dönem)

# İşletme profili
/pet-kuafor/pawsome-pet-salon  → İşletme detay

# Hizmet bazlı listeleme
/pet-kuafor/kedi                        → Türkiye geneli kedi
/pet-kuafor/kedi/istanbul/kadikoy
/pet-kuafor/kedi/istanbul/besiktas
/pet-kuafor/kopek

# Gelecek kategoriler (altyapı hazır)
/veteriner/istanbul/kadikoy
/guzellik-merkezi/istanbul/sisli
/kopek-egitimi/ankara/cankaya
```

### 3.2 SEO Teknik Altyapısı

```typescript
// Her sayfa için dinamik metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const { city, district } = params;
  
  return {
    title: `${districtName} Pet Kuaförleri | En İyi ${cityName} Pet Kuaförleri - PetPati`,
    description: `${districtName} bölgesindeki ${count}+ pet kuaförünü karşılaştır. Fiyatlar, yorumlar ve online randevu. Köpek ve kedi kuaförü ${districtName}.`,
    
    // Open Graph
    openGraph: {
      title: `${districtName} Pet Kuaförleri`,
      description: `...`,
      images: [{ url: `/og/${city}/${district}.jpg` }],
    },
    
    // Canonical
    alternates: {
      canonical: `/pet-kuafor/${city}/${district}`,
    },
    
    // Yerel SEO
    other: {
      'geo.region': 'TR-34',
      'geo.placename': districtName,
    }
  }
}

// Structured Data (JSON-LD)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `${districtName} Pet Kuaförleri`,
  "itemListElement": businesses.map((b, i) => ({
    "@type": "LocalBusiness",
    "position": i + 1,
    "name": b.name,
    "address": { "@type": "PostalAddress", "addressLocality": b.district },
    "telephone": b.phone,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": b.avgRating,
      "reviewCount": b.reviewCount
    }
  }))
}
```

### 3.3 Sitemap Stratejisi

```
/sitemap.xml                 → Index sitemap
/sitemap-cities.xml          → Şehir sayfaları
/sitemap-districts.xml       → İlçe sayfaları
/sitemap-businesses.xml      → İşletme profilleri (dinamik)
/sitemap-blog.xml            → Blog içerikleri
```

### 3.4 İçerik SEO Stratejisi

Her şehir/ilçe sayfasında otomatik üretilen SEO içeriği:
- "Kadıköy'de X pet kuaförü bulunmaktadır"
- Ortalama fiyat bilgisi
- En çok tercih edilen hizmetler
- SSS bölümü (FAQ Schema)
- Yakın ilçe linkleri (internal linking)

---

## 4. GOOGLE MAPS API — TEK SEFERLİK VERİ ÇEKME

### 4.1 Seed Script Stratejisi

```typescript
// scripts/seed-google-maps.ts
// Bu script SADECE bir kez çalıştırılacak

const TÜRKIYE_ILLER = [
  { city: "istanbul", districts: ["kadikoy", "besiktas", "sisli", ...] },
  { city: "ankara", districts: ["cankaya", "kecioren", ...] },
  // tüm 81 il
];

async function seedFromGoogleMaps() {
  for (const il of TÜRKIYE_ILLER) {
    for (const ilce of il.districts) {
      // Google Places Text Search API
      const results = await googlePlaces.textSearch({
        query: `pet kuaför ${ilce} ${il.city}`,
        language: 'tr',
        region: 'tr',
      });
      
      for (const place of results) {
        // Place Details API ile detay çek
        const details = await googlePlaces.getDetails({
          placeId: place.place_id,
          fields: ['name', 'formatted_address', 'formatted_phone_number', 
                   'website', 'opening_hours', 'rating', 'geometry',
                   'photos', 'reviews', 'types']
        });
        
        // Duplicate kontrolü
        const exists = await db.business.findUnique({
          where: { googlePlaceId: place.place_id }
        });
        
        if (!exists) {
          await db.business.create({
            data: {
              googlePlaceId: place.place_id,
              name: details.name,
              address: details.formatted_address,
              city: il.city,
              district: ilce,
              phone: details.formatted_phone_number,
              website: details.website,
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
              slug: generateSlug(details.name, ilce),
              plan: 'FREE',
            }
          });
        }
      }
      
      // Rate limiting — Google API kotasına dikkat
      await sleep(200);
    }
  }
}
```

### 4.2 Sonraki Güncellemeler

- Google Maps API'yi sadece seed için kullan
- Sonraki tüm okumalar database'den
- İşletme sahipleri kendi verilerini güncelleyebilir
- Yeni işletme ekleme: Admin panelinden manuel + otomatik keşif sistemi

---

## 5. KULLANICI ROLLERİ & YETKİLENDİRME

### 5.1 Rol Hiyerarşisi

```
ADMIN
  └── BUSINESS_OWNER (İşletme Sahibi)
  └── PET_OWNER (Pet Sahibi)
  └── GUEST (Kayıtsız Ziyaretçi)
```

### 5.2 Yetki Matrisi

| Özellik | Guest | Pet Owner | Business Owner | Admin |
|---------|-------|-----------|----------------|-------|
| Listeleme görüntüleme | ✅ | ✅ | ✅ | ✅ |
| İşletme profili görme | ✅ | ✅ | ✅ | ✅ |
| Randevu alma | ❌ | ✅ | ❌ | ✅ |
| Pet profili oluşturma | ❌ | ✅ | ❌ | ✅ |
| Profil düzenleme | ❌ | ❌ | ✅ (kendi) | ✅ |
| Randevu yönetimi | ❌ | ❌ | ✅ (kendi) | ✅ |
| CRM erişimi | ❌ | ❌ | ✅ (Premium) | ✅ |
| Kampanya oluşturma | ❌ | ❌ | ✅ (Enterprise) | ✅ |
| Tüm sistem yönetimi | ❌ | ❌ | ❌ | ✅ |

---

## 6. SAYFA MİMARİSİ & KULLANICI DENEYİMİ

### 6.1 Anasayfa (`/`)

**Hero Bölümü:**
- Büyük arama kutusu (merkezi, dikkat çekici)
- Placeholder: "Şehir veya ilçe ara... / Pet cinsi ara..."
- Altında hızlı filtreler: 🐕 Köpek | 🐈 Kedi | 🐇 Tavşan | 🐦 Kuş

**Arama Mantığı:**
```
Kullanıcı "Kadıköy" yazar → konum bazlı sonuçlar (rating'e göre sıralı)
Kullanıcı "Golden Retriever" yazar → o cinse hizmet veren kuaförler
Kullanıcı "Kedi banyo Beşiktaş" yazar → kombine arama
```

**Anasayfa Bölümleri (aşağı kaydırma):**
1. 📍 Popüler Şehirler (İstanbul, Ankara, İzmir, Bursa...)
2. ⭐ Öne Çıkan İşletmeler (Premium + Featured)
3. 🔄 Son Hizmet Aldığınız Kuaför (Login kullanıcı için)
4. 📸 Müşteri Galerisi (Bakım öncesi/sonrası fotoğraflar)
5. 📝 Blog / Rehber İçerikleri
6. ❓ SSS

### 6.2 Listeleme Sayfası (`/pet-kuafor/[city]/[district]`)

**Layout:**
```
[Sol: Filtreler]          [Sağ: Sonuçlar + Harita]
─────────────────         ──────────────────────────
□ Hizmet Türü             [Harita Toggle]
  □ Banyo                 
  □ Makas                 [Sıralama: En İyi / Yakın / Premium]
  □ Tam Bakım             
  □ Tırnak Kesimi         ┌─────────────────────────┐
                          │ 🌟 PREMIUM - Paw Palace  │  ← Renkli border
□ Pet Türü                │ ⭐⭐⭐⭐⭐ (127 yorum)   │
  □ Köpek                 │ Kadıköy, Moda           │
  □ Kedi                  │ 📞 0216 xxx xxxx        │
  □ Diğer                 │ [Randevu Al] [Profil]   │
                          └─────────────────────────┘
□ Fiyat Aralığı           
  ○ ₺0 - ₺200             ┌─────────────────────────┐
  ○ ₺200 - ₺400           │ PetStyle Kuaför          │  ← Normal kart
  ○ ₺400+                 │ ⭐⭐⭐⭐ (43 yorum)      │
                          │ Kadıköy, Fenerbahçe     │
□ Puan                    │ [Profil Gör]            │
  □ 4+ yıldız             └─────────────────────────┘
  □ 3+ yıldız             
                          [Daha Fazla Yükle]
[Filtreleri Temizle]      
```

**Listeleme Sıralaması Algoritması:**
```
Score = (plan_weight × 40) + (rating × 30) + (review_count × 20) + (ad_bid × 10)

plan_weight:
  ENTERPRISE = 4
  PREMIUM    = 3
  BASIC      = 2
  FREE       = 1

+ Konum önceliği (kullanıcının konumuna yakınlık)
```

### 6.3 İşletme Profil Sayfası

**URL:** `/pet-kuafor/istanbul/kadikoy/pawsome-pet-salon`

**Bölümler:**
```
[Cover Fotoğraf]
[Logo] [İşletme Adı] [Puan] [Plan Rozeti]
[Adres] [Telefon] [Website] [Çalışma Saatleri]

[Randevu Al Butonu] ← Sadece Premium+ için aktif

Sekmeler:
├── 📋 Hizmetler & Fiyatlar
├── 📸 Galeri (Bakım öncesi/sonrası)
├── ⭐ Yorumlar
├── 📍 Konum & Ulaşım
└── ℹ️ Hakkında
```

**Bakım Öncesi/Sonrası Galerisi:**
```
[Sol: Önce]  [Sağ: Sonra]   ← Slider ile karşılaştırma
```

**Schema Markup (İşletme sayfası):**
```json
{
  "@type": "LocalBusiness",
  "@id": "https://petpati.com/pet-kuafor/istanbul/kadikoy/pawsome",
  "name": "Pawsome Pet Salon",
  "priceRange": "₺₺",
  "servesCuisine": ["Köpek Bakımı", "Kedi Bakımı"],
  "hasOfferCatalog": { ... },
  "aggregateRating": { ... },
  "review": [ ... ],
  "openingHoursSpecification": [ ... ]
}
```

---

## 7. BUSINESS OWNER PANELİ (CMS)

**URL:** `/dashboard` (auth gerekli, BUSINESS_OWNER rolü)

### 7.1 Dashboard Ana Sayfa

```
┌────────────────────────────────────────────────────────┐
│ 👋 Merhaba, Pawsome Pet Salon                          │
│                                                        │
│ [📅 Bugün: 8 randevu] [⏳ Bekleyen: 3] [💰 Bakiye: ₺250] │
└────────────────────────────────────────────────────────┘

[Randevu Takvimi]    [Hızlı İstatistikler]
  Pazartesi            Bu Ay: 47 randevu
  ├─ 09:00 Buddy K. → Tam Bakım ✅   Ort. Puan: 4.8⭐
  ├─ 11:00 Luna T. → Banyo 🔄        Yorum: 12 yeni
  ├─ 14:00 Max B. → Makas ⏰         Kazanç: ₺2,840
  └─ [+ Manuel Randevu Ekle]
```

### 7.2 Randevu Yönetimi

**Gelen Talepler (PENDING):**
```
┌─────────────────────────────────────────────────────┐
│ 🔔 Yeni Talep — 10 dakika önce                      │
│                                                     │
│ 👤 Ayşe Yılmaz          🐕 Golden Retriever "Max"  │
│ 📅 Yarın, Sal 14:00     ⏱ Tam Bakım (~90 dk)       │
│ 📝 "Max biraz heyecanlı olabiliyor, dikkatli olun"  │
│                                                     │
│ [Pet Kartını Gör]  [✅ Onayla]  [❌ Reddet]        │
└─────────────────────────────────────────────────────┘
```

**Aktif Randevu Ekranı:**
```
┌─────────────────────────────────────────────────────┐
│ 🔄 Şu An Bakımda: Luna - British Shorthair          │
│ Sahip: Mehmet Demir  |  Başlangıç: 11:00            │
│                                                     │
│ [⏰ 30 dk kala bildirim gönder]                     │
│ [✂️ Bakım Bitti] → Fotoğraf yükleme ekranı açılır  │
└─────────────────────────────────────────────────────┘
```

**Bakım Bitti Ekranı:**
```
Bakım tamamlandı! 🎉

[Fotoğraf Yükle]
  ┌──────────────┐ ┌──────────────┐
  │  Bakım Önce  │ │  Bakım Sonra │
  │  [+ Ekle]    │ │  [+ Ekle]    │
  └──────────────┘ └──────────────┘

[Not ekle...]

[Pet Sahibine Bildirim Gönder] → "Petiniz hazır! 🐾"
[Kaydet & Tamamla]
```

### 7.3 Müşteri CRM (Pet Kartları)

```
Arama: [________________] 🔍

┌──────────────────────────────────────────────────────┐
│ 🐕 Max — Golden Retriever, 3 yaş                    │
│ 👤 Sahip: Ayşe Yılmaz  📞 0532 xxx xxxx             │
│                                                      │
│ Son Ziyaret: 15.01.2025 — Tam Bakım                  │
│ Toplam Ziyaret: 8  |  No-Show: 1 ⚠️                 │
│                                                      │
│ 📝 Kuaför Notları:                                   │
│ "Max makasdan korkuyor, müzikle yatıştırılabilir"   │
│ "Sol kulağı hassas, dikkatli ol"                     │
│                                                      │
│ 🖼️ Geçmiş Kesimler: [📸][📸][📸] → Galeri          │
│                                                      │
│ [Not Ekle]  [Randevu Oluştur]                        │
└──────────────────────────────────────────────────────┘
```

### 7.4 Profil Düzenleme (CMS)

**Sekmeler:**
- **Temel Bilgiler:** İsim, açıklama, telefon, web, sosyal medya
- **Fotoğraflar:** Logo, kapak, galeri yönetimi (drag & drop)
- **Hizmetler:** Hizmet ekle/düzenle/sil (fiyat, süre, pet türü)
- **Çalışma Saatleri:** Günlük açılış/kapanış saatleri
- **Premium:** Plan yükseltme, reklam bakiyesi yönetimi

### 7.5 Reklam & Kampanya Yönetimi (Enterprise)

```
Reklam Bakiyem: ₺250 [Bakiye Yükle]

Aktif Kampanyalar:
┌─────────────────────────────────────────────────────┐
│ "Bahar Bakım Kampanyası" 🌸                         │
│ Hedef: Kadıköy, Üsküdar  |  Köpek Sahipleri        │
│ Bütçe: ₺100  |  Harcanan: ₺67  |  Gösterim: 1,240  │
│ Süre: 01.03 — 31.03.2025                            │
│ [Düzenle]  [Durdur]                                 │
└─────────────────────────────────────────────────────┘

[+ Yeni Kampanya Oluştur]
```

### 7.6 No-Show Yönetimi

```
⚠️ No-Show Listesi

Mehmet Yılmaz — 3 no-show
  Son: 10.01.2025 (Tam Bakım)
  [⛔ Kara Listeye Al]  [📞 Ara]  [Affet]

Zeynep K. — 1 no-show
  Son: 05.01.2025 (Banyo)
  [İşaretle]  [Affet]
```

---

## 8. PET SAHİBİ PANELI

**URL:** `/hesabim` (auth gerekli, PET_OWNER rolü)

### 8.1 Bölümler

**Pet Profillerim:**
```
[+ Yeni Pet Ekle]

┌─────────────────────────────────┐
│ 🐕 Max — Golden Retriever       │
│ 3 yaş | 28 kg                  │
│ Son Bakım: 15.01.2025           │
│ [Profili Görüntüle]             │
└─────────────────────────────────┘
```

**Dijital Pet Kartı:**
- Fotoğraf
- Aşı takvimi (hatırlatıcılar)
- Bakım geçmişi (hangi kuaförde, ne zaman, ne yapıldı)
- Özel sağlık notları

**Randevularım:**
- Bekleyen / Yaklaşan / Geçmiş
- Randevu detayları + fotoğraflar

**Bildirim Merkezi:**
- Randevu onay/red
- Bakım bitti bildirimleri
- Kampanya teklifleri
- Aşı hatırlatıcıları

---

## 9. ADMIN PANELİ

**URL:** `/admin` (ADMIN rolü, IP whitelist + 2FA zorunlu)

### 9.1 Genel Bakış Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ 📊 Platform Genel Durumu                                     │
│                                                              │
│ 🏪 Toplam İşletme: 12,847   ├─ Premium: 1,243               │
│ 👥 Toplam Kullanıcı: 87,432  ├─ Aktif: 34,211               │
│ 📅 Bu Ay Randevu: 8,941      ├─ Tamamlanan: 7,832            │
│ 💰 Bu Ay Gelir: ₺245,600                                     │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Admin Modülleri

**İşletme Yönetimi:**
- Tüm işletmeleri listele, filtrele, ara
- İşletme onayı / askıya alma
- Plan değiştirme
- Öne çıkarma (featured) yönetimi
- Google Maps'ten yeni işletme çekme (manuel trigger)

**Kullanıcı Yönetimi:**
- Tüm kullanıcılar
- Rol değiştirme
- Hesap askıya alma/silme
- Login geçmişi

**İçerik Yönetimi:**
- SEO metinleri düzenleme
- Blog yazıları
- Şehir/ilçe sayfa içerikleri

**Finansal Yönetim:**
- Ödeme geçmişi
- Plan değişiklikleri
- Reklam bakiyesi hareketleri
- Gelir raporları

**SEO & Teknik:**
- Sitemap yenileme
- Structured data önizleme
- Indexleme durumu

**Sistem Ayarları:**
- Plan fiyatları
- Özellik flag'leri
- Bildirim şablonları
- API anahtarları yönetimi

---

## 10. PRİCİNG & GELİR MODELİ

### 10.1 Plan Karşılaştırması

| Özellik | FREE | BASIC (₺299/ay) | PREMIUM (₺599/ay) | ENTERPRISE (₺1499/ay) |
|---------|------|-----------------|-------------------|----------------------|
| Temel profil | ✅ | ✅ | ✅ | ✅ |
| Profil düzenleme | ❌ | ✅ | ✅ | ✅ |
| Fotoğraf galerisi | ❌ | 10 foto | Sınırsız | Sınırsız |
| Online randevu | ❌ | ❌ | ✅ | ✅ |
| Müşteri CRM | ❌ | ❌ | ✅ | ✅ |
| Öne çıkarma | ❌ | ❌ | ✅ | ✅ |
| Kampanya yönetimi | ❌ | ❌ | ❌ | ✅ |
| Reklam bakiyesi | ❌ | ❌ | ❌ | ✅ |
| No-show takibi | ❌ | ❌ | ✅ | ✅ |
| Bakım sonrası galeri | ❌ | ❌ | ✅ | ✅ |
| Analytics | ❌ | Temel | Gelişmiş | Tam |
| Destek | ❌ | Email | Öncelikli | Özel destek |

### 10.2 Ek Gelir Akışları

- **Reklam Bakiyesi:** Min ₺50 yükleme, CPC/CPM bazlı
- **Featured Listeleme:** Günlük/haftalık öne çıkma paketi
- **Yıllık Planlar:** %20 indirim
- **Setup Fee:** Onboarding paketi (opsiyonel) ₺499

---

## 11. BİLDİRİM SİSTEMİ

### 11.1 Bildirim Türleri

```
PET SAHİBİ BİLDİRİMLERİ:
├── APPOINTMENT_CONFIRMED    → Randevunuz onaylandı
├── APPOINTMENT_REJECTED     → Randevunuz reddedildi
├── APPOINTMENT_REMINDER     → Yarın randevunuz var
├── GROOMING_COMPLETED       → Petiniz hazır!
├── VACCINE_DUE              → Max'ın aşısı yaklaşıyor
└── CAMPAIGN_OFFER           → Bölgenizde kampanya var

KUAFÖR BİLDİRİMLERİ:
├── NEW_APPOINTMENT_REQUEST  → Yeni randevu talebi
├── APPOINTMENT_CANCELLED    → Randevu iptal edildi
└── REVIEW_RECEIVED          → Yeni yorum geldi
```

### 11.2 Bildirim Kanalları

- **Web Push** (PWA)
- **Email** (Resend + React Email şablonları)
- **SMS** (Netgsm entegrasyonu — Türkiye)
- **In-App** (uygulama içi bildirim merkezi)
- **Mobile Push** (Firebase — Faz 3)

---

## 12. PERFORMANS & ÖLÇEKLENEBİLİRLİK

### 12.1 Caching Stratejisi

```
Statik sayfalar (SSG):
├── / (anasayfa)                           → Revalidate: 1 saat
├── /pet-kuafor (genel liste)              → Revalidate: 6 saat
├── /pet-kuafor/istanbul                   → Revalidate: 6 saat

Dinamik sayfalar (ISR):
├── /pet-kuafor/istanbul/kadikoy           → Revalidate: 30 dk
├── /pet-kuafor/istanbul/kadikoy/[slug]    → Revalidate: 15 dk

Redis Cache:
├── Arama sonuçları                        → TTL: 5 dk
├── İşletme temel verisi                   → TTL: 1 saat
└── Şehir/ilçe listeleri                   → TTL: 24 saat
```

### 12.2 Görsel Optimizasyon

- Next.js Image component (WebP/AVIF otomatik dönüşüm)
- Cloudflare R2 + CDN edge cache
- Lazy loading + placeholder blur
- Bakım fotoğrafları için thumbnail üretimi

### 12.3 Database Optimizasyon

```sql
-- Kritik indexler
CREATE INDEX idx_business_city_district ON businesses(city, district);
CREATE INDEX idx_business_plan_score ON businesses(plan, featured_score DESC);
CREATE INDEX idx_business_location ON businesses USING GIST(point(lng, lat));
CREATE INDEX idx_appointments_date ON appointments(business_id, date);
CREATE INDEX idx_reviews_business ON reviews(business_id, rating);
```

---

## 13. GÜVENLİK

### 13.1 Güvenlik Katmanları

- **Auth:** NextAuth.js + JWT (httpOnly cookies)
- **API Rate Limiting:** Redis tabanlı, IP + user bazlı
- **CSRF:** SameSite cookie + CSRF token
- **Input Validation:** Zod schema validation (her endpoint)
- **SQL Injection:** Prisma ORM (parametrik sorgular)
- **XSS:** Next.js otomatik escaping + Content Security Policy
- **Admin Güvenliği:** IP whitelist + TOTP 2FA
- **Dosya Yükleme:** Tip kontrolü + boyut sınırı + virüs tarama

### 13.2 KVKK & GDPR Uyumluluğu

- Kullanıcı verisi silme (hesap silme)
- Veri dışa aktarma (JSON export)
- Cookie consent banner
- Gizlilik politikası sayfası
- Pet verisi sadece işletme sahibine görünür

---

## 14. GENIŞLEME STRATEJİSİ

### 14.1 Yeni Kategori Ekleme

Altyapı bu adımları otomatik destekler:

```typescript
// categories.config.ts dosyasına yeni kategori ekle
export const CATEGORIES = [
  {
    slug: 'pet-kuafor',
    name: 'Pet Kuaförler',
    icon: '✂️',
    searchKeywords: ['pet kuaför', 'köpek kuaför', 'kedi kuaför'],
    active: true,
  },
  {
    slug: 'veteriner',
    name: 'Veteriner Klinikleri', 
    icon: '🏥',
    searchKeywords: ['veteriner', 'hayvan hastanesi'],
    active: false, // Faz 4'te aktif
  },
  {
    slug: 'guzellik-merkezi',
    name: 'Güzellik Merkezleri',
    icon: '💅',
    searchKeywords: ['güzellik salonu', 'kuaför'],
    active: false,
  }
]
```

URL yapısı otomatik oluşur: `/veteriner/istanbul/kadikoy`

### 14.2 Mobil Uygulama (Faz 3)

- **React Native + Expo** — kod paylaşımı maksimum
- **Expo Router** — web ile URL uyumu
- **Offline support** — randevu detayları offline görünür
- App Store + Google Play

---

## 15. GELİŞTİRME TAKVIMI

### Faz 1 — MVP (6-8 Hafta)

**Hafta 1-2:**
- [ ] Proje setup (monorepo, CI/CD, Vercel deploy)
- [ ] Database schema + Prisma migrations
- [ ] NextAuth.js auth sistemi
- [ ] Google Maps seed scripti

**Hafta 3-4:**
- [ ] Anasayfa + arama
- [ ] Listeleme sayfaları (şehir/ilçe)
- [ ] İşletme profil sayfası
- [ ] SEO altyapısı (metadata, structured data, sitemap)

**Hafta 5-6:**
- [ ] Business Owner paneli (profil düzenleme)
- [ ] Admin paneli (temel)
- [ ] Ödeme entegrasyonu (İyzico)
- [ ] Email bildirimleri

**Hafta 7-8:**
- [ ] Test & bug fix
- [ ] Performance optimizasyonu
- [ ] SEO kontrol & iyileştirme
- [ ] Beta yayın (İstanbul)

### Faz 2 — Randevu Sistemi (4-6 Hafta)

- [ ] Randevu alma akışı
- [ ] Kuaför takvimi
- [ ] No-show takibi
- [ ] Müşteri CRM
- [ ] Bakım öncesi/sonrası galeri
- [ ] Push bildirimler (web)

### Faz 3 — Mobil + Kampanya (8-10 Hafta)

- [ ] React Native mobil uygulama
- [ ] Firebase push notifications
- [ ] Kampanya yönetimi
- [ ] Reklam bakiyesi sistemi
- [ ] Analytics dashboard

### Faz 4 — Genişleme

- [ ] Yeni kategoriler (veteriner, güzellik merkezi)
- [ ] Türkiye geneli tam kapsama
- [ ] API (3. parti entegrasyon)

---

## 16. PROJE KLASÖRLERİ — DETAYLI

```
apps/web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Anasayfa
│   │   ├── [category]/
│   │   │   ├── page.tsx                # /pet-kuafor
│   │   │   ├── [city]/
│   │   │   │   ├── page.tsx            # /pet-kuafor/istanbul
│   │   │   │   └── [district]/
│   │   │   │       ├── page.tsx        # /pet-kuafor/istanbul/kadikoy
│   │   │   │       └── [slug]/
│   │   │   │           └── page.tsx    # İşletme profili
│   │   ├── arama/page.tsx
│   │   └── blog/
│   │
│   ├── (auth)/
│   │   ├── giris/page.tsx
│   │   └── kayit/page.tsx
│   │
│   ├── dashboard/                       # Business Owner paneli
│   │   ├── page.tsx
│   │   ├── randevular/
│   │   ├── musteriler/
│   │   ├── profil/
│   │   ├── kampanyalar/
│   │   └── ayarlar/
│   │
│   ├── hesabim/                         # Pet Owner paneli
│   │   ├── page.tsx
│   │   ├── petlerim/
│   │   ├── randevularim/
│   │   └── bildirimler/
│   │
│   ├── admin/                           # Admin paneli
│   │   ├── page.tsx
│   │   ├── isletmeler/
│   │   ├── kullanicilar/
│   │   ├── icerik/
│   │   ├── finans/
│   │   └── sistem/
│   │
│   └── api/
│       ├── auth/
│       ├── businesses/
│       ├── appointments/
│       ├── reviews/
│       ├── pets/
│       ├── notifications/
│       ├── payments/
│       └── admin/
│
├── components/
│   ├── ui/                              # shadcn bileşenleri
│   ├── business/                        # İşletme kartları, profil
│   ├── search/                          # Arama bileşenleri
│   ├── appointment/                     # Randevu bileşenleri
│   ├── pet/                             # Pet profil bileşenleri
│   ├── map/                             # Harita bileşenleri
│   └── layout/                          # Header, Footer, Nav
│
├── lib/
│   ├── auth.ts                          # NextAuth config
│   ├── db.ts                            # Prisma client
│   ├── redis.ts                         # Upstash Redis
│   ├── google-maps.ts                   # Maps API wrapper
│   ├── slug.ts                          # URL slug üretici
│   ├── seo.ts                           # SEO helper fonksiyonlar
│   └── notifications.ts                 # Bildirim gönderici
│
└── middleware.ts                        # Auth + rate limiting
```

---

## 17. TEMEL PERFORMANS HEDEFLERİ (KPIs)

### Teknik KPIs
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Core Web Vitals:** Tümü yeşil
- **PageSpeed (Mobile):** 90+
- **TTFB:** < 200ms (CDN'den)

### SEO KPIs (6. Ay)
- "[ilçe] pet kuaför" aramalarında ilk 3 sonuç
- Google Search Console: 10,000+ impression/gün
- 1,000+ indexlenmiş sayfa
- Backlink: 100+ kaliteli domain

### İş KPIs (12. Ay)
- 5,000+ kayıtlı işletme
- 500+ premium işletme
- 10,000+ aktif kullanıcı
- MRR: ₺150,000+

---

*Bu doküman PetPati platformunun v1.0 proje spesifikasyonudur. Tüm teknik kararlar bu dokümana dayanarak alınacaktır.*
*Son güncelleme: Şubat 2025*
