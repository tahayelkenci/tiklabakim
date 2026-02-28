# Tıkla Bakım — cPanel Deployment Rehberi

## Mimari Özet

```
Local (Mac)                    Sunucu (cPanel)
─────────────────              ────────────────────────────
SQLite (dev.db)           →    MySQL (Production)
schema.prisma (SQLite)    →    schema.mysql.prisma (aktif)
npm run dev               →    PM2 + standalone build
```

---

## BÖLÜM 1 — İLK KURULUM (Bir kere yapılır)

### Adım 1: cPanel'de MySQL Veritabanı Oluştur

1. cPanel → **MySQL Databases**
2. **Create New Database** → `tiklabakim_db` (önüne cPanel prefix'i ekler, ör: `usr_tiklabakim_db`)
3. **MySQL Users** → **Add New User** → kullanıcı adı: `tiklabakim_user`, güçlü şifre girin
4. **Add User To Database** → `tiklabakim_user` + `tiklabakim_db` → **ALL PRIVILEGES**
5. Oluşan bilgileri not edin:
   - Host: `localhost`
   - Database: `usr_tiklabakim_db` *(cPanel prefix'li tam ad)*
   - User: `usr_tiklabakim_user`
   - Password: *girdiğiniz şifre*

### Adım 2: cPanel'de Node.js App Oluştur

1. cPanel → **Setup Node.js App**
2. **Create Application**:
   - Node.js version: `20.x` (veya mevcut en yüksek)
   - Application mode: `Production`
   - Application root: `tiklabakim`
   - Application URL: `tiklabakim.com` (veya subdomain)
   - Application startup file: `server.js` *(geçici, deploy sonrası değişecek)*
3. **Create** → Oluşturulan sayfada **"Enter to the virtual environment"** komutunu kopyalayın (SSH'da kullanacaksınız)

### Adım 3: cPanel E-posta Hesabı Oluştur

1. cPanel → **Email Accounts** → **Create**
2. `noreply@tiklabakim.com` oluşturun, şifre belirleyin
3. Bu bilgileri `.env`'e gireceksiniz

### Adım 4: SSH ile Sunucuya Bağlan

cPanel → **Terminal** veya Mac'ten:
```bash
ssh kullanici@tiklabakim.com
```

### Adım 5: Git Repository Kur

**Local (Mac'te):**
```bash
cd /Users/t53/Desktop/PET-KUAFOR

# Git başlat
git init
git add .
git commit -m "ilk commit: tikla bakim v1.0"

# GitHub'da yeni repo oluştur (private), sonra:
git remote add origin https://github.com/KULLANICI/tiklabakim.git
git push -u origin main
```

**Sunucuda (SSH):**
```bash
# Uygulama klasörüne git
cd ~/tiklabakim

# Mevcut dosyaları temizle (Node.js App otomatik oluşturmuş olabilir)
rm -rf *

# Repoyu klonla
git clone https://github.com/KULLANICI/tiklabakim.git .
```

### Adım 6: Sunucuda .env Dosyası Oluştur

```bash
cd ~/tiklabakim
nano .env
```

Aşağıdakileri girin (kendi bilgilerinizle):
```
DATABASE_URL="mysql://usr_tiklabakim_user:SIFRENIZ@localhost:3306/usr_tiklabakim_db"
NEXTAUTH_URL="https://tiklabakim.com"
NEXTAUTH_SECRET="openssl komutuyla urettiniz 32+ karakter"
SMTP_HOST="mail.tiklabakim.com"
SMTP_PORT="465"
SMTP_USER="noreply@tiklabakim.com"
SMTP_PASSWORD="email-sifreniz"
SMTP_FROM="Tıkla Bakım <noreply@tiklabakim.com>"
NEXT_PUBLIC_SITE_URL="https://tiklabakim.com"
NEXT_PUBLIC_SITE_NAME="Tıkla Bakım"
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880"
```

**NEXTAUTH_SECRET üretmek için:**
```bash
openssl rand -base64 32
```

`Ctrl+X → Y → Enter` ile kaydedin.

### Adım 7: İlk Deploy (deploy.sh çalıştır)

```bash
cd ~/tiklabakim
chmod +x deploy.sh
bash deploy.sh
```

Bu script şunları yapar:
- MySQL schema'yı aktif eder
- npm install
- prisma generate + db push (tabloları oluşturur)
- Next.js build
- PM2 başlatır

### Adım 8: Veritabanını Seed Et (Admin + İlk Veriler)

```bash
cd ~/tiklabakim

# Node.js sanal ortamı aktifleştir (cPanel'den kopyaladığınız komut)
source /home/kullanici/nodevenv/tiklabakim/20/bin/activate

# Seed çalıştır
npm run db:seed
```

**Oluşan varsayılan admin hesabı:**
- Email: `admin@tiklabakim.com`
- Şifre: `Admin123!`
- **İlk girişten sonra hemen şifre değiştirin!**

### Adım 9: cPanel Node.js App'i Güncelle

1. cPanel → **Setup Node.js App** → uygulamanıza tıklayın
2. **Application startup file** → `.next/standalone/server.js` yazın
3. **Save** → **Restart**

### Adım 10: Apache'yi Proxy Olarak Ayarla

cPanel → **File Manager** → `public_html` → `.htaccess`:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

Veya cPanel'in kendi **Proxy** ayarından `127.0.0.1:3000` ekleyin.

---

## BÖLÜM 2 — GÜNCELLEME (Her geliştirmeden sonra)

Local'de değişiklik yaptınız, sunucuya almak için:

**Local (Mac):**
```bash
cd /Users/t53/Desktop/PET-KUAFOR
git add .
git commit -m "güncelleme: yeni özellik açıklaması"
git push
```

**Sunucu (SSH):**
```bash
cd ~/tiklabakim
bash deploy.sh
```

**Bitti.** deploy.sh her seferinde:
1. `git pull` ile yeni kodu çeker
2. MySQL schema'yı aktif eder
3. npm install (yeni paket varsa)
4. prisma generate + db push (yeni tablo/kolon varsa)
5. Build alır
6. PM2'yi yeniden başlatır

---

## BÖLÜM 3 — TEST / STAGING ORTAMI

Gerçek veriyle test etmek için iki seçenek:

### Seçenek A: Sunucu DB'yi Local'e Bağla (En Pratik)

**Sunucuda önce remote bağlantıya izin ver:**
1. cPanel → **Remote MySQL** → Kendi IP'nizi ekleyin
   - IP'nizi öğrenmek: `curl ifconfig.me`

**Local'de `.env.local` oluştur:**
```
DATABASE_URL="mysql://usr_tiklabakim_user:SIFRE@tiklabakim.com:3306/usr_tiklabakim_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-secret-32-karakter"
# SMTP bilgileri gerçek olanlar
```

```bash
cd /Users/t53/Desktop/PET-KUAFOR
npm run dev
```

Artık local'de çalışan site **production veritabanını** okur. Gerçek işletmeler görünür.

> ⚠️ **Dikkat:** Üretim DB'sine yazma yapacaksanız dikkatli olun. Sadece okuma testleri için güvenlidir.

### Seçenek B: DB Dump → Local MySQL (Tam İzole Test)

**Sunucuda dump al:**
```bash
mysqldump -u usr_tiklabakim_user -p usr_tiklabakim_db > ~/backup_$(date +%Y%m%d).sql
```

**Local'e indir (Mac terminali):**
```bash
scp kullanici@tiklabakim.com:~/backup_20260228.sql ./
```

**Local MySQL'e yükle (MAMP/XAMPP veya Homebrew MySQL):**
```bash
mysql -u root -p tiklabakim_test < backup_20260228.sql
```

**`.env.local`:**
```
DATABASE_URL="mysql://root:root@localhost:3306/tiklabakim_test"
```

Bu yaklaşımla test ortamı tamamen izole — üretimi etkilemez.

### Seçenek C: Sunucuda Staging Alt Domain

1. cPanel → **Subdomains** → `test.tiklabakim.com` oluştur
2. Yeni bir MySQL DB oluştur: `usr_tiklabakim_test`
3. Yeni bir Node.js App oluştur: root = `tiklabakim-test`
4. `.env` dosyası → test DB'ye bağlı
5. `git clone` ile aynı repoyu kopyala, `test` branch kullan

Bu en profesyonel staging ortamıdır ama en fazla kaynak tüketir.

---

## BÖLÜM 4 — YEDEKLEME

### Otomatik DB Yedek (Cron Job)

cPanel → **Cron Jobs** → Her gece 02:00'de:
```
0 2 * * * mysqldump -u usr_tiklabakim_user -pSIFRE usr_tiklabakim_db > /home/kullanici/backups/tiklabakim_$(date +\%Y\%m\%d).sql
```

Eski yedekleri temizle (30 günden eski):
```
0 3 * * * find /home/kullanici/backups/ -name "*.sql" -mtime +30 -delete
```

### Manuel Yedek

```bash
# DB dump
mysqldump -u usr_tiklabakim_user -p usr_tiklabakim_db > ~/backups/manual_$(date +%Y%m%d_%H%M).sql

# Upload dosyaları yedekle
tar -czf ~/backups/uploads_$(date +%Y%m%d).tar.gz ~/tiklabakim/public/uploads/
```

---

## BÖLÜM 5 — SORUN GİDERME

### PM2 Logları
```bash
pm2 logs tiklabakim --lines 50
pm2 status
```

### Uygulama Yeniden Başlatma
```bash
pm2 restart tiklabakim
```

### Build Hatası Sonrası Geri Al
```bash
cd ~/tiklabakim
git log --oneline -5    # Commit geçmişi
git revert HEAD         # Son commit'i geri al
bash deploy.sh          # Yeniden deploy
```

### MySQL Bağlantı Testi
```bash
mysql -u usr_tiklabakim_user -p -h localhost usr_tiklabakim_db
# Bağlantı başarılıysa "mysql>" prompt görürsünüz
```

### Port Kontrolü
```bash
pm2 status              # Çalışıyor mu?
curl http://127.0.0.1:3000  # Port 3000'den cevap geliyor mu?
```

---

## Hızlı Referans Tablosu

| Görev | Komut |
|-------|-------|
| Sunucuya deploy | `bash deploy.sh` |
| PM2 logları | `pm2 logs tiklabakim` |
| PM2 restart | `pm2 restart tiklabakim` |
| DB yedeği al | `mysqldump -u usr... -p usr_db > backup.sql` |
| DB seed (ilk kurulum) | `npm run db:seed` |
| Build temizle | `rm -rf .next && npm run build` |
| Prisma studio (lokal) | `npm run db:studio` |
