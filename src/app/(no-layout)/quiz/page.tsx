'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import { Roboto } from 'next/font/google'
import localFont from 'next/font/local'

const roboto = Roboto({
    weight: '400',
    subsets: ['latin'],
})

const aespaFont = localFont({
    src: '/../../../../public/fonts/aespa_Regular.ttf',
    variable: '--font-aespa',
})

export default function Home() {
    const { user, isLoaded } = useUser()
    const router = useRouter()

    const handleStartQuiz = () => {
        const quizId = uuidv4()
        router.push(`/quiz/${quizId}`)
        // router.push(`/quiz/game`)
    }

    return (
        <div
            className={`${roboto.className} flex min-h-screen flex-col overflow-x-hidden bg-black text-white`}
        >
            <header className='relative flex w-full justify-center px-6 py-4'>
                <h1
                    className={`${aespaFont.className} text-3xl font-bold md:text-9xl`}
                >
                    aespa quiz
                </h1>
            </header>

            <main className='flex flex-1 flex-col items-center justify-center p-6 text-center'>
                <div className='mx-auto w-full max-w-4xl'>
                    <div className='relative mb-8'>
                        <div className='relative overflow-hidden rounded-md bg-black/80 p-8 shadow-xl'>
                            <h2 className='mb-4 text-4xl font-bold md:text-6xl'>
                                How well do you know aespa?
                            </h2>
                            <p className='mb-6 text-xl text-gray-300'>
                                Test your knowledge about one of K-pop&apos;s
                                most popular girl groups!
                            </p>
                            <div className='space-y-4'>
                                <Button
                                    onClick={handleStartQuiz}
                                    className='w-full rounded-md bg-white py-6 text-lg text-black shadow-md transition-all hover:bg-gray-200 md:w-1/3'
                                >
                                    Start quiz
                                </Button>
                                {isLoaded && user && (
                                    <Link
                                        href='/dashboard'
                                        className='block w-full'
                                    >
                                        <Button
                                            variant='outline'
                                            className='w-full rounded-md border-white py-6 text-lg text-white hover:bg-gray-700 md:w-1/3'
                                        >
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <Link href='/' className='block w-full'>
                                    <Button
                                        variant='outline'
                                        className='w-full rounded-md border-white py-6 text-lg text-white hover:bg-gray-700 md:w-1/3'
                                    >
                                        Home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
