import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SYNTRA — AI-Powered CS2 Performance Intelligence',
  description:
    'Automatically sync your FACEIT and Steam matches, download demos, and convert raw gameplay into tactical intelligence, visual heatmaps, and AI coaching reports.',
  generator: 'v0.app',
  keywords: ['CS2', 'FACEIT', 'analytics', 'AI coaching', 'competitive', 'demo analysis'],
  openGraph: {
    title: 'SYNTRA — AI-Powered CS2 Performance Intelligence',
    description: 'Analyze Every Match. Fix Every Mistake.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable} font-sans antialiased`}
      >
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
