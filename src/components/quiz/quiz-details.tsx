'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import localFont from 'next/font/local'

const aespaFont = localFont({
    src: '/../../../public/fonts/aespa_Regular.ttf',
    display: 'swap',
})

interface Question {
    id: number
    question: string
    options: string[]
    correct_answer: string
    image: string | null
    category: string
    created_at: string
    updated_at: string
}

interface QuizDetails {
    session_id: string
    current_question: number
    score: number
    completed: boolean
    created_at: string
    questions: Question[]
    answer_history: Array<{
        quizId: string
        userAnswer: string
        correctAnswer: string
        correct: boolean
    }>
}

export default function QuizDetails({ id }: { id: string }) {
    const { user, isLoaded } = useUser()
    const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (isLoaded && !user) {
            redirect('/sign-in')
        }
    }, [user, isLoaded])

    useEffect(() => {
        const fetchQuizDetails = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/quiz/details?id=${id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch quiz details')
                }
                const data = await response.json()
                setQuizDetails(data.quizDetails)
            } catch (error) {
                console.error('Failed to fetch quiz details:', error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchQuizDetails()
        }
    }, [id])

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

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/quiz/details?id=${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete quiz')
            }

            window.location.href = '/dashboard'
        } catch (error) {
            console.error('Failed to delete quiz:', error)
            alert('Failed to delete quiz. Please try again.')
        }
    }

    return (
        <div className='quiz-creation flex min-h-screen flex-col gap-10'>
            <header className='relative mt-10 flex w-full justify-center px-6 py-4'>
                <Link href='/dashboard' className='text-white'>
                    <ArrowLeft />
                </Link>
                <h1 className='flex-1 text-center text-5xl font-bold text-white md:text-7xl'>
                    Quiz details
                </h1>
            </header>

            <main className='flex-1 p-6'>
                <div className='mx-auto max-w-4xl'>
                    {loading ? (
                        <div className='quiz-game flex min-h-screen items-center justify-center'>
                            <div className='flex items-center space-x-2'>
                                <div className='h-4 w-4 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]'></div>
                                <div className='h-4 w-4 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]'></div>
                                <div className='h-4 w-4 animate-bounce rounded-full bg-purple-400'></div>
                                <span className='text-4xl font-bold text-purple-400'>
                                    Loading...
                                </span>
                            </div>
                        </div>
                    ) : quizDetails ? (
                        <div className='space-y-6'>
                            <div className='rounded-md border-2 border-purple-500 bg-white p-6'>
                                <h2 className='mb-4 text-2xl font-bold text-purple-700'>
                                    Summary
                                </h2>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    <div className='rounded-md bg-purple-50 p-4'>
                                        <p className='text-sm text-purple-700'>
                                            Date taken
                                        </p>
                                        <p className='font-medium text-gray-800'>
                                            {formatDate(quizDetails.created_at)}
                                        </p>
                                    </div>
                                    <div className='rounded-md bg-purple-50 p-4'>
                                        <p className='text-sm text-purple-700'>
                                            Final score
                                        </p>
                                        <p className='font-medium text-gray-800'>
                                            {quizDetails.score} /{' '}
                                            {quizDetails.questions.length}
                                        </p>
                                    </div>
                                    <div className='rounded-md bg-purple-50 p-4'>
                                        <p className='text-sm text-purple-700'>
                                            Status
                                        </p>
                                        <div className='flex items-center space-x-2'>
                                            {quizDetails.completed ? (
                                                <>
                                                    <CheckCircle2 className='h-5 w-5 text-green-600' />
                                                    <p className='font-medium text-green-600'>
                                                        Completed
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className='h-5 w-5 text-red-600' />
                                                    <p className='font-medium text-red-600'>
                                                        Incomplete
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className='rounded-md bg-purple-50 p-4'>
                                        <p className='text-sm text-purple-700'>
                                            Percentage
                                        </p>
                                        <p className='font-medium text-gray-800'>
                                            {Math.round(
                                                (quizDetails.score /
                                                    quizDetails.questions
                                                        .length) *
                                                    100
                                            )}
                                            %
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='rounded-md border-2 border-purple-500 bg-white p-6'>
                                <h2 className='mb-4 text-2xl font-bold text-purple-700'>
                                    Questions review
                                </h2>

                                {quizDetails.answer_history.length > 0 ? (
                                    <div className='space-y-4'>
                                        {quizDetails.questions.map(
                                            (question, index) => {
                                                const answer =
                                                    quizDetails.answer_history[
                                                        index
                                                    ]

                                                return (
                                                    <div
                                                        key={question.id}
                                                        className={`rounded-md p-4 ${
                                                            answer?.correct
                                                                ? 'border border-green-200 bg-green-100'
                                                                : 'border border-red-200 bg-red-100'
                                                        }`}
                                                    >
                                                        <div className='flex items-start space-x-2'>
                                                            <div className='shrink-0 pt-1'>
                                                                {answer?.correct ? (
                                                                    <CheckCircle2 className='h-5 w-5 text-green-600' />
                                                                ) : (
                                                                    <XCircle className='h-5 w-5 text-red-600' />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className='font-medium text-gray-800'>
                                                                    {index + 1}.{' '}
                                                                    {
                                                                        question.question
                                                                    }
                                                                </p>
                                                                {answer && (
                                                                    <div className='mt-2 space-y-1 text-sm'>
                                                                        <p className='text-gray-600'>
                                                                            <span className='font-medium'>
                                                                                Your
                                                                                answer:
                                                                            </span>{' '}
                                                                            {
                                                                                answer.userAnswer
                                                                            }
                                                                        </p>
                                                                        {!answer.correct && (
                                                                            <p className='text-green-600'>
                                                                                <span className='font-medium'>
                                                                                    Correct
                                                                                    answer:
                                                                                </span>{' '}
                                                                                {
                                                                                    question.correct_answer
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <div className='rounded-md bg-purple-50 p-6 text-center'>
                                        <p className='text-gray-600'>
                                            No question data available.
                                        </p>
                                    </div>
                                )}
                                <Button
                                    variant='destructive'
                                    onClick={() => setShowDeleteModal(true)}
                                    className='mt-4 flex w-full items-center gap-2 bg-red-600 text-white hover:bg-red-500 md:w-auto'
                                >
                                    <Trash2 className='h-4 w-4' />
                                    Delete quiz
                                </Button>
                            </div>

                            <div className='flex justify-center space-x-4'>
                                <Link className='w-full' href='/dashboard'>
                                    <Button
                                        className={`${aespaFont.className} w-full bg-purple-500 text-xl text-white hover:bg-purple-600`}
                                    >
                                        Back to dashboard
                                    </Button>
                                </Link>
                                <Link className='w-full' href='/quiz'>
                                    <Button
                                        variant='outline'
                                        className={`${aespaFont.className} w-full border-purple-500 text-xl text-white hover:bg-purple-500`}
                                    >
                                        Take another quiz
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className='rounded-xl bg-purple-50 p-6 text-center shadow'>
                            <p className='text-gray-600'>
                                Quiz not found or you don&apos;t have permission
                                to view it.
                            </p>
                            <div className='mt-4'>
                                <Link href='/dashboard'>
                                    <Button className='bg-purple-500 text-white hover:bg-purple-600'>
                                        Back to Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showDeleteModal && (
                <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm'>
                    <div className='mx-4 w-full max-w-md rounded-md bg-white p-6 shadow-xl'>
                        <h3 className='mb-4 text-xl font-bold text-gray-900'>
                            Delete quiz
                        </h3>
                        <p className='mb-6 text-gray-600'>
                            Are you sure you want to delete this quiz? This
                            action cannot be undone.
                        </p>
                        <div className='flex justify-end space-x-3'>
                            <Button
                                variant='outline'
                                onClick={() => setShowDeleteModal(false)}
                                className='border-gray-300'
                            >
                                Cancel
                            </Button>
                            <Button
                                variant='destructive'
                                onClick={handleDelete}
                                className='bg-red-600 hover:bg-red-700'
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
