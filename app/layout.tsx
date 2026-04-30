import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CheetoLearn',
  description: 'Learning Management System CheetoLearn, all rights reserved.',
  icons: {
    icon: '/cheeto_learn_logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen bg-background text-foreground overflow-x-hidden">
        <main className="relative flex flex-col w-full max-w-[100vw] overflow-x-hidden px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
