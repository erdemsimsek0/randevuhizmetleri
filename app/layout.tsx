import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-dm-serif',
})

export const metadata: Metadata = {
  title: 'randevuhizmetleri.com — Admin Panel',
  description: 'Çok kiracılı randevu yönetim platformu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body>{children}</body>
    </html>
  )
}
