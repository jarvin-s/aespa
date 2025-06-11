import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import '@/app/globals.css'
import Navbar from '../../components/header/navbar'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react'

const interTight = Inter_Tight({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-inter-tight',
})

export const metadata: Metadata = {
    title: 'aespa 에스파 | Be my ae!',
    description: 'An interactive quiz app for aespa fans',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ClerkProvider>
            <html lang='en'>
                <body className={`${interTight.className} antialiased`}>
                    <Navbar />
                    {children}
                    <Analytics />
                </body>
            </html>
        </ClerkProvider>
    )
}
