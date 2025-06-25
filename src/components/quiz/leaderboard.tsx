'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { Bebas_Neue } from 'next/font/google'
import { motion } from 'motion/react'

const bebasNeue = Bebas_Neue({
    subsets: ['latin'],
    weight: ['400'],
})
interface LeaderboardEntry {
    rank: number
    username: string
    score: number
    quizzesTaken: number
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
}

interface LeaderboardStats {
    totalUsers: number
    totalQuizzes: number
    averageScore: number
    topScore: number
    userRank?: number
    userStats?: {
        score: number
        quizzesTaken: number
        rank: number
    }
}

export default function Leaderboard() {
    const { user } = useUser()
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
        []
    )
    const [stats, setStats] = useState<LeaderboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const leaderboardResponse = await fetch(`/api/leaderboard`)
                if (!leaderboardResponse.ok) {
                    throw new Error('Failed to fetch leaderboard data')
                }
                const leaderboardData = await leaderboardResponse.json()
                setLeaderboardData(leaderboardData.leaderboard)

                const statsResponse = await fetch(`/api/leaderboard/stats`)
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json()
                    setStats(statsData.stats)
                }
            } catch (error) {
                console.error('Error fetching leaderboard data:', error)
                setError(
                    'Failed to load leaderboard data. Please try again later.'
                )
            } finally {
                setIsLoading(false)
            }
        }

        fetchLeaderboardData()
    }, [])

    if (isLoading) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='flex items-center justify-center space-x-2'>
                    <div className='h-10 w-10 animate-spin rounded-full border-2 border-purple-700 border-t-transparent' />
                    <span className='text-3xl font-bold text-white'>
                        Loading
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className='quiz-leaderboard'>
            <div className='mx-auto min-h-screen max-w-7xl px-4 py-8 text-white'>
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='relative flex w-full justify-center px-6 py-4 text-white'
                >
                    <h1
                        className={`${bebasNeue.className} text-7xl font-bold md:text-9xl`}
                    >
                        Leaderboard
                    </h1>
                </motion.header>

                {/* Top 3 Players Cards */}
                {leaderboardData.length > 0 && (
                    <div className='mb-8'>
                        <h2
                            className={`${bebasNeue.className} mb-10 text-center text-5xl font-bold text-purple-500 md:text-6xl`}
                        >
                            Top players
                        </h2>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                            {/* First place */}
                            {leaderboardData[0] && (
                                <div className='relative order-1 flex flex-col items-center md:order-2 md:col-start-2 md:-mt-4'>
                                    <div className='absolute -top-4 text-4xl'>
                                        👑
                                    </div>
                                    <div className='w-full rounded-lg border-2 border-yellow-400 bg-gradient-to-b from-yellow-50 to-yellow-100 p-8 text-center'>
                                        <div className='mb-4 flex justify-center'>
                                            <Image
                                                src={leaderboardData[0].avatar}
                                                alt={`${leaderboardData[0].username}'s avatar`}
                                                width={70}
                                                height={70}
                                                className='rounded-full border-4 border-yellow-400'
                                                priority
                                            />
                                        </div>
                                        <div className='mb-2 flex items-center justify-center gap-2'>
                                            {leaderboardData[0].badges &&
                                                leaderboardData[0].badges
                                                    .length > 0 && (
                                                    <div className='flex gap-1'>
                                                        {leaderboardData[0].badges.map(
                                                            (badge) => (
                                                                <div
                                                                    key={
                                                                        badge.id
                                                                    }
                                                                    className='group relative'
                                                                >
                                                                    <Image
                                                                        src={
                                                                            badge.image
                                                                        }
                                                                        alt={
                                                                            badge.title
                                                                        }
                                                                        width={
                                                                            40
                                                                        }
                                                                        height={
                                                                            40
                                                                        }
                                                                    />
                                                                    <div className='absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100'>
                                                                        {
                                                                            badge.title
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            <h3 className='text-3xl font-bold text-yellow-700'>
                                                {leaderboardData[0].username}
                                            </h3>
                                        </div>
                                        <div className='flex justify-center gap-2'>
                                            <p className='text-md text-yellow-700'>
                                                Level{' '}
                                                {
                                                    leaderboardData[0]
                                                        .current_level
                                                }
                                            </p>
                                            <p className='text-md text-yellow-700'>
                                                - ({leaderboardData[0].total_xp}
                                                XP)
                                            </p>
                                        </div>
                                        <p className='text-4xl font-bold text-purple-600'>
                                            {leaderboardData[0].score.toLocaleString()}
                                        </p>
                                        <p className='mt-2 text-sm text-yellow-700'>
                                            {leaderboardData[0].quizzesTaken}{' '}
                                            quizzes completed
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Second place */}
                            {leaderboardData[1] && (
                                <div className='relative order-2 flex flex-col items-center md:order-1'>
                                    <div className='absolute -top-4 text-4xl'>
                                        🥈
                                    </div>
                                    <div className='w-full rounded-lg border-2 border-gray-300 bg-white p-6 pt-8 text-center'>
                                        <div className='mb-4 flex justify-center'>
                                            <Image
                                                src={leaderboardData[1].avatar}
                                                alt={`${leaderboardData[1].username}'s avatar`}
                                                width={70}
                                                height={70}
                                                className='rounded-full border-4 border-gray-300'
                                                priority
                                            />
                                        </div>
                                        <h3 className='mb-2 text-3xl font-bold text-gray-700'>
                                            {leaderboardData[1].username}
                                        </h3>
                                        <div className='mb-2 flex justify-center gap-1'>
                                            <p className='text-md text-gray-700'>
                                                Level{' '}
                                                {
                                                    leaderboardData[1]
                                                        .current_level
                                                }
                                            </p>
                                            <p className='text-md text-gray-700'>
                                                - ({leaderboardData[1].total_xp}{' '}
                                                XP)
                                            </p>
                                        </div>
                                        <p className='text-3xl font-bold text-purple-600'>
                                            {leaderboardData[1].score.toLocaleString()}
                                        </p>
                                        <p className='mt-2 text-sm text-gray-600'>
                                            {leaderboardData[1].quizzesTaken}{' '}
                                            quizzes completed
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Third place */}
                            {leaderboardData[2] && (
                                <div className='relative order-3 flex flex-col items-center md:order-3'>
                                    <div className='absolute -top-4 text-4xl'>
                                        🥉
                                    </div>
                                    <div className='w-full rounded-lg border-2 border-orange-300 bg-gradient-to-b from-orange-50 to-orange-100 p-6 pt-8 text-center'>
                                        <div className='mb-4 flex justify-center'>
                                            <Image
                                                src={leaderboardData[2].avatar}
                                                alt={`${leaderboardData[2].username}'s avatar`}
                                                width={70}
                                                height={70}
                                                className='rounded-full border-4 border-orange-300'
                                                priority
                                            />
                                        </div>
                                        <h3 className='mb-2 text-3xl font-bold text-orange-700'>
                                            {leaderboardData[2].username}
                                        </h3>
                                        <div className='mb-2 flex justify-center gap-1'>
                                            <p className='text-md text-orange-700'>
                                                Level{' '}
                                                {
                                                    leaderboardData[2]
                                                        .current_level
                                                }
                                            </p>
                                            <p className='text-md text-orange-700'>
                                                - ({leaderboardData[2].total_xp}{' '}
                                                XP)
                                            </p>
                                        </div>
                                        <p className='text-3xl font-bold text-purple-600'>
                                            {leaderboardData[2].score.toLocaleString()}
                                        </p>
                                        <p className='mt-2 text-sm text-orange-700'>
                                            {leaderboardData[2].quizzesTaken}{' '}
                                            quizzes completed
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className='flex min-h-[200px] items-center justify-center'>
                        <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2 text-purple-700'></div>
                    </div>
                ) : error ? (
                    <div className='text-center text-red-500'>{error}</div>
                ) : leaderboardData.length === 0 ? (
                    <div className='text-muted-foreground text-center'>
                        No leaderboard data available.
                    </div>
                ) : (
                    /* Leaderboard Table */
                    <div className='bg-card mb-8 overflow-auto rounded-md'>
                        <table className='w-full'>
                            <thead className='bg-purple-950 font-bold text-white'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Rank
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Level
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Username
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Badges
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Score
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Quizzes taken
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-muted divide-y bg-white text-black'>
                                {leaderboardData.map((entry) => {
                                    const isCurrentUser =
                                        user &&
                                        entry.username ===
                                            (user.username ||
                                                user.emailAddresses[0]
                                                    ?.emailAddress)
                                    return (
                                        <tr
                                            key={entry.rank}
                                            className={`hover:bg-muted/50 transition-colors duration-200 ${entry.rank === 1 ? 'bg-purple-200' : ''} ${isCurrentUser ? 'border-l-4 border-purple-900 bg-purple-200' : ''} `}
                                        >
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center'>
                                                    {entry.rank === 1 && '👑 '}
                                                    {entry.rank === 2 && '🥈 '}
                                                    {entry.rank === 3 && '🥉 '}
                                                    {entry.rank}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center'>
                                                    {entry.current_level}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center'>
                                                    {entry.username.toLowerCase()}
                                                    {isCurrentUser && (
                                                        <span className='ml-2 rounded-full bg-purple-700 px-2 py-1 text-xs text-white'>
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center gap-2'>
                                                    {entry.badges &&
                                                        entry.badges.map(
                                                            (badge) => (
                                                                <div
                                                                    key={
                                                                        badge.id
                                                                    }
                                                                    className='group relative'
                                                                >
                                                                    <Image
                                                                        src={
                                                                            badge.image
                                                                        }
                                                                        alt={
                                                                            badge.title
                                                                        }
                                                                        width={
                                                                            16
                                                                        }
                                                                        height={
                                                                            16
                                                                        }
                                                                    />
                                                                    <div className='absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100'>
                                                                        {
                                                                            badge.title
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                {entry.score.toLocaleString()}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                {entry.quizzesTaken}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Stats Cards */}
                {stats && (
                    <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <div className='bg-card rounded-lg bg-white p-6'>
                            <h3 className='text-sm font-bold text-purple-700'>
                                Total participants
                            </h3>
                            <p className='text-2xl text-black'>
                                {stats.totalUsers}
                            </p>
                        </div>
                        <div className='bg-card rounded-lg bg-white p-6'>
                            <h3 className='text-sm font-bold text-purple-700'>
                                Total quizzes taken
                            </h3>
                            <p className='text-2xl text-black'>
                                {stats.totalQuizzes}
                            </p>
                        </div>
                        <div className='bg-card rounded-lg bg-white p-6'>
                            <h3 className='text-sm font-bold text-purple-700'>
                                Average score
                            </h3>
                            <p className='text-2xl text-black'>
                                {stats.averageScore.toFixed(1)}
                            </p>
                        </div>
                        <div className='bg-card rounded-lg bg-white p-6'>
                            <h3 className='text-sm font-bold text-purple-700'>
                                Highest score
                            </h3>
                            <p className='text-2xl text-black'>
                                {stats.topScore}
                            </p>
                        </div>
                    </div>
                )}

                {/* User Stats (if logged in) */}
                {user && stats?.userStats && (
                    <div className='mb-8 rounded-lg border border-purple-200 bg-white p-6'>
                        <h3 className='mb-4 text-lg font-semibold text-purple-700'>
                            Your stats
                        </h3>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='text-center'>
                                <p className='text-2xl font-bold text-black'>
                                    #{stats.userStats.rank}
                                </p>
                                <p className='text-sm text-purple-700'>
                                    Your rank
                                </p>
                            </div>
                            <div className='text-center'>
                                <p className='text-2xl font-bold text-black'>
                                    {stats.userStats.score}
                                </p>
                                <p className='text-sm text-purple-700'>
                                    Total score
                                </p>
                            </div>
                            <div className='text-center'>
                                <p className='text-2xl font-bold text-black'>
                                    {stats.userStats.quizzesTaken}
                                </p>
                                <p className='text-sm text-purple-700'>
                                    Quizzes taken
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
