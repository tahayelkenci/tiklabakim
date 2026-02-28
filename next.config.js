/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // cPanel Node.js App için standalone build
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Yerel uploadlar için
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
    ],
  },
  // Türkçe karakter desteği için
  i18n: undefined,
  // API route body size limit (fotoğraf yüklemeleri için)
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  // Güvenlik başlıkları
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ]
  },
  // Yönlendirmeler
  async redirects() {
    return [
      {
        source: '/kuafor/:path*',
        destination: '/pet-kuafor/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
