import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/layout/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'PetPati — Türkiye\'nin Pet Kuaför Platformu',
    template: '%s | Tıkla Bakım',
  },
  description:
    'Türkiye\'deki tüm pet kuaförlerini karşılaştır. Fiyatlar, yorumlar ve online randevu. Köpek ve kedi kuaförü.',
  keywords: [
    'pet kuaför',
    'köpek kuaför',
    'kedi kuaförü',
    'pet grooming',
    'hayvan bakımı',
    'pet salon',
  ],
  authors: [{ name: 'Tıkla Bakım' }],
  creator: 'Tıkla Bakım',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tiklabakim.com',
    siteName: 'Tıkla Bakım',
    title: 'PetPati — Türkiye\'nin Pet Kuaför Platformu',
    description: 'Türkiye\'deki tüm pet kuaförlerini tek platformda bul.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tıkla Bakım',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tıkla Bakım',
    description: 'Türkiye\'nin Pet Kuaför Platformu',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
