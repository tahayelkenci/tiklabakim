# PetPati — Proje Rehberi (LLM için)

Bu dosya, PetPati projesini sıfırdan anlayan bir LLM'nin doğru ve hızlı çalışabilmesi için hazırlanmıştır.

---

## Proje Nedir?

**PetPati** — Türkiye'nin pet kuaför listeleme ve randevu SaaS platformu.
Pet sahipleri yakınlarındaki pet kuaförleri bulur, randevu alır.
İşletme sahipleri profillerini yönetir, randevu ve müşteri takibi yapar.
Admin platform genelini yönetir.

Blog özelliği **kasıtlı olarak** dışarıda bırakılmıştır.

---

## Tech Stack

| Katman | Teknoloji | Not |
|--------|-----------|-----|
| Framework | Next.js 14 (App Router) | `output: 'standalone'` cPanel için |
| Veritabanı | **Yerel:** SQLite / **Prod:** MySQL | Çift schema stratejisi |
| ORM | Prisma 5 | |
| Auth | NextAuth.js v5 beta (JWT) | `next-auth@5.0.0-beta.25` |
| Stil | Tailwind CSS + manuel shadcn/ui | Radix UI primitives |
| Email | Nodemailer + SMTP | |
| Upload | Yerel dosya sistemi (`public/uploads/`) | |
| Arama | MySQL FULLTEXT / SQLite LIKE | |
| Deploy | cPanel Node.js App + PM2 + Apache proxy | |

---

## Dizin Yapısı

```
PET-KUAFOR/
├── app/
│   ├── (auth)/
│   │   ├── giris/page.tsx          # Giriş sayfası
│   │   └── kayit/page.tsx          # Kayıt sayfası (rol seçimi var)
│   ├── (public)/
│   │   ├── layout.tsx              # Header + Footer wrapper
│   │   ├── page.tsx                # Anasayfa
│   │   ├── arama/page.tsx          # Arama sonuçları
│   │   └── pet-kuafor/
│   │       ├── page.tsx            # Türkiye geneli liste
│   │       ├── [city]/page.tsx     # Şehir sayfası
│   │       ├── [city]/[district]/page.tsx   # İlçe + filtreler
│   │       └── [city]/[district]/[slug]/page.tsx  # İşletme profili
│   ├── dashboard/                  # Business Owner paneli
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Genel bakış
│   │   ├── randevular/page.tsx     # Randevu yönetimi
│   │   ├── musteriler/page.tsx     # Müşteri CRM
│   │   └── profil/page.tsx         # Profil & hizmetler & çalışma saatleri
│   ├── hesabim/                    # Pet Owner paneli
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Genel bakış
│   │   ├── petlerim/page.tsx       # Pet listesi
│   │   ├── petlerim/yeni/page.tsx  # Yeni pet ekleme
│   │   ├── randevularim/page.tsx   # Randevularım
│   │   └── bildirimler/page.tsx    # Bildirimler
│   ├── admin/                      # Admin paneli
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Platform istatistikleri
│   │   └── isletmeler/page.tsx     # İşletme yönetimi tablosu
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── users/register/route.ts
│   │   ├── businesses/route.ts + [id]/route.ts
│   │   ├── appointments/route.ts + [id]/route.ts
│   │   ├── pets/route.ts
│   │   ├── reviews/route.ts
│   │   ├── notifications/route.ts
│   │   ├── upload/route.ts
│   │   ├── search/route.ts
│   │   ├── dashboard/
│   │   │   ├── business/route.ts
│   │   │   ├── services/route.ts + [id]/route.ts
│   │   │   ├── working-hours/route.ts
│   │   │   └── customers/route.ts
│   │   └── admin/businesses/[id]/route.ts
│   ├── layout.tsx                  # Root layout (SessionProvider, Toaster, Inter)
│   ├── globals.css
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                         # button, input, badge, card, toast, toaster, use-toast
│   ├── layout/                     # header, footer, auth-provider, sign-out-button
│   ├── business/                   # business-card, business-filters
│   ├── search/                     # search-box (debounced)
│   ├── appointment/                # appointment-modal
│   └── admin/                      # admin-business-actions
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── db.ts                       # Prisma singleton
│   ├── utils.ts                    # formatPrice, formatDate, getPlanColor, vb.
│   ├── slug.ts                     # Türkçe slug + CITY_NAMES haritası
│   ├── email.ts                    # Nodemailer şablonları
│   ├── upload.ts                   # Yerel dosya yükleme
│   └── notifications.ts            # DB bildirimleri + email tetikleyici
├── prisma/
│   ├── schema.prisma               # SQLite (yerel dev) — AKTİF OLAN
│   ├── schema.mysql.prisma         # MySQL (production) — YEDEK
│   └── prisma/dev.db               # Gerçek SQLite DB buradadır (iç içe dizin!)
├── scripts/
│   └── seed.ts                     # Admin + örnek veri ekleme
├── middleware.ts                   # Auth guard + rol yönlendirme
├── next.config.js
├── tailwind.config.ts              # Marka renkleri: orange #FF6B35, teal #2EC4B6
├── package.json
├── tsconfig.json                   # Path alias: @/* → ./*
├── tsconfig.seed.json              # CommonJS (ts-node için)
├── ecosystem.config.js             # PM2 config
├── .htaccess                       # Apache → Node.js proxy
├── .env                            # Prisma CLI okur (DATABASE_URL burada)
├── .env.local                      # Next.js okur (DATABASE_URL burada, .env'i override eder)
├── .env.example                    # Tüm env değişkenleri dokümante
└── CPANEL-KURULUM.md               # cPanel deployment rehberi
```

