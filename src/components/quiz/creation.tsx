'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import localFont from 'next/font/local'
import { motion } from 'motion/react'
import { useState } from 'react'

const aespaFont = localFont({
    src: '/../../../public/fonts/aespa_Regular.ttf',
    variable: '--font-aespa',
})

export default function QuizCreation() {
    const { user, isLoaded } = useUser()
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleStartQuiz = () => {
        setIsLoading(true)
        const quizId = uuidv4()
        router.push(`/quiz/${quizId}`)
    }

    return (
        <div className='quiz-creation flex min-h-screen flex-col overflow-x-hidden text-white'>
            <header className='relative flex w-full justify-center px-6 py-4'>
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.75 }}
                    className={`${aespaFont.className} text-7xl font-bold md:text-9xl`}
                >
                    aespa quiz
                </motion.h1>
            </header>

            <main className='flex h-[80vh] flex-col items-center justify-center p-6 text-center'>
                <div className='mx-auto w-full max-w-[904px]'>
                    <div className='relative mb-8'>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.75, delay: 0.5 }}
                            className='relative overflow-hidden rounded-md p-8'
                        >
                            <motion.h2
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.7,
                                    ease: 'easeInOut',
                                }}
                                className='mb-4 text-4xl font-bold md:text-6xl'
                            >
                                How well do you know aespa?
                            </motion.h2>
                            <motion.p
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.9 }}
                                className='mb-6 text-xl text-gray-300 italic'
                            >
                                Test your knowledge about one of K-pop&apos;s
                                most popular girl groups!
                            </motion.p>
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 1.1 }}
                                className='mx-auto space-y-4 md:w-1/2'
                            >
                                <Button
                                    onClick={handleStartQuiz}
                                    disabled={isLoading}
                                    className='w-full rounded-md bg-purple-700 py-6 text-lg text-white shadow-md transition-all hover:bg-purple-800'
                                >
                                    {isLoading ? (
                                        <div className='flex items-center justify-center gap-2'>
                                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                                            <span>Loading</span>
                                        </div>
                                    ) : (
                                        <span>Start quiz</span>
                                    )}
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
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
