'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function QuizCreation() {
    const { user, isLoaded } = useUser()
    const [isLoading, setIsLoading] = useState(false)
    const [showConfig, setShowConfig] = useState(false)
    const [selectedQuestions, setSelectedQuestions] = useState(5)
    const router = useRouter()

    const startQuizConfig = () => {
        setShowConfig(true)
    }

    const startQuizWithQuestions = (questionCount: number) => {
        setIsLoading(true)
        const quizId = uuidv4()
        router.push(`/quiz/${quizId}?questions=${questionCount}`)
    }

    return (
        <div className='quiz-creation flex min-h-screen flex-col overflow-x-hidden text-white'>
            <main className='flex min-h-screen flex-col items-center justify-center p-6 text-center'>
                <div className='mx-auto w-full max-w-[904px]'>
                    <AnimatePresence mode='wait'>
                        {!showConfig ? (
                            <motion.div
                                key='welcome'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className='relative mb-8'
                            >
                                <div className='relative overflow-hidden rounded-md p-8'>
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
                                        transition={{
                                            duration: 0.8,
                                            delay: 0.9,
                                        }}
                                        className='mb-6 text-xl text-gray-300 italic'
                                    >
                                        Test your knowledge about one of
                                        K-pop&apos;s most popular girl groups!
                                    </motion.p>
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 1.1,
                                        }}
                                        className='mx-auto space-y-4 md:w-1/2'
                                    >
                                        <Button
                                            onClick={startQuizConfig}
                                            className='w-full rounded-md bg-purple-700 py-6 text-lg text-white transition-all hover:bg-purple-800'
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
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key='config'
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className='relative mb-8'
                            >
                                <div className='relative overflow-hidden rounded-md p-8'>
                                    <motion.h2
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className='mb-10 text-3xl font-bold md:text-6xl'
                                    >
                                        Choose your amount of questions
                                    </motion.h2>
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.2,
                                        }}
                                        className='mx-auto flex flex-col gap-4 md:w-1/2'
                                    >
                                        <Select
                                            onValueChange={(value) => {
                                                setSelectedQuestions(
                                                    Number(value)
                                                )
                                            }}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className='h-16 w-full bg-purple-700 text-lg text-white hover:bg-purple-800 disabled:opacity-50'>
                                                <SelectValue placeholder='Select amount of questions' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {[5, 10, 15, 20].map(
                                                        (count) => (
                                                            <SelectItem
                                                                key={count}
                                                                value={count.toString()}
                                                                className='text-lg transition-all duration-150 hover:bg-purple-800'
                                                            >
                                                                {count}{' '}
                                                                questions
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            onClick={() =>
                                                startQuizWithQuestions(
                                                    selectedQuestions
                                                )
                                            }
                                            className='w-full rounded-md bg-purple-700 py-6 text-lg text-white transition-all hover:bg-purple-800'
                                            disabled={isLoading}
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

                                        <Button
                                            onClick={() => setShowConfig(false)}
                                            className='flex w-full items-center justify-center gap-2 rounded-md border-2 border-purple-700 py-6 text-lg text-white transition-all hover:bg-purple-700'
                                        >
                                            <ArrowLeft />
                                            Go back
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}

const ArrowLeft = () => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='48'
            height='48'
            viewBox='0 0 24 24'
        >
            <path
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='m12 19l-7-7l7-7m7 7H5'
            />
        </svg>
    )
}
