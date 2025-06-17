import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { calculateLevelProgression } from '@/lib/xp-system'

async function updateLeaderboard(userId: string, username: string, avatar: string) {
    const supabase = await createClient()

    const { data: existingEntry, error: fetchError } = await supabase
        .from('quiz_leaderboard')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
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

async function updateUserXP(userId: string, scoreEarned: number) {
    const supabase = await createClient()

    const { data: currentAccount, error: fetchError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch user account: ${fetchError.message}`)
    }

    if (!currentAccount) {
        const user = await (await clerkClient()).users.getUser(userId)
        const username = user.username || user.emailAddresses[0]?.emailAddress || 'Unknown'
        const avatar = user.imageUrl || '/images/default-avatar.png'

        const progression = calculateLevelProgression(0, 1, scoreEarned)

        const { error: createError } = await supabase
            .from('user_accounts')
            .insert([{
                user_id: userId,
                username,
                avatar,
                total_xp: progression.newTotalXP,
                current_level: progression.newLevel,
                xp_to_next_level: progression.xpToNextLevel,
                total_quizzes_completed: 1,
                total_score: scoreEarned
            }])

        if (createError) {
            throw new Error(`Failed to create user account: ${createError.message}`)
        }
        return
    }

    const progression = calculateLevelProgression(
        currentAccount.total_xp,
        currentAccount.current_level,
        scoreEarned
    )

    const { error: updateError } = await supabase
        .from('user_accounts')
        .update({
            total_xp: progression.newTotalXP,
            current_level: progression.newLevel,
            xp_to_next_level: progression.xpToNextLevel,
            total_quizzes_completed: currentAccount.total_quizzes_completed + 1,
            total_score: currentAccount.total_score + scoreEarned
        })
        .eq('user_id', userId)

    if (updateError) {
        throw new Error(`Failed to update user account: ${updateError.message}`)
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

        if (userId && completed && !existingSession.completed) {
            console.log('Quiz completed by authenticated user, updating leaderboard and XP')
            try {
                await updateLeaderboardAsync(userId)
                
                try {
                    await updateUserXP(userId, score || 0)
                } catch (xpError) {
                    console.error('Failed to update user XP:', xpError)
                }
            } catch (error) {
                console.error('Failed to update leaderboard or XP:', error)
                return NextResponse.json({
                    error: 'Failed to update user progress',
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