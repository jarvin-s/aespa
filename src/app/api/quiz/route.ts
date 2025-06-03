import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
    const supabase = await createClient()

    const { data: questions, error } = await supabase
        .from('random_questions')
        .select('*')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!questions || questions.length === 0) {
        return NextResponse.json({ error: 'No questions found for the specified locale.' }, { status: 404 });
    }

    return NextResponse.json({ questions });
}

export async function PUT(request: Request) {

    try {
        const supabase = await createClient()

        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        const { quizId, currentQuestion, score, completed, answerHistory } = body

        if (!quizId) {
            return NextResponse.json({ error: 'Quiz ID required' }, { status: 400 })
        }

        const { data: existingSession } = await supabase
            .from('quiz_sessions')
            .select('completed, score')
            .eq('session_id', quizId)
            .single()

        if (!existingSession) {
            return new Response('Session not found', { status: 404 })
        }

        const updateData: {
            current_question?: number
            score?: number
            completed?: boolean
            answer_history?: Array<{
                quizId: string
                userAnswer: string
                correctAnswer: string
                correct: boolean
            }>
        } = {}

        if (currentQuestion !== undefined) updateData.current_question = currentQuestion
        if (score !== undefined) updateData.score = score
        if (completed !== undefined) updateData.completed = completed
        if (answerHistory !== undefined) updateData.answer_history = answerHistory

        const { error } = await supabase
            .from('quiz_sessions')
            .update(updateData)
            .eq('session_id', quizId)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}