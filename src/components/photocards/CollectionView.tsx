'use client'

import React from 'react'
import { motion } from 'motion/react'
import PhotocardDisplay from './PhotocardDisplay'
import type {
    Photocard,
    UserPhotocard,
    CollectionStats,
} from '@/lib/photocard-types'

interface CollectionViewProps {
    collection: UserPhotocard[]
    allPhotocards: Photocard[]
    stats?: CollectionStats
    onFavoriteToggle?: (photocardId: number) => void
    onCardClick?: (photocard: Photocard) => void
}

export default function CollectionView({
    collection,
    allPhotocards,
    onFavoriteToggle,
    onCardClick,
}: CollectionViewProps) {
    const ownedCardsMap = new Map(collection.map((uc) => [uc.photocard_id, uc]))

    return (
        <div className='mx-auto flex w-full max-w-7xl justify-center p-6'>
            {/* Cards Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                    {allPhotocards.map((photocard) => {
                        const userCard = ownedCardsMap.get(photocard.id)
                        const isOwned = !!userCard
                        const isFavorited = userCard?.is_favorited || false

                        return (
                            <PhotocardDisplay
                                key={photocard.id}
                                photocard={photocard}
                                isOwned={isOwned}
                                isFavorited={isFavorited}
                                size='large'
                                onClick={() => onCardClick?.(photocard)}
                                onFavorite={() =>
                                    onFavoriteToggle?.(photocard.id)
                                }
                            />
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}
