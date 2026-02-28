# PetPati — cPanel Kurulum Rehberi

## Ön Gereksinimler

- cPanel + WHM erişimi
- Node.js 18+ desteği (cPanel > Node.js App)
- MySQL 8.0+
- SSH erişimi (veya cPanel Terminal)
- En az 512MB RAM

---

## Adım 1: MySQL Veritabanı Oluşturun

1. cPanel → **MySQL Databases** açın
2. **Create New Database** → `petpati_db` yazın → Create
3. **MySQL Users** bölümünde → **Add New User**:
   - Username: `petpati_user`
   - Password: Güçlü bir şifre (kaydedin!)
4. **Add User To Database** → `petpati_user` + `petpati_db` → All Privileges

Bağlantı string'i:
```
mysql://petpati_user:SIFRE@localhost:3306/petpati_db
```

---

## Adım 2: Dosyaları Yükleyin

### SSH ile (Önerilen):
```bash
# SSH bağlantısı
ssh kullanici@sunucu.com

# Dizine geç
cd /home/kullanici/

# Projeyi yükle (FTP veya git clone)
mkdir petpati
cd petpati

# Ya FTP ile dosyaları yükleyin ya da:
git clone https://github.com/KULLANICI/petpati.git .
```

### FTP ile:
- FileZilla veya cPanel File Manager kullanarak
- `/home/kullanici/petpati/` dizinine tüm dosyaları yükleyin
- `.env.local` dosyasını oluşturun

---

## Adım 3: .env.local Dosyasını Oluşturun

SSH veya cPanel File Manager ile `/home/kullanici/petpati/.env.local` oluşturun:

```env
DATABASE_URL="mysql://petpati_user:SIFRENIZ@localhost:3306/petpati_db"
NEXTAUTH_URL="https://www.petpati.com"
NEXTAUTH_SECRET="min-32-karakterlik-guclu-rastgele-string"
NEXT_PUBLIC_SITE_URL="https://www.petpati.com"
SMTP_HOST="mail.petpati.com"
SMTP_PORT="587"
SMTP_USER="noreply@petpati.com"
SMTP_PASSWORD="email-sifreniz"
```

**NEXTAUTH_SECRET oluşturmak için:**
```bash
openssl rand -base64 32
```

---

## Adım 4: Node.js App Oluşturun

1. cPanel → **Setup Node.js App** açın
2. **Create Application** tıklayın:
   - **Node.js version**: 18.x veya 20.x
   - **Application mode**: Production
   - **Application root**: `/home/kullanici/petpati`
   - **Application URL**: `petpati.com`
   - **Application startup file**: `.next/standalone/server.js`
3. **Create** tıklayın
4. Atanan **port numarasını** not alın (örn: 3000)

---

## Adım 5: Paketleri Yükleyin ve Build Alın

cPanel Terminal veya SSH:

```bash
cd /home/kullanici/petpati

# Node.js App'in sağladığı npm'i kullan
source /home/kullanici/nodevenv/petpati/18/bin/activate

# Paketleri yükle
npm install

# Prisma client oluştur
npm run db:generate

# Veritabanı tablolarını oluştur
npm run db:migrate

# Örnek veri yükle (ilk kurulumda)
npm run db:seed

# Production build
npm run build

# Standalone dosyaları kopyala
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

---

## Adım 6: .htaccess Ayarlayın

`public_html/.htaccess` dosyasındaki port numarasını Node.js App'inizin portuna güncelleyin:

```apache
RewriteRule ^(.*)$ http://127.0.0.1:PORT/$1 [P,L]
```

`PORT` → cPanel'den atanan port numarası

---

## Adım 7: Uygulamayı Başlatın

cPanel → Node.js App → **Restart** butonu

**veya SSH ile:**
```bash
# PM2 kullanıyorsanız
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Adım 8: SSL Sertifikası

cPanel → **SSL/TLS** → **Let's Encrypt** ile ücretsiz SSL alın.

---

## Güncelleme Prosedürü

Yeni versiyon yüklemek için:

```bash
cd /home/kullanici/petpati

# Değişiklikleri al
git pull  # veya FTP ile yükleyin

# Bağımlılıkları güncelle
npm install

# Veritabanı migration
npm run db:migrate

# Yeni build
npm run build

# Standalone kopyala
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

Sonra cPanel → Node.js App → **Restart**

---

## Sorun Giderme

### Uygulama başlamıyor
```bash
# Log dosyasını kontrol edin
tail -f logs/pm2-error.log

# Port çakışması var mı?
netstat -tlnp | grep 3000
```

### Veritabanı bağlantı hatası
- DATABASE_URL string'ini kontrol edin
- MySQL kullanıcısının yetkileri tam mı?
- `mysql -u petpati_user -p petpati_db` ile test edin

### Build hatası
```bash
# Node.js versiyonunu kontrol edin (18+ gerekli)
node -v

# Diskde yer var mı?
df -h
```

### Fotoğraf yükleme çalışmıyor
```bash
# uploads klasörü yazılabilir mi?
chmod 755 public/uploads
ls -la public/
```

---

## Performans İpuçları

1. **PHP FPM** kapatın (sadece Node.js çalışacak)
2. **CloudFlare** CDN ekleyin (ücretsiz plan yeterli)
3. **MySQL** için `innodb_buffer_pool_size` artırın
4. Upload limiti için `php.ini` değil, `next.config.js` ayarlayın

---

## Admin İlk Giriş

- URL: `https://www.petpati.com/admin`
- Email: `admin@petpati.com` (seed'den)
- Şifre: `Admin123!`
- **⚠️ İlk girişten sonra şifreyi değiştirin!**
