import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import '@/app/globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const notoSans = Noto_Sans({
    weight: ['400'],
    subsets: ['latin'],
    variable: '--font-noto-sans',
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
                <body className={`${notoSans.className} antialiased`}>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}
