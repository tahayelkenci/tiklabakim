#!/bin/bash
# =============================================================
# Tıkla Bakım — Production Deploy Script
# Sunucuda çalıştırın: bash deploy.sh
# =============================================================

set -e  # Hata olursa dur

# ---- Node.js ortamını aktifleştir ----
# cPanel Node.js App'in kurulu olduğu yolu kontrol et:
#   ls ~/nodevenv/
# Doğru yolu buraya yazın:
NODEVENV="$HOME/nodevenv/tiklabakim/20/bin/activate"
if [ -f "$NODEVENV" ]; then
  source "$NODEVENV"
  echo "Node.js $(node --version) aktif"
else
  echo "UYARI: cPanel Node.js sanal ortamı bulunamadı: $NODEVENV"
  echo "       cPanel > Setup Node.js App'den uygulamayı oluşturun."
  echo "       Mevcut node: $(node --version)"
fi

echo "Deploy başlıyor..."

# Git'ten son sürümü çek
git pull origin main

# MySQL schema'yı aktif schema olarak ayarla
cp prisma/schema.mysql.prisma prisma/schema.prisma
echo "MySQL schema aktif edildi"

# Tüm bağımlılıkları yükle (ts-node dahil — build ve seed için gerekli)
npm install
echo "Bağımlılıklar yüklendi"

# Prisma client üret
npx prisma generate
echo "Prisma client üretildi"

# Veritabanı tablolarını güncelle
npx prisma db push --skip-generate
echo "Veritabanı güncellendi"

# Next.js build al
NODE_ENV=production npm run build
echo "Build tamamlandı"

# Standalone için static dosyaları kopyala
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
echo "Static dosyalar kopyalandı"

# Log klasörü oluştur (yoksa)
mkdir -p logs

# PM2'yi yeniden başlat (veya ilk kez başlat)
if pm2 list | grep -q "tiklabakim"; then
  pm2 restart tiklabakim
  echo "PM2 yeniden baslatildi"
else
  pm2 start ecosystem.config.js
  pm2 save
  echo "PM2 ilk kez baslatildi"
fi

echo ""
echo "Deploy basariyla tamamlandi!"
echo "Site: https://tiklabakim.com"
