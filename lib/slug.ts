/**
 * Türkçe karakterleri destekleyen URL slug üretici
 */
export function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ç: 'c', Ç: 'c',
    ğ: 'g', Ğ: 'g',
    ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o',
    ş: 's', Ş: 's',
    ü: 'u', Ü: 'u',
    â: 'a', Â: 'a',
    î: 'i', Î: 'i',
    û: 'u', Û: 'u',
  }

  return text
    .split('')
    .map((char) => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * İşletme için benzersiz slug üretir
 */
export function generateBusinessSlug(name: string, district: string): string {
  const nameSlug = slugify(name)
  const districtSlug = slugify(district)
  return `${nameSlug}-${districtSlug}`
}

/**
 * Slug'ı okunabilir metne çevirir
 */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Türkiye şehir isimleri (URL → Görüntü)
export const CITY_NAMES: Record<string, string> = {
  istanbul: 'İstanbul',
  ankara: 'Ankara',
  izmir: 'İzmir',
  bursa: 'Bursa',
  antalya: 'Antalya',
  adana: 'Adana',
  konya: 'Konya',
  gaziantep: 'Gaziantep',
  mersin: 'Mersin',
  diyarbakir: 'Diyarbakır',
  kayseri: 'Kayseri',
  eskisehir: 'Eskişehir',
  samsun: 'Samsun',
  denizli: 'Denizli',
  trabzon: 'Trabzon',
  sakarya: 'Sakarya',
  malatya: 'Malatya',
  kocaeli: 'Kocaeli',
  manisa: 'Manisa',
  kahramanmaras: 'Kahramanmaraş',
}

// İlçe ismi formatlama
export function formatDistrictName(district: string): string {
  return district
    .split('-')
    .map((word) => {
      const turkishUpper: Record<string, string> = {
        i: 'İ', ı: 'I',
        c: 'C', ç: 'Ç',
        g: 'G', ğ: 'Ğ',
        o: 'O', ö: 'Ö',
        s: 'S', ş: 'Ş',
        u: 'U', ü: 'Ü',
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
