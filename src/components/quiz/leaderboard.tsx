'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Bebas_Neue } from 'next/font/google'

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
                <div className='absolute top-10 left-4 md:top-14 md:left-8'>
                    <Link href='/quiz'>
                        <ArrowLeft />
                    </Link>
                </div>
                <h1
                    className={`${bebasNeue.className} mb-8 text-center text-7xl font-bold`}
                >
                    Leaderboard
                </h1>

                {/* Top 3 Players Cards */}
                {leaderboardData.length > 0 && (
                    <div className='mb-8'>
                        <h2 className='mb-6 text-center text-2xl font-bold text-purple-700'>
                            Top players
                        </h2>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                            {/* First Place */}
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
                                        <h3 className='mb-2 text-2xl font-bold text-yellow-700'>
                                            {leaderboardData[0].username}
                                        </h3>
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

                            {/* Second Place */}
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
                                        <h3 className='mb-2 text-xl font-bold text-gray-700'>
                                            {leaderboardData[1].username}
                                        </h3>
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

                            {/* Third Place */}
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
                                        <h3 className='mb-2 text-xl font-bold text-orange-700'>
                                            {leaderboardData[2].username}
                                        </h3>
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
                                        Username
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Score
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Quizzes taken
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs uppercase'>
                                        Average score
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
                                                    {entry.username.toLowerCase()}
                                                    {isCurrentUser && (
                                                        <span className='ml-2 rounded-full bg-purple-700 px-2 py-1 text-xs text-white'>
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                {entry.score.toLocaleString()}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                {entry.quizzesTaken}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                {entry.quizzesTaken > 0
                                                    ? (
                                                          entry.score /
                                                          entry.quizzesTaken
                                                      ).toFixed(1)
                                                    : '0.0'}
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

const ArrowLeft = () => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
        >
            <path
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='m12 19l-7-7l7-7m7 7H5'
            />
        </svg>
    )
}
