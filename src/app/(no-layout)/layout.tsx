import type { Metadata } from 'next'
import { Bebas_Neue } from 'next/font/google'
import '@/app/globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const bebasNeue = Bebas_Neue({
    weight: ['400'],
    subsets: ['latin'],
    variable: '--font-bebas-neue',
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
                <body className={`${bebasNeue.variable} antialiased`}>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}
