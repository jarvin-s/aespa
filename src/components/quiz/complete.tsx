import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { CardContent } from '../ui/card'
import { Share2 } from 'lucide-react'
import { motion } from 'motion/react'

interface QuizCompleteProps {
    score: number
    totalQuestions: number
}

const QuizComplete = ({ score, totalQuestions }: QuizCompleteProps) => {
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
                                <div className='text-center'>
                                    <span className='text-5xl font-bold'>
                                        Well done! You scored{' '}
                                        <span className='text-purple-500'>
                                            {score}
                                        </span>{' '}
                                        points.
                                    </span>
                                </div>
                            </div>

                            <div className='text-center'>
                                <p className='text-4xl font-bold'>
                                    {(score / 1000).toFixed(0)} out of{' '}
                                    {totalQuestions}
                                </p>
                                <p className='mt-2 text-xl'>
                                    questions answered correctly
                                </p>
                            </div>
                        </div>

                        <div className='flex justify-center'>
                            <div className='flex flex-col items-center justify-center p-6'>
                                <div className='w-full'>
                                    <Button
                                        asChild
                                        className='w-full rounded-md bg-purple-700 px-6 py-2 text-white transition-all hover:bg-purple-800'
                                    >
                                        <Link href={`/quiz`}>New quiz</Link>
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='mt-1 w-full text-white hover:bg-white/20'
                                    >
                                        <Share2 className='h-6 w-6 text-white/80' />
                                        <p className='text-sm text-white/80'>
                                            Share score
                                        </p>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </motion.div>
                <div className='flex flex-col items-center gap-4'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className='flex flex-col gap-4 md:flex-row'
                    >
                        {user ? (
                            <>
                                <Button
                                    asChild
                                    variant='outline'
                                    className='w-64 border-[#6d6d6d2a] text-white hover:bg-purple-700'
                                >
                                    <Link href='/leaderboard'>
                                        Check out the leaderboard
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant='outline'
                                    className='w-64 border-[#6d6d6d2a] text-white hover:bg-purple-700'
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
                                className='w-64 border-[#6d6d6d2a] text-white hover:bg-purple-700'
                            >
                                <Link href='/'>Back to Home</Link>
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default QuizComplete
