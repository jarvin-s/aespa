'use client'

import React, { use, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import Game from '@/components/quiz/game'
import { useUser } from '@clerk/nextjs'

interface QuizSession {
    current_question: number
    score: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questions: any[]
    answer_history: Array<{
        quizId: string
        userAnswer: string
        correctAnswer: string
        correct: boolean
    }>
}

export default function GamePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<QuizSession | null>(null)
    const supabase = createClient()
    const router = useRouter()
    const { user } = useUser()
    const { id } = use(params)
    const hasFetched = useRef(false)

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true

        async function fetchSession() {
            const { data: existingSession } = await supabase
                .from('quiz_sessions')
                .select('*')
                .eq('session_id', id)
                .single()

            if (existingSession) {
                setSession(existingSession)
                setQuestions(existingSession.questions)
            } else {
                const response = await fetch(`/api/quiz`)
                const data = await response.json()
                const newQuestions = data.questions

                if (response.ok) {
                    const { data: newSession } = await supabase
                        .from('quiz_sessions')
                        .insert([
                            {
                                session_id: id,
                                questions: newQuestions,
                                current_question: 0,
                                score: 0,
                                completed: false,
                                answer_history: [],
                                user_id: user?.id,
                            },
                        ])
                        .select()
                        .single()

                    setSession(newSession)
                    setQuestions(newQuestions)
                }
            }
            setLoading(false)
        }

        fetchSession()
    }, [id, supabase, router, user])

    if (loading) {
        return (
            <div className='quiz-game flex min-h-screen items-center justify-center bg-black'>
                <div className='flex items-center space-x-2'>
                    <div className='h-4 w-4 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]'></div>
                    <div className='h-4 w-4 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]'></div>
                    <div className='h-4 w-4 animate-bounce rounded-full bg-purple-400'></div>
                    <span className='text-4xl font-bold text-purple-400'>
                        Loading...
                    </span>
                </div>
            </div>
        )
    }

    return (
        <Game
            questions={questions}
            quizId={id}
            initialQuestion={session?.current_question || 0}
            initialScore={session?.score || 0}
            initialAnswerHistory={session?.answer_history || []}
        />
    )
}