---

## Kullanıcı Rolleri

| Rol | Giriş sonrası yönlendirme | Erişim |
|-----|--------------------------|--------|
| `PET_OWNER` | `/hesabim` | Pet yönetimi, randevu alma |
| `BUSINESS_OWNER` | `/dashboard` | İşletme, randevu, müşteri, profil |
| `ADMIN` | `/admin` | Platform yönetimi |

Middleware (`middleware.ts`) rol kontrolünü yapar. BUSINESS_OWNER olmayan biri `/dashboard`'a gitmeye çalışırsa `/hesabim`'e yönlenir.

---

## Veritabanı — Kritik Not: Çift Schema Stratejisi

### Yerel Geliştirme → SQLite
- **Aktif schema:** `prisma/schema.prisma` (provider: sqlite)
- **Veritabanı dosyası:** `prisma/prisma/dev.db` ← **iç içe dizinde!**
- Bu iç içe yapı Prisma'nın SQLite URL'yi schema dosyasına göreli çözümlemesinden kaynaklanır.
  - `.env`'de `DATABASE_URL="file:./prisma/dev.db"` yazıyor
  - Prisma CLI bunu `prisma/schema.prisma`'ya göreli çözümler → `prisma/prisma/dev.db`
  - `.env.local`'de de aynı değer olmalı (`file:./prisma/dev.db`)

### Production → MySQL
- **Yedek schema:** `prisma/schema.mysql.prisma`
- Canlıya geçişte: `schema.mysql.prisma` → `schema.prisma` olarak kopyalanır
- MySQL şemasında `@db.VarChar`, `@db.Text`, `@db.Decimal`, `@@fulltext`, enum tipler var
- SQLite şemasında bunlar yok: enum yerine `String`, `Decimal` yerine `Float`, `Json?` yerine `String?`

### SQLite vs MySQL farkları (önemli!)
| MySQL schema | SQLite schema | Neden |
|---|---|---|
| `enum Role { ... }` | `String @default("PET_OWNER")` | SQLite enum desteklemiyor |
| `Decimal` | `Float` | SQLite Decimal yok |
| `Json?` | `String?` | SQLite JSON yok → JSON.stringify/parse gerekir |
| `@db.VarChar(255)` | kaldırıldı | SQLite type annotations yok |
| `@@fulltext([name, ...])` | kaldırıldı | SQLite FULLTEXT yok |

