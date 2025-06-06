import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import localFont from 'next/font/local'
import { CircleDashed } from 'lucide-react'
import { CardContent } from '../ui/card'
import { Card } from '../ui/card'
import { Share2 } from 'lucide-react'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
    weight: '400',
    subsets: ['latin'],
})

const aespaFont = localFont({
    src: '/../../../public/fonts/aespa_Regular.ttf',
    display: 'swap',
})

interface QuizCompleteProps {
    score: number
    totalQuestions: number
}

const QuizComplete = ({ score, totalQuestions }: QuizCompleteProps) => {
    const percentage = (score / totalQuestions) * 100
    const { user } = useUser()

    return (
        <div
            className={`${roboto.className} quiz-complete flex min-h-screen flex-col items-center justify-center text-white`}
        >
            <div className='relative w-full max-w-4xl rounded-md p-4'>
                <h2
                    className={`${aespaFont.className} mb-6 text-center text-5xl font-bold text-white md:text-9xl`}
                >
                    Quiz complete!
                </h2>
                <Card className='mb-6 overflow-hidden border-white/20 bg-purple-500/30 text-white backdrop-blur-md'>
                    <CardContent className='p-0'>
                        <div className='flex flex-col items-center justify-center p-8'>
                            <div className='relative mb-6'>
                                <CircleDashed
                                    className='h-36 w-36 text-white/20'
                                    strokeWidth={1}
                                />
                                <div className='absolute inset-0 flex items-center justify-center'>
                                    <div className='text-center'>
                                        <span
                                            className={`${aespaFont.className} text-5xl font-bold`}
                                        >
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={` ${aespaFont.className} text-center`}
                            >
                                <p className='text-4xl font-bold'>
                                    {score}{' '}
                                    <span className='text-white/80'>
                                        out of
                                    </span>{' '}
                                    {totalQuestions}
                                </p>
                                <p className='mt-2 text-xl text-white/80'>
                                    questions answered correctly
                                </p>
                            </div>
                        </div>

                        <div className='flex justify-center border-t border-white/20'>
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
                                            Share Score
                                        </p>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className='flex flex-col items-center gap-4'>
                    <div className='flex flex-col gap-4 md:flex-row'>
                        {user ? (
                            <>
                                <Button
                                    asChild
                                    variant='outline'
                                    disabled={true}
                                    className='w-64 border-[#6d6d6d2a] text-white hover:bg-purple-700'
                                >
                                    <Link href='/leaderboard'>Leaderboard</Link>
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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuizComplete
