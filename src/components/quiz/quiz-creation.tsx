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
    src: '/../../../public/fonts/aespa_Regular.ttf',
    variable: '--font-aespa',
})

export default function QuizCreation() {
    const { user, isLoaded } = useUser()
    const router = useRouter()

    const handleStartQuiz = () => {
        const quizId = uuidv4()
        router.push(`/quiz/${quizId}`)
    }

    return (
        <div
            className={`${roboto.className} quiz-creation flex min-h-screen flex-col overflow-x-hidden text-white`}
        >
            <header className='relative flex w-full justify-center px-6 py-4'>
                <h1
                    className={`${aespaFont.className} text-3xl font-bold md:text-9xl`}
                >
                    aespa quiz
                </h1>
            </header>

            <main className='flex h-[80vh] flex-col items-center justify-center p-6 text-center'>
                <div className='mx-auto w-full max-w-2xl'>
                    <div className='relative mb-8'>
                        <div className='relative overflow-hidden rounded-md p-8 shadow-xl'>
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
                                    className='w-full rounded-md bg-purple-700 py-6 text-lg text-white shadow-md transition-all hover:bg-purple-800'
                                >
                                    Start quiz
                                </Button>
                                <div className='flex gap-4'>
                                    {isLoaded && user && (
                                        <Link
                                            href='/dashboard'
                                            className='w-full'
                                        >
                                            <Button
                                                variant='outline'
                                                className='w-full rounded-md border-2 border-purple-700 py-6 text-lg text-white hover:bg-purple-700'
                                            >
                                                Dashboard
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href='/' className='w-full'>
                                        <Button
                                            variant='outline'
                                            className='w-full rounded-md border-2 border-purple-700 py-6 text-lg text-white hover:bg-purple-700'
                                        >
                                            Home
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
