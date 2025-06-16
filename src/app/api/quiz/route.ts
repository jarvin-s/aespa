import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

async function updateLeaderboard(userId: string, username: string, avatar: string) {
    const supabase = await createClient()

    const { data: existingEntry, error: fetchError } = await supabase
        .from('quiz_leaderboard')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {  // PGRST116 is "not found" error
        throw new Error(`Failed to check existing leaderboard entry: ${fetchError.message}`)
    }

    if (!existingEntry) {
        const { error: insertError } = await supabase
            .from('quiz_leaderboard')
            .insert({
                user_id: userId,
                username: username,
                avatar: avatar
            })

        if (insertError) {
            throw new Error(`Failed to insert leaderboard entry: ${insertError.message}`)
        }
    }
}

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const questionCount = Number(searchParams.get('questions')) || 10

    const { data: questions, error } = await supabase
        .from('random_questions')
        .select('*')
        .limit(questionCount)

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

        // Only update leaderboard if user is authenticated and quiz is newly completed
        if (userId && completed && !existingSession.completed) {
            console.log('Quiz completed by authenticated user, updating leaderboard')
            try {
                await updateLeaderboardAsync(userId)
            } catch (error) {
                console.error('Failed to update leaderboard:', error)
                return NextResponse.json({
                    error: 'Failed to update leaderboard',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

async function updateLeaderboardAsync(userId: string) {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const username = user.username || user.emailAddresses[0]?.emailAddress || 'Anonymous'
    const avatar = user.imageUrl || '/images/default-avatar.png'
    await updateLeaderboard(userId, username, avatar)
}