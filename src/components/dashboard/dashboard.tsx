'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Bebas_Neue } from 'next/font/google'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import UserProfile from '@/components/ui/user-profile'

interface PastQuizzes {
    session_id: string
    language: string
    correct_answer: string
    completed: boolean
    created_at: string
    score: number
    questions: string[]
    title?: string
    timeSpent?: string
}

const getScorePercentage = (score: number, total: number) => {
    return Math.floor((score / (total * 1000)) * 100)
}

const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 40) return 'text-orange-600'
    return 'text-red-600'
}

const bebasNeue = Bebas_Neue({
    subsets: ['latin'],
    weight: ['400'],
})

export default function QuizDashboard() {
    const { user, isLoaded } = useUser()
    const [completedQuizzes, setCompletedQuizzes] = useState<PastQuizzes[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isLoaded && !user) {
            redirect('/')
        }
    }, [user, isLoaded])

    useEffect(() => {
        const fetchPastQuizzes = async () => {
            setLoading(true)
            try {
                const response = await fetch('/api/history')
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                const data = await response.json()
                setCompletedQuizzes(data.pastQuizzes)
            } catch (error) {
                console.error('Failed to fetch past quizzes:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPastQuizzes()
    }, [])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date)
    }

    return (
        <div className='quiz-creation flex min-h-screen flex-col'>
            <header className='relative flex w-full justify-center px-6 py-4 text-white'>
                <div className='absolute top-10 left-4 md:top-14 md:left-8'>
                    <Link href='/quiz'>
                        <ArrowLeft />
                    </Link>
                </div>
                <h1
                    className={`${bebasNeue.className} text-7xl font-bold md:text-9xl`}
                >
                    Dashboard
                </h1>
            </header>

            <main className='flex-1 p-6'>
                <div className='mx-auto max-w-7xl'>
                    {/* User Profile Section */}
                    <div className='mb-8'>
                        <UserProfile className='max-w-7xl mx-auto mb-8' />
                    </div>

                    <div className='mb-8'>
                        {loading ? (
                            <div className='flex justify-center py-8'>
                                <div className='h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent'></div>
                            </div>
                        ) : completedQuizzes.length > 0 ? (
                            <Card className='overflow-hidden bg-white'>
                                <CardHeader>
                                    <CardTitle className='text-2xl text-black'>
                                        Quiz history
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    <div className='overflow-x-auto'>
                                        <div className='max-h-[400px] overflow-y-auto'>
                                            <table className='w-full'>
                                                <thead className='sticky top-0 bg-gray-50'>
                                                    <tr className='border-b border-gray-200'>
                                                        <th className='px-6 py-4 text-left text-sm font-medium text-gray-600'>
                                                            Quiz
                                                        </th>
                                                        <th className='px-6 py-4 text-left text-sm font-medium text-gray-600'>
                                                            Date
                                                        </th>
                                                        <th className='px-6 py-4 text-left text-sm font-medium text-gray-600'>
                                                            Score
                                                        </th>
                                                        <th className='px-6 py-4 text-center text-sm font-medium text-gray-600'>
                                                            Completed
                                                        </th>
                                                        <th className='px-6 py-4 text-center text-sm font-medium text-gray-600'>
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className='divide-y divide-gray-200'>
                                                    {completedQuizzes.map(
                                                        (quiz, index) => {
                                                            const percentage =
                                                                quiz.completed
                                                                    ? getScorePercentage(
                                                                          quiz.score,
                                                                          quiz
                                                                              .questions
                                                                              .length
                                                                      )
                                                                    : 0
                                                            return (
                                                                <tr
                                                                    key={`${quiz.session_id}-${index}`}
                                                                    className='transition-colors hover:bg-gray-50'
                                                                >
                                                                    <td className='px-6 py-4'>
                                                                        <div className='whitespace-nowrap text-gray-900'>
                                                                            Quiz{' '}
                                                                            {completedQuizzes.length -
                                                                                index}
                                                                        </div>
                                                                    </td>
                                                                    <td className='px-6 py-4 whitespace-nowrap text-gray-900'>
                                                                        {formatDate(
                                                                            quiz.created_at
                                                                        )}
                                                                    </td>
                                                                    <td className='px-6 py-4'>
                                                                        {quiz.completed ? (
                                                                            <div className='flex items-center gap-2'>
                                                                                <span
                                                                                    className={`font-bold ${getScoreColor(percentage)}`}
                                                                                >
                                                                                    {
                                                                                        quiz.score
                                                                                    }
                                                                                </span>
                                                                                <Badge
                                                                                    variant='outline'
                                                                                    className={`${getScoreColor(percentage)} border-current`}
                                                                                >
                                                                                    {
                                                                                        percentage
                                                                                    }

                                                                                    %
                                                                                </Badge>
                                                                            </div>
                                                                        ) : (
                                                                            <span className=''>
                                                                                In
                                                                                progress
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className='px-6 py-4 text-center'>
                                                                        {quiz.completed ? (
                                                                            <div className='flex justify-center'>
                                                                                <div className='rounded-full bg-green-100 p-1'>
                                                                                    <Check className='h-4 w-4 text-green-600' />
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className='flex justify-center'>
                                                                                <div className='rounded-full bg-red-100 p-1'>
                                                                                    <X className='h-4 w-4 text-red-600' />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className='px-6 py-4'>
                                                                        <div className='flex justify-center gap-2'>
                                                                            {quiz.completed ? (
                                                                                <Link
                                                                                    href={`/quiz/summary/${quiz.session_id}`}
                                                                                >
                                                                                    <Button
                                                                                        size='sm'
                                                                                        variant='outline'
                                                                                        className='rounded-full bg-purple-700 text-white hover:bg-purple-800'
                                                                                    >
                                                                                        Summary
                                                                                    </Button>
                                                                                </Link>
                                                                            ) : (
                                                                                <Link
                                                                                    href={`/quiz/${quiz.session_id}`}
                                                                                >
                                                                                    <Button
                                                                                        size='sm'
                                                                                        className='rounded-full bg-purple-700 text-white hover:bg-purple-800'
                                                                                    >
                                                                                        Continue
                                                                                    </Button>
                                                                                </Link>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        }
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className='rounded-md border border-purple-100 bg-purple-50 py-12 text-center'>
                                <p className='text-gray-600'>
                                    You haven&apos;t completed any quizzes yet!
                                </p>
                                <div className='mt-4'>
                                    <Link href='/quiz'>
                                        <Button className='rounded-md bg-purple-500 px-6 py-2 text-white hover:bg-purple-600'>
                                            Take a quiz
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='max-w-7xl'>
                        <div className='rounded-md bg-gradient-to-br from-purple-400 to-purple-800 p-6 text-white shadow-lg'>
                            <h3 className='mb-4 text-xl font-bold'>
                                Quick links
                            </h3>
                            <div className='space-y-3'>
                                <Link
                                    href='/quiz'
                                    className='block rounded-md bg-white/10 p-4 transition-all hover:bg-white/20'
                                >
                                    Take a new quiz
                                </Link>
                                <Link
                                    href='/leaderboard'
                                    className='block rounded-md bg-white/10 p-4 transition-all hover:bg-white/20'
                                >
                                    Check out the leaderboard
                                </Link>
                                <Link
                                    href='/'
                                    className='block rounded-md bg-white/10 p-4 transition-all hover:bg-white/20'
                                >
                                    Back to home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

const ArrowLeft = () => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
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
