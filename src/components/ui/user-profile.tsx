'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'motion/react'
import { getLevelProgressInfo } from '@/lib/xp-system'
import { UserAccount } from '@/lib/xp-system'

interface UserProfileProps {
    showCompact?: boolean
    className?: string
}

const UserProfile: React.FC<UserProfileProps> = ({
    showCompact = false,
    className = '',
}) => {
    const { user } = useUser()
    const [userAccount, setUserAccount] = useState<UserAccount | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserAccount = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                const response = await fetch('/api/user-account')
                if (response.ok) {
                    const data = await response.json()
                    setUserAccount(data.userAccount)
                }
            } catch (error) {
                console.error('Error fetching user account:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserAccount()
    }, [user])

    if (!user || !userAccount || loading) {
        return null
    }

    const progressInfo = getLevelProgressInfo(
        userAccount.current_level,
        userAccount.total_xp
    )

    if (showCompact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-lg bg-purple-900/30 p-3 backdrop-blur-sm ${className}`}
            >
                <div className='flex items-center justify-between'>
                    <div>
                        <div className='text-sm font-bold text-purple-200'>
                            Level {userAccount.current_level}
                        </div>
                        <div className='text-xs text-purple-300'>
                            {userAccount.total_xp} XP
                        </div>
                    </div>
                    <div className='text-right'>
                        <div className='text-xs text-purple-300'>
                            {progressInfo.xpToNextLevel} to next
                        </div>
                        <div className='mt-1 h-1.5 w-16 rounded-full bg-purple-800/50'>
                            <div
                                className='h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300'
                                style={{
                                    width: `${progressInfo.progressPercentage}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`rounded-lg bg-purple-900/30 p-6 backdrop-blur-sm ${className}`}
        >
            <div className='mb-4 flex items-center justify-between'>
                <div>
                    <h3 className='mb-1 text-xl font-bold text-white'>
                        {userAccount.username}
                    </h3>
                    <div className='text-sm text-purple-300'>
                        {userAccount.total_quizzes_completed} quizzes completed
                    </div>
                </div>
                <div className='text-right'>
                    <div className='text-3xl font-bold text-purple-400'>
                        {userAccount.current_level}
                    </div>
                    <div className='text-sm text-purple-300'>Level</div>
                </div>
            </div>

            <div className='mb-4'>
                <div className='mb-2 flex justify-between text-sm text-purple-200'>
                    <span>XP progress</span>
                    <span>
                        {userAccount.total_xp} / {progressInfo.nextLevelXP} XP
                    </span>
                </div>
                <div className='h-3 w-full rounded-full bg-purple-800/50'>
                    <motion.div
                        className='h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600'
                        initial={{ width: 0 }}
                        animate={{
                            width: `${progressInfo.progressPercentage}%`,
                        }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <div className='mt-1 text-xs text-purple-300'>
                    {progressInfo.xpToNextLevel} XP to next level
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 text-center'>
                <div className='rounded-lg bg-purple-800/30 p-3'>
                    <div className='text-lg font-bold text-purple-400'>
                        {userAccount.total_score.toLocaleString()}
                    </div>
                    <div className='text-xs text-purple-300'>Total score</div>
                </div>
                <div className='rounded-lg bg-purple-800/30 p-3'>
                    <div className='text-lg font-bold text-purple-400'>
                        {userAccount.total_xp}
                    </div>
                    <div className='text-xs text-purple-300'>Total XP</div>
                </div>
            </div>
        </motion.div>
    )
}

export default UserProfile
