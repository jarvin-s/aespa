import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { CardContent } from '../ui/card'
import { motion } from 'motion/react'
import { calculateXPFromScore, getLevelProgressInfo } from '@/lib/xp-system'

interface QuizCompleteProps {
    score: number
    totalQuestions: number
}

interface UserProgress {
    xpEarned: number
    newLevel: number
    previousLevel: number
    currentXP: number
    xpToNextLevel: number
    progressPercentage: number
    aenergyEarned: number
}

const QuizComplete = ({ score }: QuizCompleteProps) => {
    const { user } = useUser()
    const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserProgress = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            const expectedXPEarned = calculateXPFromScore(score)

            await new Promise((resolve) => setTimeout(resolve, 1000))

            let retryCount = 0
            const maxRetries = 3

            while (retryCount < maxRetries) {
                try {
                    const response = await fetch('/api/user-account')
                    if (response.ok) {
                        const data = await response.json()
                        const userAccount = data.userAccount

                        if (userAccount) {
                            const progressInfo = getLevelProgressInfo(
                                userAccount.current_level,
                                userAccount.total_xp
                            )

                            const previousXP =
                                userAccount.total_xp - expectedXPEarned
                            const previousLevel =
                                userAccount.current_level -
                                (userAccount.total_xp > previousXP ? 1 : 0)

                            setUserProgress({
                                xpEarned: expectedXPEarned,
                                newLevel: userAccount.current_level,
                                previousLevel: previousLevel,
                                currentXP: userAccount.total_xp,
                                xpToNextLevel: userAccount.xp_to_next_level,
                                progressPercentage:
                                    progressInfo.progressPercentage,
                                aenergyEarned: userAccount.aenergy_earned,
                            })
                            break
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user progress:', error)
                }

                retryCount++
                if (retryCount < maxRetries) {
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                }
            }
            setLoading(false)
        }

        fetchUserProgress()
    }, [user, score])

    return (
        <div className='quiz-complete flex min-h-screen flex-col items-center justify-center text-white'>
            <div className='relative w-full max-w-4xl rounded-md p-4'>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='mb-6 text-center text-5xl font-bold text-white md:text-9xl'
                >
                    Quiz complete!
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className='mb-6 overflow-hidden rounded-md text-white'
                >
                    <CardContent className='p-0'>
                        <div className='flex flex-col items-center justify-center p-8'>
                            <div className='relative mb-6'>
                                <div className='flex flex-col text-center'>
                                    <div className='text-5xl font-bold'>
                                        <h1>Well done!</h1>
                                        <span className='text-4xl font-light'>
                                            You scored{' '}
                                            <span className='text-purple-500'>
                                                {score}
                                            </span>{' '}
                                            points.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* XP and Level Progression */}
                            {userProgress && !loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1 }}
                                    className='mb-6 w-full max-w-md'
                                >
                                    <div className='p-6'>
                                        <div className='flex justify-between text-center'>
                                            <h3 className='mb-2 text-4xl font-bold'>
                                                Rewards
                                            </h3>
                                        </div>
                                        <div className='mb-4 flex justify-between'>
                                            <div className='text-2xl font-bold text-yellow-400'>
                                                +{userProgress.xpEarned} XP
                                            </div>
                                            <div className='text-2xl font-bold text-purple-400'>
                                                +{userProgress.aenergyEarned} ænergy
                                            </div>
                                        </div>

                                        {/* XP Progress Bar */}
                                        <div className='mb-2 h-3 w-full rounded-full bg-purple-800/50'>
                                            <motion.div
                                                className='h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600'
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${userProgress.progressPercentage}%`,
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    delay: 1.5,
                                                }}
                                            />
                                        </div>

                                        <div className='mb-2 text-xl'>
                                            Level {userProgress.newLevel}
                                        </div>
                                        <div className='text-lg text-purple-200'>
                                            {userProgress.xpToNextLevel} XP
                                            to next level
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className='flex justify-center'>
                            <div className='flex w-full flex-col items-center justify-center gap-4 md:w-1/2'>
                                <Button
                                    asChild
                                    className='w-full rounded-md bg-purple-700 py-6 text-lg text-white transition-all hover:bg-purple-800'
                                >
                                    <Link href={`/quiz`}>New quiz</Link>
                                </Button>
                                {user ? (
                                    <>
                                        <Button
                                            asChild
                                            variant='outline'
                                            className='w-full border-[#6d6d6d2a] py-6 text-lg text-white hover:bg-purple-700'
                                        >
                                            <Link href='/dashboard'>
                                                Back to dashboard
                                            </Link>
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        asChild
                                        variant='outline'
                                        className='w-full border-[#6d6d6d2a] py-6 text-lg text-white hover:bg-purple-700'
                                    >
                                        <Link href='/'>Back to home</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </motion.div>
            </div>
        </div>
    )
}

export default QuizComplete
