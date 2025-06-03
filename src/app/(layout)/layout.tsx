import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import '@/app/globals.css'
import Navbar from '../../components/header/navbar'
import { ClerkProvider } from '@clerk/nextjs'

const openSans = Open_Sans({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    variable: '--font-open-sans',
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
                <body className={`${openSans.variable} antialiased`}>
                    <Navbar />
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}
