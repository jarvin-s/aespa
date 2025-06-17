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
    levelUp: boolean
    newLevel: number
    previousLevel: number
    currentXP: number
    xpToNextLevel: number
    progressPercentage: number
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

            try {
                const response = await fetch('/api/user-account')
                if (response.ok) {
                    const data = await response.json()
                    const userAccount = data.userAccount
                    
                    if (userAccount) {
                        const xpEarned = calculateXPFromScore(score)
                        const progressInfo = getLevelProgressInfo(userAccount.current_level, userAccount.total_xp)
                        
                        setUserProgress({
                            xpEarned,
                            levelUp: false,
                            newLevel: userAccount.current_level,
                            previousLevel: userAccount.current_level,
                            currentXP: userAccount.total_xp,
                            xpToNextLevel: userAccount.xp_to_next_level,
                            progressPercentage: progressInfo.progressPercentage
                        })
                    }
                }
            } catch (error) {
                console.error('Error fetching user progress:', error)
            } finally {
                setLoading(false)
            }
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
                            {user && !loading && userProgress && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1 }}
                                    className='mb-6 w-full max-w-md'
                                >
                                    <div className='rounded-lg bg-purple-900/30 p-6 backdrop-blur-sm'>
                                        <div className='text-center mb-4'>
                                            <h3 className='text-2xl font-bold text-purple-300 mb-2'>
                                                XP Earned
                                            </h3>
                                            <div className='text-4xl font-bold text-yellow-400'>
                                                +{userProgress.xpEarned} XP
                                            </div>
                                            <div className='text-sm text-purple-200 mt-1'>
                                                ({score} points ÷ 2000 = {userProgress.xpEarned} XP)
                                            </div>
                                        </div>

                                        <div className='text-center'>
                                            <div className='text-lg font-semibold text-purple-200 mb-2'>
                                                Level {userProgress.newLevel}
                                            </div>
                                            
                                            {/* XP Progress Bar */}
                                            <div className='w-full bg-purple-800/50 rounded-full h-3 mb-2'>
                                                <motion.div
                                                    className='bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full'
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${userProgress.progressPercentage}%` }}
                                                    transition={{ duration: 1, delay: 1.5 }}
                                                />
                                            </div>
                                            
                                            <div className='text-sm text-purple-200'>
                                                {userProgress.xpToNextLevel} XP to next level
                                            </div>
                                        </div>

                                        {userProgress.levelUp && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5, delay: 2 }}
                                                className='mt-4 text-center'
                                            >
                                                <div className='text-2xl font-bold text-yellow-400'>
                                                    🎉 LEVEL UP! 🎉
                                                </div>
                                                <div className='text-lg text-purple-200'>
                                                    Level {userProgress.previousLevel} → Level {userProgress.newLevel}
                                                </div>
                                            </motion.div>
                                        )}
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
