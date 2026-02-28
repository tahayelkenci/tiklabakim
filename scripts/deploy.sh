#!/bin/bash
# =====================================================================
# Tıkla Bakım — Deployment Script
# =====================================================================
#
# Kullanım:
#   ./scripts/deploy.sh           → Build + tarball oluştur
#   ./scripts/deploy.sh --check   → Sadece TypeScript kontrolü
#
# Gereksinimler: Node.js 18+, npm
#
# Sunucuya yükleme sonrası WHM Terminal'de çalıştır:
#   cd /home/tiklabakimcom/tiklabakim
#   tar -xzf tiklabakim-TARIH.tar.gz
#   touch tmp/restart.txt
# =====================================================================

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="tiklabakim-$TIMESTAMP.tar.gz"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$PROJECT_DIR/.next/standalone"

cd "$PROJECT_DIR"

# Renk çıktıları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Tıkla Bakım — Deploy Paketi Oluşturuluyor${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Sadece TypeScript kontrolü
if [[ "$1" == "--check" ]]; then
  echo -e "${YELLOW}📋 TypeScript kontrolü başlatılıyor...${NC}"
  npx tsc --noEmit
  echo -e "${GREEN}✅ TypeScript hatası yok!${NC}"
  exit 0
fi

# Bağımlılıkları kontrol et
echo -e "${YELLOW}📦 Bağımlılıklar kontrol ediliyor...${NC}"
if [ ! -d "node_modules" ]; then
  npm install
fi

# Build
echo -e "${YELLOW}🔨 Build başlatılıyor...${NC}"
npm run build

# Standalone klasör kontrolü
if [ ! -d "$DIST_DIR" ]; then
  echo -e "${RED}❌ Hata: .next/standalone bulunamadı!${NC}"
  echo "  next.config.js'de 'output: standalone' ayarı eksik olabilir."
  exit 1
fi

# Static dosyaları standalone'a kopyala
echo -e "${YELLOW}📂 Static dosyalar kopyalanıyor...${NC}"
cp -r .next/static "$DIST_DIR/.next/static"
cp -r public "$DIST_DIR/public"

# Scripts klasörünü ekle (server'da seed çalıştırmak için)
mkdir -p "$DIST_DIR/scripts"
cp scripts/seed-cities.cjs "$DIST_DIR/scripts/" 2>/dev/null || true

# .env dosyalarını standalone'dan sil (server'dakini ezmemek için)
# NOT: Next.js build sırasında .env dosyaları standalone'a kopyalanır,
# ancak bunlar local değerleri içerir — server'ın kendi .env'i korunmalıdır.
echo -e "${YELLOW}🔒 .env dosyaları tarball'dan hariç tutulacak (server .env'i korunur)...${NC}"
find "$DIST_DIR" -maxdepth 1 -name '.env*' -delete

# Tarball oluştur (.env* hariç — zaten silindi, ama çift güvence için)
echo -e "${YELLOW}📦 Paket oluşturuluyor: $PACKAGE_NAME${NC}"
tar -czf "$PACKAGE_NAME" \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.db' \
  --exclude='*.sqlite' \
  -C "$DIST_DIR" .

# Dosya boyutu
SIZE=$(du -sh "$PACKAGE_NAME" | cut -f1)
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Paket hazır: $PACKAGE_NAME ($SIZE)${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Sunucuya yükleme adımları:${NC}"
echo ""
echo "  1. cPanel File Manager açın:"
echo "     https://server.tiklabakim.com:2083"
echo ""
echo "  2. /home/tiklabakimcom/tiklabakim/ klasörüne yükleyin:"
echo "     $PACKAGE_NAME"
echo ""
echo "  3. WHM Terminal'de çalıştırın:"
echo "     ─────────────────────────────────────"
echo "     cd /home/tiklabakimcom/tiklabakim"
echo "     tar -xzf $PACKAGE_NAME"
echo "     touch tmp/restart.txt"
echo "     ─────────────────────────────────────"
echo ""
echo "  4. Siteyi test edin: https://tiklabakim.com"
echo ""
