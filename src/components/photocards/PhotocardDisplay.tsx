'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Heart, Star } from 'lucide-react'
import type { Photocard } from '@/lib/photocard-types'
import { RARITY_CONFIG, MEMBER_CONFIG } from '@/lib/photocard-types'
import { Badge } from '@/components/ui/badge'

interface PhotocardDisplayProps {
    photocard: Photocard
    isOwned?: boolean
    isFavorited?: boolean
    showDetails?: boolean
    size?: 'small' | 'medium' | 'large'
    onClick?: () => void
    onFavorite?: () => void
    className?: string
}

export default function PhotocardDisplay({
    photocard,
    isOwned = false,
    isFavorited = false,
    showDetails = true,
    size = 'large',
    onClick,
    onFavorite,
    className = '',
}: PhotocardDisplayProps) {
    const rarityConfig = RARITY_CONFIG[photocard.rarity]
    const memberConfig = MEMBER_CONFIG[photocard.member]

    const sizeClasses = {
        small: 'w-24 h-32',
        medium: 'w-32 h-44',
        large: 'w-48 h-72',
    }

    const textSizes = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base',
    }

    return (
        <motion.div
            className={`relative ${sizeClasses[size]} cursor-pointer ${className}`}
            onClick={onClick}
        >
            {/* Card Container */}
            <div
                className={`relative h-full w-full overflow-hidden rounded-lg ${isOwned ? 'ring-2 ring-white/30' : 'opacity-60 grayscale'} ${rarityConfig.glow} `}
            >
                {/* Rarity Border */}
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.gradient} z-0 opacity-20`}
                />

                {/* Card Image */}
                <div className='relative h-full w-full'>
                    <Image
                        src={photocard.image_url}
                        alt={photocard.name}
                        fill
                        className='object-cover'
                        sizes={
                            size === 'large'
                                ? '192px'
                                : size === 'medium'
                                  ? '128px'
                                  : '96px'
                        }
                    />

                    {/* Overlay Gradient */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent' />
                </div>

                {/* Card Content */}
                {showDetails && (
                    <div className='absolute right-0 bottom-0 left-0 z-10 p-2'>
                        <div
                            className={`${textSizes[size]} mb-1 leading-tight font-bold text-white`}
                        >
                            {photocard.name}
                        </div>

                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-1'>
                                {/* Rarity Badge */}
                                <Badge
                                    className={`bg-gradient-to-r px-1 py-0 text-xs ${rarityConfig.gradient} border-none text-white`}
                                >
                                    {rarityConfig.name}
                                </Badge>

                                {/* Member Color Indicator */}
                                <div
                                    className='h-2 w-2 rounded-full'
                                    style={{
                                        backgroundColor: memberConfig.color,
                                    }}
                                />
                            </div>

                            {/* Level Requirement */}
                            {photocard.level_required > 1 && (
                                <div className='flex items-center gap-1 text-xs text-white/80'>
                                    <Star size={10} />
                                    {photocard.level_required}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Special Effects */}
                {photocard.special_effects?.includes('holographic') && (
                    <div className='absolute inset-0 animate-pulse bg-gradient-to-br from-transparent via-white/10 to-transparent' />
                )}

                {/* Not Owned Overlay */}
                {!isOwned && (
                    <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/50'>
                        <div className='text-center text-white'>
                            <div className='text-lg'>🔒</div>
                            <div className='mt-1 text-xs'>Not owned</div>
                        </div>
                    </div>
                )}

                {/* Favorite Button */}
                {isOwned && onFavorite && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onFavorite()
                        }}
                        className={`absolute top-2 right-2 z-30 ${isFavorited ? 'text-red-500' : 'text-gray-400'} transition-colors hover:text-red-500`}
                    >
                        <Heart size={24} />
                    </button>
                )}

                {/* New Card Indicator */}
                {isOwned && photocard.era && (
                    <div className='absolute top-2 left-2 z-30'>
                        <div
                            className='rounded-full px-2 py-1 text-xs font-bold text-white'
                            style={{
                                backgroundColor:
                                    photocard.era.primary_color || '#A855F7',
                                opacity: 0.9,
                            }}
                        >
                            {photocard.era.display_name}
                        </div>
                    </div>
                )}

                {/* Rarity Glow Effect */}
                <div
                    className={`absolute -inset-1 bg-gradient-to-r ${rarityConfig.gradient} -z-10 rounded-lg opacity-30 blur ${isOwned ? 'animate-pulse' : 'hidden'} `}
                />
            </div>
        </motion.div>
    )
}