**`Json?` alanı kullanan kod (`lib/notifications.ts`):**
```typescript
data: params.data ? JSON.stringify(params.data) : null
// Okurken: JSON.parse(notification.data) gerekir
```

---

## Önemli Env Değişkenleri

`.env` — Prisma CLI tarafından okunur:
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="petpati-local-secret-key-change-in-production-2024"
```

`.env.local` — Next.js runtime tarafından okunur (`.env`'i override eder):
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="petpati-local-secret-key-change-in-production-2024"
```

**İkisi de aynı DATABASE_URL'yi içermeli.** Farklı olursa app boş DB'ye bağlanır.

---

## Geliştirme Ortamını Kurma

```bash
cd /Users/t53/Desktop/PET-KUAFOR

# 1. Bağımlılıkları kur
npm install

# 2. SQLite veritabanını oluştur (prisma/prisma/dev.db oluşur)
npx prisma db push

# 3. Admin + örnek veri ekle
npm run db:seed
# Admin: admin@petpati.com / Admin123!
# 3 örnek işletme: Kadıköy, Beşiktaş, Şişli

# 4. Dev server'ı başlat
npm run dev
# http://localhost:3000
```

### Sıfırdan başlatmak (DB sıfırlama):
```bash
rm -rf prisma/prisma/dev.db prisma/dev.db
npx prisma db push
npm run db:seed
npm run dev
```

---

## Seed Verileri

`scripts/seed.ts` çalıştırıldığında:
- **Admin:** `admin@petpati.com` / `Admin123!` (rol: ADMIN)
- **İşletme 1:** Pawsome Pet Salon — Kadıköy/İstanbul (plan: PREMIUM)
- **İşletme 2:** PetStyle Kuaför — Beşiktaş/İstanbul (plan: BASIC)
- **İşletme 3:** Pati Pati Pet Spa — Şişli/İstanbul (plan: ENTERPRISE)

---

## Auth Sistemi

- **Kütüphane:** `next-auth@5.0.0-beta.25`
- **Strateji:** JWT (cookie tabanlı, Redis gerektirmez)
- **Adapter:** `@auth/prisma-adapter`
- **Oturum nesnesinde:** `id`, `email`, `name`, `role`, `image`
- **Config:** `lib/auth.ts`

**NextAuth v5 beta notları:**
- `declare module 'next-auth/jwt'` augmentation ÇALIŞMIYOR (modül yok) — auth.ts'de kaldırıldı
- Middleware'de `[auth][details]: {}` logları hata değil, JWT token bulunamadığında normal

---

## API Yapısı

| Endpoint | Metod | Amaç | Auth |
|----------|-------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler | - |
| `/api/users/register` | POST | Kayıt ol | - |
| `/api/businesses` | GET | Liste (filtreli) | - |
| `/api/businesses` | POST | Yeni işletme | BUSINESS_OWNER |
| `/api/businesses/[id]` | GET/PATCH | İşletme detay/güncelle | - / OWNER |
| `/api/appointments` | POST/GET | Randevu oluştur/listele | LOGIN |
| `/api/appointments/[id]` | PATCH/DELETE | Durum güncelle/iptal | LOGIN |
| `/api/pets` | GET/POST | Pet listesi/ekle | LOGIN |
| `/api/reviews` | POST | Yorum yaz | LOGIN |
| `/api/upload` | POST | Dosya yükle | LOGIN |
| `/api/notifications` | GET/PATCH | Bildirimler/okundu işaretle | LOGIN |
| `/api/search` | GET | Autocomplete önerileri | - |
| `/api/dashboard/business` | GET | Kendi işletmesi | BUSINESS_OWNER |
| `/api/dashboard/services` | POST | Hizmet ekle | BUSINESS_OWNER |
| `/api/dashboard/services/[id]` | PATCH/DELETE | Hizmet güncelle/sil | BUSINESS_OWNER |
| `/api/dashboard/working-hours` | POST | Çalışma saatleri kaydet | BUSINESS_OWNER |
| `/api/dashboard/customers` | GET | Müşteri CRM | BUSINESS_OWNER |
| `/api/admin/businesses/[id]` | PATCH | Admin işletme güncelle | ADMIN |

