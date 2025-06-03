import { createClient } from '@/app/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { userId } = await auth()

    const { data: pastQuizzes, error: pastQuizzesError } = await supabase
        .from('quiz_sessions')
        .select('session_id, score, current_question, completed, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (pastQuizzesError) {
        return NextResponse.json(
            { error: pastQuizzesError.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ pastQuizzes })
}
