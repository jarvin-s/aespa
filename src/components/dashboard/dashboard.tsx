'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
    weight: '400',
    subsets: ['latin'],
})

interface PastQuizzes {
    session_id: string
    language: string
    correct_answer: string
    completed: boolean
    created_at: string
    score: number
}

export default function Dashboard() {
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
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    return (
        <div
            className={`${roboto.className} quiz-dashboard flex min-h-screen flex-col`}
        >
            <header className='relative mt-10 flex w-full justify-center px-6 py-4'>
                <Link href='/quiz' className='text-white'>
                    <ArrowLeft />
                </Link>
                <h1 className='flex-1 text-center text-3xl font-bold text-white md:text-7xl'>
                    Dashboard
                </h1>
            </header>

            <main className='flex-1 p-6'>
                <div className='mx-auto max-w-4xl'>
                    <div className='mb-8 rounded-md'>
                        <h2 className='mb-6 text-2xl font-bold text-white'>
                            Your quizzes
                        </h2>

                        {loading ? (
                            <div className='flex justify-center py-8'>
                                <div className='h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent'></div>
                            </div>
                        ) : completedQuizzes.length > 0 ? (
                            <div className='overflow-x-auto'>
                                <div className='inline-block min-w-full align-middle'>
                                    <div className='overflow-hidden rounded-md'>
                                        <table className='min-w-full'>
                                            <thead className='bg-purple-500'>
                                                <tr>
                                                    <th className='px-4 py-3 text-left text-sm font-medium text-white'>
                                                        Date
                                                    </th>
                                                    <th className='px-4 py-3 text-left text-sm font-medium text-white'>
                                                        Score
                                                    </th>
                                                    <th className='px-4 py-3 text-center text-sm font-medium text-white'>
                                                        Actions
                                                    </th>
                                                    <th className='px-4 py-3 text-sm font-medium text-white'>
                                                        Completed
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {completedQuizzes.map(
                                                    (quiz) => (
                                                        <tr
                                                            key={
                                                                quiz.session_id
                                                            }
                                                            className='bg-pink-50'
                                                        >
                                                            <td className='px-4 py-3 text-sm whitespace-nowrap text-gray-700'>
                                                                {formatDate(
                                                                    quiz.created_at
                                                                )}
                                                            </td>
                                                            <td className='px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-700'>
                                                                {quiz.score} /
                                                                10
                                                            </td>
                                                            {!quiz.completed ? (
                                                                <td className='px-4 py-3 text-right text-sm whitespace-nowrap'>
                                                                    <Link
                                                                        href={`/quiz/${quiz.session_id}`}
                                                                        className='flex justify-center'
                                                                    >
                                                                        <Button
                                                                            variant='outline'
                                                                            size='sm'
                                                                            className='rounded-md border-purple-200 text-purple-800 hover:bg-purple-100'
                                                                        >
                                                                            Continue
                                                                        </Button>
                                                                    </Link>
                                                                </td>
                                                            ) : (
                                                                <td className='px-4 py-3 text-right text-sm whitespace-nowrap'>
                                                                    <Link
                                                                        href={`/quiz-details/${quiz.session_id}`}
                                                                        className='flex justify-center'
                                                                    >
                                                                        <Button
                                                                            variant='outline'
                                                                            size='sm'
                                                                            className='rounded-md border-purple-200 text-purple-800 hover:bg-pink-100'
                                                                        >
                                                                            Details
                                                                        </Button>
                                                                    </Link>
                                                                </td>
                                                            )}
                                                            {quiz.completed ? (
                                                                <td className='px-4 py-3 text-center text-sm'>
                                                                    <CheckCircle2 className='mx-auto h-5 w-5 text-green-600' />
                                                                </td>
                                                            ) : (
                                                                <td className='px-4 py-3 text-center text-sm'>
                                                                    <XCircle className='mx-auto h-5 w-5 text-red-600' />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='rounded-md border border-pink-100 bg-pink-50 py-12 text-center'>
                                <p className='text-gray-600'>
                                    You haven&apos;t completed any quizzes yet!
                                </p>
                                <div className='mt-4'>
                                    <Link href='/quiz'>
                                        <Button className='rounded-md bg-pink-500 px-6 py-2 text-white hover:bg-pink-600'>
                                            Take a Quiz
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='max-w-4xl'>
                        <div className='rounded-md bg-gradient-to-br from-purple-400 to-purple-700 p-6 text-white shadow-lg'>
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
