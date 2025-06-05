'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Bebas_Neue } from 'next/font/google'
import Image from 'next/image'
import localFont from 'next/font/local'
import QuizComplete from '@/components/quiz/quiz-complete'
import { motion, AnimatePresence } from 'motion/react'

const bebasNeue = Bebas_Neue({
    weight: '400',
    subsets: ['latin'],
})

const aespaFont = localFont({
    src: '/../../../public/fonts/aespa_Regular.ttf',
    variable: '--font-aespa',
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
    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion)
    const [score, setScore] = useState(initialScore)
    const [selectedAnswer, setSelectedAnswer] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [answered, setAnswered] = useState(false)
    const [backgroundClass, setBackgroundClass] = useState('quiz-bg-1')
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

    useEffect(() => {
        const bgNumber = Math.floor(Math.random() * 4) + 1
        setBackgroundClass(`quiz-bg-${bgNumber}`)
    }, [])

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

    return isCompleted ? (
        <QuizComplete score={score} totalQuestions={quizQuestions.length} />
    ) : (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`quiz-game ${backgroundClass} min-h-screen text-white`}
        >
            <div className='dotted pointer-events-none absolute top-0 left-0 h-[100%] w-[100%] opacity-40' />
            {/* Quiz Header */}
            <div className='mx-auto px-4 py-6'>
                <div
                    className={`${bebasNeue.className} flex items-center justify-between`}
                >
                    <Link href='/quiz'>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ArrowLeft />
                        </motion.div>
                    </Link>
                    <motion.div
                        className='w-1/3 text-center text-lg md:text-right md:text-5xl'
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        QUESTION &nbsp;
                        <motion.span
                            key={currentQuestion}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className='ml-2 text-purple-500'
                        >
                            {currentQuestion + 1}/{quizQuestions.length}
                        </motion.span>
                    </motion.div>
                    <motion.div
                        className='flex w-1/3 items-center justify-center gap-2'
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Image
                            src='/images/logo.png'
                            alt='aespa Logo'
                            width={150}
                            height={150}
                        />
                    </motion.div>
                    <motion.div
                        className='w-1/3 text-center text-lg md:text-left md:text-5xl'
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        SCORE{' '}
                        <motion.span
                            key={score}
                            initial={{ scale: 1.5 }}
                            animate={{ scale: 1 }}
                            className='ml-2 text-purple-500'
                        >
                            {score}
                        </motion.span>
                    </motion.div>
                </div>
            </div>

            {/* Progress bar */}
            <div className='fixed right-0 bottom-0 left-0 z-1'>
                <motion.div
                    className='h-4 bg-purple-200'
                    style={{
                        width: '100%',
                    }}
                >
                    <motion.div
                        className='h-full bg-purple-700'
                        initial={{
                            width: `${(currentQuestion / quizQuestions.length) * 100}%`,
                        }}
                        animate={{
                            width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                        }}
                        transition={{ duration: 0.5 }}
                    />
                </motion.div>
            </div>

            {/* Quiz Content */}
            <div className='flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12'>
                <motion.div
                    className='relative mx-auto w-full max-w-3xl'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Question */}
                    <AnimatePresence mode='wait'>
                        <motion.h2
                            key={currentQuestion}
                            initial={{ x: 100, y: 100, opacity: 0 }}
                            animate={{ x: 0, y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            exit={{ x: -100, y: -100, opacity: 0 }}
                            className={`${bebasNeue.className} text-center text-5xl font-bold md:text-7xl`}
                        >
                            {quizQuestions[currentQuestion].question}
                        </motion.h2>
                    </AnimatePresence>

                    <div className='relative overflow-hidden py-4'>
                        {quizQuestions[currentQuestion].image && (
                            <motion.div
                                className='flex justify-center'
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1.5, duration: 0.5 }}
                            >
                                <Image
                                    src={
                                        quizQuestions[currentQuestion].image ||
                                        '/default-image.png'
                                    }
                                    alt='Question Image'
                                    width={1000}
                                    height={1000}
                                    quality={100}
                                    className='mb-4 h-auto max-h-[40vh] w-full rounded-md object-contain'
                                    priority
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* Options Grid */}
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        {quizQuestions[currentQuestion].options.map(
                            (option, index) => (
                                <motion.button
                                    key={option}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.2 + 1.5 }}
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
                                                ? 'border-purple-700 bg-purple-700/20 hover:scale-105'
                                                : 'border-[#6d6d6d2a] bg-zinc-950 hover:scale-105'
                                    }`}
                                >
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
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
                                        <span className='text-base sm:text-lg'>
                                            {option}
                                        </span>
                                    </div>
                                </motion.button>
                            )
                        )}
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        className={`${aespaFont.className} mt-8 flex justify-center`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        {!answered ? (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={handleSubmitAnswer}
                                    disabled={!highlightedOption}
                                    className='w-full bg-purple-700 px-12 py-8 text-4xl text-white hover:bg-purple-800 disabled:opacity-50 md:w-auto'
                                >
                                    submit answer
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={handleNextQuestion}
                                    className='w-full bg-purple-700 px-12 py-8 text-4xl text-white hover:bg-purple-800 md:w-auto'
                                >
                                    {currentQuestion < quizQuestions.length - 1
                                        ? 'next question'
                                        : 'see results'}
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
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
