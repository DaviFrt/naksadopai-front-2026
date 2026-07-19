import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Na Ksa do Pai - Céus Abertos 2026',
  description:
    'O congresso Na Ksa do Pai chega em 2026 para uma geração que decidiu viver na contramão. Inspirado em Romanos 12:2.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#241a12',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
