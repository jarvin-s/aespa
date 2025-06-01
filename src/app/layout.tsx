import type { Metadata } from 'next'
import { Inter_Tight } from 'next/font/google'
import './globals.css'
import Navbar from './components/header/navbar'

const inter = Inter_Tight({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-inter',
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
        <html lang='en'>
            <body className={`${inter.variable} antialiased`}>
                <Navbar />
                {children}
            </body>
        </html>
    )
}
