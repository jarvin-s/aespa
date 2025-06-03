'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Bebas_Neue } from 'next/font/google'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

const bebasNeue = Bebas_Neue({
    weight: '400',
    subsets: ['latin'],
})

interface QuizProps {
    questions: {
        question: string
        options: string[]
        correct_answer: string
        incorrect_answers: string[]
        image?: string
    }[]
    quizId: string
    initialQuestion: number
    initialScore: number
    initialAnswerHistory: Array<{
        quizId: string
        userAnswer: string
        correctAnswer: string
        correct: boolean
    }>
}

export default function Game({
    questions: quizQuestions,
    quizId,
    initialQuestion,
    initialScore,
    initialAnswerHistory = [],
}: QuizProps) {
    const { user } = useUser()
    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion)
    const [score, setScore] = useState(initialScore)
    const [selectedAnswer, setSelectedAnswer] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [answered, setAnswered] = useState(false)
    const [answerHistory, setAnswerHistory] = useState<
        Array<{
            quizId: string
            userAnswer: string
            correctAnswer: string
            correct: boolean
        }>
    >(initialAnswerHistory)
    const [highlightedOption, setHighlightedOption] = useState<string | null>(
        null
    )
    const nextQuestion = currentQuestion + 1
    const isCompleted = nextQuestion > quizQuestions.length

    const handleAnswerSelect = useCallback(
        (answer: string) => {
            if (answered) return
            setHighlightedOption(answer)
        },
        [answered]
    )

    const handleSubmitAnswer = useCallback(() => {
        if (answered || !highlightedOption) return
        setSelectedAnswer(highlightedOption)
        setAnswered(true)
    }, [answered, highlightedOption])

    const handleNextQuestion = useCallback(async () => {
        if (isSubmitting) return
        setIsSubmitting(true)

        const isCorrect =
            selectedAnswer === quizQuestions[currentQuestion].correct_answer

        const newScore = isCorrect ? score + 1 : score
        const newAnswerEntry = {
            quizId,
            userAnswer: selectedAnswer,
            correctAnswer: quizQuestions[currentQuestion].correct_answer,
            correct: isCorrect,
        }

        setScore(newScore)
        setAnswerHistory((prev) => [...prev, newAnswerEntry])

        setCurrentQuestion(nextQuestion)
        setSelectedAnswer('')
        setAnswered(false)
        setHighlightedOption(null)

        try {
            const response = await fetch('/api/quiz', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quizId,
                    currentQuestion: nextQuestion,
                    score: newScore,
                    completed: nextQuestion >= quizQuestions.length,
                    answerHistory: [...answerHistory, newAnswerEntry],
                }),
            })

            if (!response.ok) {
                const errorData = await response.text()
                console.error('Quiz API error response:', errorData)
                throw new Error(
                    `API call failed: ${response.status} - ${errorData}`
                )
            }
        } catch (error) {
            console.error('Error saving quiz progress:', error)

            alert(
                `Failed to save quiz progress: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your internet connection and try again.`
            )

            setScore(score)
            setAnswerHistory(answerHistory)
            setCurrentQuestion(currentQuestion)
            setSelectedAnswer(selectedAnswer)
            setAnswered(true)
            setHighlightedOption(selectedAnswer)
        }

        setIsSubmitting(false)
    }, [
        currentQuestion,
        quizQuestions,
        selectedAnswer,
        score,
        quizId,
        answerHistory,
        nextQuestion,
        isSubmitting,
    ])

    const handleRestart = async () => {
        setAnswerHistory([])

        await fetch('/api/quiz', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quizId,
                currentQuestion: 0,
                score: 0,
                completed: false,
                answerHistory: [],
            }),
        })
        setCurrentQuestion(0)
        setScore(0)
        setAnswered(false)
        setHighlightedOption(null)
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isCompleted) return

            const key = event.key

            if (key === 'Enter') {
                if (answered && !isSubmitting) {
                    handleNextQuestion()
                } else if (highlightedOption && !answered) {
                    handleSubmitAnswer()
                }
                return
            }

            if (!answered) {
                if (
                    key === '1' &&
                    quizQuestions[currentQuestion].options.length >= 1
                ) {
                    setHighlightedOption(
                        quizQuestions[currentQuestion].options[0]
                    )
                }
                if (
                    key === '2' &&
                    quizQuestions[currentQuestion].options.length >= 2
                ) {
                    setHighlightedOption(
                        quizQuestions[currentQuestion].options[1]
                    )
                }
                if (
                    key === '3' &&
                    quizQuestions[currentQuestion].options.length >= 3
                ) {
                    setHighlightedOption(
                        quizQuestions[currentQuestion].options[2]
                    )
                }
                if (
                    key === '4' &&
                    quizQuestions[currentQuestion].options.length >= 4
                ) {
                    setHighlightedOption(
                        quizQuestions[currentQuestion].options[3]
                    )
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [
        handleNextQuestion,
        handleSubmitAnswer,
        quizQuestions,
        currentQuestion,
        selectedAnswer,
        isCompleted,
        isSubmitting,
        answered,
        highlightedOption,
    ])

    const Progress = ({
        value,
        className,
        indicatorClassName,
    }: {
        value: number
        className?: string
        indicatorClassName?: string
    }) => {
        return (
            <div
                className={`relative w-full overflow-hidden ${className || ''}`}
            >
                <div
                    className={`h-full ${indicatorClassName || ''}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        )
    }

    return isCompleted ? (
        <div className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-100 to-pink-200 p-6'>
            <div className='w-full max-w-2xl rounded-md border border-pink-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm'>
                <h2 className='mb-6 text-center text-4xl font-bold text-pink-700'>
                    Quiz complete!
                </h2>
                <Image
                    src='/gifs/quiz-complete.gif'
                    alt='Quiz complete'
                    width={0}
                    height={0}
                    className='h-auto w-full'
                    loading='lazy'
                />
                <p className='my-6 text-center text-xl'>
                    Your score:{' '}
                    <span className='font-bold text-pink-700'>
                        {score}/{quizQuestions.length}
                    </span>
                </p>
                <div className='flex flex-col items-center gap-4'>
                    <div className='flex flex-col gap-4 md:flex-row'>
                        <Button
                            onClick={handleRestart}
                            className='w-64 rounded-md bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-2 text-white shadow-md transition-all hover:from-pink-600 hover:to-pink-700 hover:shadow-lg md:w-36'
                        >
                            Play again
                        </Button>
                        <Button
                            asChild
                            className='w-64 rounded-md bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-2 text-white shadow-md transition-all hover:from-pink-600 hover:to-pink-700 hover:shadow-lg md:w-36'
                        >
                            <Link href={`/quiz`}>New Quiz</Link>
                        </Button>
                    </div>
                    <div className='flex flex-col gap-4 md:flex-row'>
                        {user ? (
                            <>
                                <Button
                                    asChild
                                    variant='outline'
                                    className='w-64 border-pink-300 text-pink-600 hover:bg-pink-200/50 md:w-36'
                                >
                                    <Link href='/leaderboard'>Leaderboard</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant='outline'
                                    className='w-64 border-pink-300 text-pink-600 hover:bg-pink-200/50 md:w-36'
                                >
                                    <Link href='/dashboard'>
                                        Back to Dashboard
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <Button
                                asChild
                                variant='outline'
                                className='w-64 border-pink-300 text-pink-600 hover:bg-pink-200/50 md:w-36'
                            >
                                <Link href='/'>Back to Home</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className='quiz-game min-h-screen text-white'>
            <div className='dotted pointer-events-none absolute top-0 left-0 h-[100%] w-[100%] opacity-40' />
            {/* Quiz Header */}
            <div className='mx-auto px-4 py-6'>
                <div
                    className={`${bebasNeue.className} flex items-center justify-between px-8`}
                >
                    <div className='w-1/3 text-center text-lg md:text-right md:text-5xl'>
                        QUESTION {currentQuestion + 1} / {quizQuestions.length}
                    </div>
                    <div className='flex w-1/3 items-center justify-center gap-2'>
                        <Image
                            src='/images/logo.png'
                            alt='aespa Logo'
                            width={100}
                            height={100}
                        />
                        <span
                            className={`${bebasNeue.className} text-lg md:text-5xl`}
                        >
                            QUIZ
                        </span>
                    </div>
                    <div className='w-1/3 text-center text-lg md:text-left md:text-5xl'>
                        SCORE {score}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className='fixed right-0 bottom-0 left-0'>
                <Progress
                    value={(currentQuestion / quizQuestions.length) * 100}
                    className='h-4 bg-pink-200'
                    indicatorClassName='bg-pink-700'
                />
            </div>

            {/* Quiz Content */}
            <div className='flex h-[80vh] items-center justify-center px-4 py-12'>
                <div className='relative mx-auto max-w-3xl'>
                    {/* Question */}
                    <h2
                        className={`${bebasNeue.className} text-center text-4xl font-bold md:text-7xl`}
                    >
                        {quizQuestions[currentQuestion].question}
                    </h2>

                    <div className='relative overflow-hidden py-4'>
                        {quizQuestions[currentQuestion].image && (
                            <div className='flex justify-center'>
                                <Image
                                    src={
                                        quizQuestions[currentQuestion].image ||
                                        '/default-image.png'
                                    }
                                    alt='Question Image'
                                    width={1000}
                                    height={1000}
                                    quality={100}
                                    className='mb-4 h-auto w-full rounded-md'
                                    priority
                                />
                            </div>
                        )}
                    </div>

                    {/* Options Grid */}
                    <div className='md:h-[150px*: grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {quizQuestions[currentQuestion].options.map(
                            (option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={answered}
                                    className={`group relative cursor-pointer overflow-hidden rounded-md border-2 p-4 text-left transition-all ${
                                        answered &&
                                        option ===
                                            quizQuestions[currentQuestion]
                                                .correct_answer
                                            ? 'border-green-700 bg-green-700/20'
                                            : answered &&
                                                option === selectedAnswer
                                              ? 'border-red-700 bg-red-700/20'
                                              : option === highlightedOption
                                                ? 'border-purple-700 bg-purple-700/20'
                                                : 'border-[#6d6d6d2a] bg-zinc-950'
                                    }`}
                                >
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                answered &&
                                                option ===
                                                    quizQuestions[
                                                        currentQuestion
                                                    ].correct_answer
                                                    ? 'bg-green-700'
                                                    : answered &&
                                                        option ===
                                                            selectedAnswer
                                                      ? 'bg-red-700'
                                                      : option ===
                                                          highlightedOption
                                                        ? 'bg-purple-700'
                                                        : 'bg-purple-700'
                                            }`}
                                        >
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className='text-lg'>
                                            {option}
                                        </span>
                                    </div>
                                </button>
                            )
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div
                        className={`${bebasNeue.className} mt-8 flex justify-center`}
                    >
                        {!answered ? (
                            <Button
                                onClick={handleSubmitAnswer}
                                disabled={!highlightedOption}
                                className='w-full bg-purple-700 px-12 py-8 text-4xl text-white hover:bg-purple-800 disabled:opacity-50 md:w-auto'
                            >
                                SUBMIT ANSWER
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNextQuestion}
                                className='w-full bg-purple-700 px-12 py-8 text-4xl text-white hover:bg-purple-800 md:w-auto'
                            >
                                {currentQuestion < quizQuestions.length - 1
                                    ? 'NEXT QUESTION'
                                    : 'SEE RESULTS'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
