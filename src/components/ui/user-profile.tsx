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
    className = '' 
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

    if (!user || loading) {
        return showCompact ? (
            <div className={`animate-pulse bg-purple-800/30 rounded-lg p-3 ${className}`}>
                <div className="h-4 bg-purple-600/50 rounded w-24 mb-2"></div>
                <div className="h-2 bg-purple-600/50 rounded w-16"></div>
            </div>
        ) : null
    }

    if (!userAccount) {
        return null
    }

    const progressInfo = getLevelProgressInfo(userAccount.current_level, userAccount.total_xp)

    if (showCompact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-purple-900/30 backdrop-blur-sm rounded-lg p-3 ${className}`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-purple-200">
                            Level {userAccount.current_level}
                        </div>
                        <div className="text-xs text-purple-300">
                            {userAccount.total_xp} XP
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-purple-300">
                            {progressInfo.xpToNextLevel} to next
                        </div>
                        <div className="w-16 bg-purple-800/50 rounded-full h-1.5 mt-1">
                            <div 
                                className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progressInfo.progressPercentage}%` }}
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
            className={`bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 ${className}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        {userAccount.username}
                    </h3>
                    <div className="text-sm text-purple-300">
                        {userAccount.total_quizzes_completed} quizzes completed
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">
                        {userAccount.current_level}
                    </div>
                    <div className="text-sm text-purple-300">Level</div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-sm text-purple-200 mb-2">
                    <span>XP progress</span>
                    <span>{userAccount.total_xp} / {progressInfo.nextLevelXP} XP</span>
                </div>
                <div className="w-full bg-purple-800/50 rounded-full h-3">
                    <motion.div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressInfo.progressPercentage}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <div className="text-xs text-purple-300 mt-1">
                    {progressInfo.xpToNextLevel} XP to next level
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-purple-800/30 rounded-lg p-3">
                    <div className="text-lg font-bold text-purple-400">
                        {userAccount.total_score.toLocaleString()}
                    </div>
                    <div className="text-xs text-purple-300">Total score</div>
                </div>
                <div className="bg-purple-800/30 rounded-lg p-3">
                    <div className="text-lg font-bold text-purple-400">
                        {userAccount.total_xp}
                    </div>
                    <div className="text-xs text-purple-300">Total XP</div>
                </div>
            </div>
        </motion.div>
    )
}

export default UserProfile 