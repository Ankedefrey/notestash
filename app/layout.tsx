import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm', display: 'swap' })

export const metadata: Metadata = {
  title: 'NoteStash — Study notes that actually make sense',
  description: 'Curated, exam-focused PDF notes for university stats modules. Pay by EFT, get a code, start studying.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
