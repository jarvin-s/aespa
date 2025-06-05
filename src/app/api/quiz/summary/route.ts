import { createClient } from '@/app/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { userId } = await auth()

    const url = new URL(request.url)
    const quizId = url.searchParams.get('id')

    if (!quizId) {
        return NextResponse.json(
            { error: 'Quiz ID is required' },
            { status: 400 }
        )
    }

    const { data: quizSummary, error: quizSummaryError } = await supabase
        .from('quiz_sessions')
        .select('*, user_id')
        .eq('session_id', quizId)
        .single()

    if (quizSummaryError) {
        return NextResponse.json(
            { error: quizSummaryError.message },
            { status: 500 }
        )
    }

    if (quizSummary.user_id !== userId) {
        return NextResponse.json(
            { error: 'Unauthorized access to quiz details' },
            { status: 403 }
        )
    }

    return NextResponse.json({ quizSummary })
}

export async function DELETE(request: Request) {
    const supabase = await createClient()
    const { userId } = await auth()

    const url = new URL(request.url)
    const quizId = url.searchParams.get('id')

    if (!quizId) {
        return NextResponse.json(
            { error: 'Quiz ID is required' },
            { status: 400 }
        )
    }

    const { data: quizSummary, error: quizSummaryError } = await supabase
        .from('quiz_sessions')
        .select('user_id')
        .eq('session_id', quizId)
        .single()

    if (quizSummaryError) {
        return NextResponse.json(
            { error: quizSummaryError.message },
            { status: 500 }
        )
    }

    if (quizSummary.user_id !== userId) {
        return NextResponse.json(
            { error: 'Unauthorized to delete this quiz' },
            { status: 403 }
        )
    }

    const { error: deleteError } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('session_id', quizId)

    if (deleteError) {
        return NextResponse.json(
            { error: deleteError.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
} 