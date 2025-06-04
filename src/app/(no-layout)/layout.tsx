import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import '@/app/globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const roboto = Roboto({
    weight: ['400'],
    subsets: ['latin'],
    variable: '--font-roboto',
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
                <body className={`${roboto.variable} antialiased`}>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}
