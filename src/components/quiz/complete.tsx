import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { CardContent } from '../ui/card'
import { motion } from 'motion/react'

interface QuizCompleteProps {
    score: number
    totalQuestions: number
}

const QuizComplete = ({ score }: QuizCompleteProps) => {
    const { user } = useUser()

    return (
        <div className='quiz-complete flex min-h-screen flex-col items-center justify-center text-white'>
            <div className='relative w-full max-w-4xl rounded-md p-4'>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='mb-6 text-center text-5xl font-bold text-white md:text-9xl'
                >
                    Quiz complete!
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className='mb-6 overflow-hidden rounded-md text-white'
                >
                    <CardContent className='p-0'>
                        <div className='flex flex-col items-center justify-center p-8'>
                            <div className='relative mb-6'>
                                <div className='flex flex-col text-center'>
                                    <div className='text-5xl font-bold'>
                                        <h1>Well done!</h1>
                                        <span className='text-4xl font-light'>
                                            You scored{' '}
                                            <span className='text-purple-500'>
                                                {score}
                                            </span>{' '}
                                            points.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <div className='flex w-full flex-col items-center justify-center gap-4 md:w-1/2'>
                                <Button
                                    asChild
                                    className='w-full rounded-md bg-purple-700 py-6 text-lg text-white transition-all hover:bg-purple-800'
                                >
                                    <Link href={`/quiz`}>New quiz</Link>
                                </Button>
                                {user ? (
                                    <>
                                        <Button
                                            asChild
                                            variant='outline'
                                            className='w-full border-[#6d6d6d2a] py-6 text-lg text-white hover:bg-purple-700'
                                        >
                                            <Link href='/dashboard'>
                                                Back to dashboard
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        asChild
                                        variant='outline'
                                        className='w-full border-[#6d6d6d2a] py-6 text-lg text-white hover:bg-purple-700'
                                    >
                                        <Link href='/'>Back to home</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </motion.div>
            </div>
        </div>
    )
}

export default QuizComplete
