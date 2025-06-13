import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: quizSessions, error: sessionsError } = await supabase
            .from('quiz_sessions')
            .select('user_id, score')
            .eq('completed', true)
            .not('user_id', 'is', null)

        if (sessionsError) {
            return NextResponse.json(
                { error: sessionsError.message },
                { status: 500 }
            )
        }

        if (!quizSessions || quizSessions.length === 0) {
            return NextResponse.json({ leaderboard: [] })
        }

        const { data: usernames, error: usernamesError } = await supabase
            .from('quiz_leaderboard')
            .select('user_id, username, avatar')
            .not('user_id', 'is', null)

        if (usernamesError) {
            return NextResponse.json(
                { error: usernamesError.message },
                { status: 500 }
            )
        }

        const usernameMap = usernames?.reduce((acc: { [key: string]: { username: string; avatar: string } }, entry) => {
            acc[entry.user_id] = {
                username: entry.username,
                avatar: entry.avatar || '/images/default-avatar.png'
            }
            return acc
        }, {}) || {}

        const userStats: { [key: string]: { totalScore: number; quizzesTaken: number; username: string; avatar: string } } = {}

        quizSessions.forEach(session => {
            if (!userStats[session.user_id]) {
                userStats[session.user_id] = {
                    totalScore: 0,
                    quizzesTaken: 0,
                    username: usernameMap[session.user_id]?.username || 'Unknown user',
                    avatar: usernameMap[session.user_id]?.avatar || '/images/default-avatar.png'
                }
            }
            userStats[session.user_id].totalScore += session.score || 0
            userStats[session.user_id].quizzesTaken += 1
        })

        const leaderboard = Object.entries(userStats)
            .map(([userId, stats]) => ({
                userId,
                username: stats.username,
                score: stats.totalScore,
                quizzesTaken: stats.quizzesTaken,
                avatar: stats.avatar
            }))
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
                rank: index + 1,
                username: entry.username,
                score: entry.score,
                quizzesTaken: entry.quizzesTaken,
                avatar: entry.avatar
            }))

        return NextResponse.json({ leaderboard })
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard data' },
            { status: 500 }
        )
    }
} 