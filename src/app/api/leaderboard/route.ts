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

        const { data: userAccounts, error: userAccountsError } = await supabase
            .from('user_accounts')
            .select('user_id, username, current_level, total_xp, total_quizzes_completed')
            .not('user_id', 'is', null)

        if (userAccountsError) {
            return NextResponse.json(
                { error: userAccountsError.message },
                { status: 500 }
            )
        }

        const { data: badges, error: badgesError } = await supabase
            .from('badges')
            .select('*')

        if (badgesError) {
            return NextResponse.json(
                { error: badgesError.message },
                { status: 500 }
            )
        }

        const { data: userBadges, error: userBadgesError } = await supabase
            .from('user_badges')
            .select('user_id, badge_id')

        if (userBadgesError) {
            return NextResponse.json(
                { error: userBadgesError.message },
                { status: 500 }
            )
        }

        const userBadgesMap = userBadges?.reduce((acc: { [key: string]: number[] }, entry) => {
            if (!acc[entry.user_id]) {
                acc[entry.user_id] = []
            }
            acc[entry.user_id].push(entry.badge_id)
            return acc
        }, {}) || {}

        const usernameMap = usernames?.reduce((acc: { [key: string]: { username: string; avatar: string } }, entry) => {
            acc[entry.user_id] = {
                username: entry.username,
                avatar: entry.avatar || '/images/default-avatar.png'
            }
            return acc
        }, {}) || {}

        const userStats: { [key: string]: { 
            totalScore: number
            quizzesTaken: number
            username: string
            avatar: string
            current_level: number
            total_xp: number
            total_quizzes_completed: number
            badges: Array<{
                id: number
                title: string
                description: string
                image: string
            }>
        } } = {}

        quizSessions.forEach(session => {
            if (!userStats[session.user_id]) {
                const userAccount = userAccounts?.find(user => user.user_id === session.user_id)
                const userBadgeIds = userBadgesMap[session.user_id] || []
                const userBadges = badges?.filter(badge => userBadgeIds.includes(badge.id)) || []

                userStats[session.user_id] = {
                    totalScore: 0,
                    quizzesTaken: 0,
                    username: usernameMap[session.user_id]?.username || 'Unknown user',
                    avatar: usernameMap[session.user_id]?.avatar || '/images/default-avatar.png',
                    current_level: userAccount?.current_level || 0,
                    total_xp: userAccount?.total_xp || 0,
                    total_quizzes_completed: userAccount?.total_quizzes_completed || 0,
                    badges: userBadges
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
                avatar: stats.avatar,
                current_level: stats.current_level,
                total_xp: stats.total_xp,
                total_quizzes_completed: stats.total_quizzes_completed,
                badges: stats.badges
            }))
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
                rank: index + 1,
                username: entry.username,
                score: entry.score,
                quizzesTaken: entry.quizzesTaken,
                avatar: entry.avatar,
                current_level: entry.current_level,
                total_xp: entry.total_xp,
                total_quizzes_completed: entry.total_quizzes_completed,
                badges: entry.badges
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