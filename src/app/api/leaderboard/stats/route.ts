import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { userId } = await auth()

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
            return NextResponse.json({
                stats: {
                    totalUsers: 0,
                    totalQuizzes: 0,
                    averageScore: 0,
                    topScore: 0,
                    userStats: null
                }
            })
        }

        const { data: usernames, error: usernamesError } = await supabase
            .from('quiz_leaderboard')
            .select('user_id, username')
            .not('user_id', 'is', null)

        if (usernamesError) {
            return NextResponse.json(
                { error: usernamesError.message },
                { status: 500 }
            )
        }

        const usernameMap = usernames?.reduce((acc: { [key: string]: string }, entry) => {
            acc[entry.user_id] = entry.username
            return acc
        }, {}) || {}

        const userStats: { [key: string]: { totalScore: number; quizzesTaken: number; username: string } } = {}

        quizSessions.forEach(session => {
            if (!userStats[session.user_id]) {
                userStats[session.user_id] = {
                    totalScore: 0,
                    quizzesTaken: 0,
                    username: usernameMap[session.user_id] || 'Unknown user'
                }
            }
            userStats[session.user_id].totalScore += session.score || 0
            userStats[session.user_id].quizzesTaken += 1
        })

        const sortedUserStats = Object.entries(userStats)
            .map(([userId, stats]) => ({
                userId,
                username: stats.username,
                totalScore: stats.totalScore,
                quizzesTaken: stats.quizzesTaken
            }))
            .sort((a, b) => b.totalScore - a.totalScore)

        const totalUsers = sortedUserStats.length
        const totalQuizzes = quizSessions.length
        const totalScore = sortedUserStats.reduce((sum, entry) => sum + entry.totalScore, 0)
        const averageScore = totalUsers > 0 ? totalScore / quizSessions.length : 0
        const topScore = sortedUserStats.length > 0 ? sortedUserStats[0].totalScore : 0

        let currentUserStats = null
        if (userId) {
            const userIndex = sortedUserStats.findIndex(entry => entry.userId === userId)
            if (userIndex !== -1) {
                const userEntry = sortedUserStats[userIndex]
                currentUserStats = {
                    score: userEntry.totalScore,
                    quizzesTaken: userEntry.quizzesTaken,
                    rank: userIndex + 1
                }
            }
        }

        const stats = {
            totalUsers,
            totalQuizzes,
            averageScore,
            topScore,
            userStats: currentUserStats
        }

        return NextResponse.json({ stats })
    } catch (error) {
        console.error('Error fetching leaderboard stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard stats' },
            { status: 500 }
        )
    }
} 