---

## Bilinen Sorunlar ve Çözümleri

### 1. `nodemailer` peer dependency
`next-auth@5.0.0-beta.25` artık `nodemailer@^7.0.7` istiyor. `package.json`'da bu sürüm var. Eski `^6.9.16` kullanmayın.

### 2. SQLite `Json?` alanı
`Notification.data` alanı MySQL'de `Json?`, SQLite'ta `String?`. Kaydederken `JSON.stringify`, okurken `JSON.parse` kullanın. `lib/notifications.ts` bunu yapıyor.

### 3. Lucide icon `title` prop
Lucide ikonlara `title` prop verilmez (TypeScript hatası). Bunun yerine `aria-label` kullanın:
```tsx
<CheckCircle aria-label="Doğrulanmış İşletme" />
```

### 4. `next-auth/jwt` modül augmentation
NextAuth v5 beta'da bu modül yok. `lib/auth.ts`'de `declare module 'next-auth/jwt'` bloğu yoktur.

### 5. SQLite DB yanlış konumda oluşuyor
Prisma SQLite URL'yi `schema.prisma`'nın konumuna göre çözümler:
- Schema: `prisma/schema.prisma`
- URL: `file:./prisma/dev.db`
- Gerçek konum: `prisma/prisma/dev.db`

Oluşturulan `prisma/dev.db` 0 byte'sa boş/yanlış dosyadır. Gerçek veri `prisma/prisma/dev.db`'de.

---

## cPanel Production Deployment

Detaylı adımlar `CPANEL-KURULUM.md`'de. Kısa özet:

```bash
# 1. schema.mysql.prisma → schema.prisma olarak kopyala
cp prisma/schema.mysql.prisma prisma/schema.prisma

# 2. .env.local'i MySQL bilgileriyle oluştur
DATABASE_URL="mysql://USER:PASS@localhost:3306/DBNAME"
NEXTAUTH_URL="https://petpati.com"
NEXTAUTH_SECRET="güçlü-rastgele-anahtar"
SMTP_HOST="mail.petpati.com"
...

# 3. Bağımlılıkları kur ve veritabanını oluştur
npm install --production
npx prisma migrate deploy   # veya db push
npm run db:seed

# 4. Build
npm run build

# 5. .next/static ve public/ klasörlerini .next/standalone/'a kopyala
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# 6. cPanel → Node.js App → başlat (PM2 ile)
```

---

## Marka ve Tasarım

- **Ana renk (turuncu):** `#FF6B35` — `orange-500` class'ı Tailwind config'de override edilmiş
- **İkincil renk (teal):** `#2EC4B6`
- **Font:** Inter (Google Fonts)
- **Favicon/logo:** Henüz eklenmedi, `public/` altına eklenebilir

---

## Henüz Yazılmayan / Eksik Özellikler

Bu MVP'de aşağıdakiler **yoktur**:

- Blog (kasıtlı dışarıda)
- Ödeme entegrasyonu (iyzico/Stripe)
- Google Maps embed
- İşletme kampanya yönetimi UI (model var, API yok)
- Email doğrulama akışı (model var, flow yok)
- Şifre sıfırlama
- Admin: kullanıcı yönetimi sayfası (layout var, sayfa tam değil)
- Admin: finans/sistem sayfaları
- Rate limiting
- PWA

---

## Dosyaları Değiştirirken Dikkat

1. **`prisma/schema.prisma` değiştirilirse** → `npx prisma db push` (yerel) veya `npx prisma migrate deploy` (prod)
2. **`lib/auth.ts` değiştirilirse** → Session tipini de güncelle (`next-auth` modül augmentation `auth.ts` içindedir)
3. **`lib/notifications.ts`'e yeni `data` alanı eklenirse** → `JSON.stringify` eklemeyi unutma
4. **Yeni API route eklenirse** → Gerekirse `middleware.ts`'e koru
5. **Enum benzeri `String` alanlar** (role, plan, status) → Sadece izin verilen değerleri kabul eden server-side validation ekle
