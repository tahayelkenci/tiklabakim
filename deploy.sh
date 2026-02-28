#!/bin/bash
# =============================================================
# Tıkla Bakım — Production Deploy Script
# Sunucuda çalıştırın: bash deploy.sh
# =============================================================

set -e  # Hata olursa dur

echo "🚀 Deploy başlıyor..."

# Git'ten son sürümü çek
git pull origin main

# MySQL schema'yı aktif schema olarak ayarla
cp prisma/schema.mysql.prisma prisma/schema.prisma
echo "✅ MySQL schema aktif edildi"

# Bağımlılıkları yükle
npm install --omit=dev
echo "✅ Bağımlılıklar yüklendi"

# Prisma client üret
npx prisma generate
echo "✅ Prisma client üretildi"

# Veritabanı tablolarını güncelle (migration olmadan)
npx prisma db push --skip-generate
echo "✅ Veritabanı güncellendi"

# Next.js build al
NODE_ENV=production npm run build
echo "✅ Build tamamlandı"

# Standalone için static dosyaları kopyala
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
echo "✅ Static dosyalar kopyalandı"

# Log klasörü oluştur (yoksa)
mkdir -p logs

# PM2'yi yeniden başlat (veya ilk kez başlat)
if pm2 list | grep -q "tiklabakim"; then
  pm2 restart tiklabakim
  echo "✅ PM2 yeniden başlatıldı"
else
  pm2 start ecosystem.config.js
  pm2 save
  echo "✅ PM2 ilk kez başlatıldı"
fi

echo ""
echo "🎉 Deploy başarıyla tamamlandı!"
echo "   Site: https://tiklabakim.com"
