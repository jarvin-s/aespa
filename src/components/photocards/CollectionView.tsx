'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import PhotocardDisplay from './PhotocardDisplay'
import type {
    Photocard,
    UserPhotocard,
    CollectionStats,
    PhotocardRarity,
    PhotocardMember,
} from '@/lib/photocard-types'
import { MEMBER_CONFIG } from '@/lib/photocard-types'
import { Search } from 'lucide-react'

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
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState<
        'all' | PhotocardRarity | PhotocardMember
    >('all')
    const [showOnlyOwned, setShowOnlyOwned] = useState(false)
    const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'date'>('name')

    const ownedCardsMap = new Map(collection.map((uc) => [uc.photocard_id, uc]))

    const filteredPhotocards = allPhotocards
        .filter((card) => {
            // Search filter
            if (
                searchQuery &&
                !card.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false
            }

            // Category filter
            if (selectedFilter !== 'all') {
                if (
                    [
                        'common',
                        'uncommon',
                        'rare',
                        'epic',
                        'legendary',
                    ].includes(selectedFilter)
                ) {
                    if (card.rarity !== selectedFilter) return false
                } else if (
                    Object.keys(MEMBER_CONFIG).includes(selectedFilter)
                ) {
                    if (card.member !== selectedFilter) return false
                }
            }

            // Ownership filter
            if (showOnlyOwned && !ownedCardsMap.has(card.id)) {
                return false
            }

            return true
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'rarity':
                    const rarityOrder = [
                        'legendary',
                        'epic',
                        'rare',
                        'uncommon',
                        'common',
                    ]
                    return (
                        rarityOrder.indexOf(a.rarity) -
                        rarityOrder.indexOf(b.rarity)
                    )
                case 'date':
                    const aOwned = ownedCardsMap.get(a.id)
                    const bOwned = ownedCardsMap.get(b.id)
                    if (!aOwned && !bOwned) return 0
                    if (!aOwned) return 1
                    if (!bOwned) return -1
                    return (
                        new Date(bOwned.obtained_at).getTime() -
                        new Date(aOwned.obtained_at).getTime()
                    )
                default:
                    return 0
            }
        })

    return (
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-4 p-4'>
            {/* Filter Controls */}
            <div className='flex flex-col justify-center gap-4 md:flex-row'>
                <div className='relative flex items-center'>
                    <input
                        type='text'
                        value={searchQuery}
                        placeholder='Looking for a specific card?'
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full rounded-md bg-purple-700 py-2 pr-4 pl-10 text-white'
                    />
                    <Search className='absolute left-3 h-5 w-5 text-gray-400' />
                </div>

                <div className='relative'>
                    <select
                        value={selectedFilter}
                        onChange={(e) =>
                            setSelectedFilter(
                                e.target.value as
                                    | 'all'
                                    | PhotocardRarity
                                    | PhotocardMember
                            )
                        }
                        className='cursor-pointer appearance-none rounded-md bg-purple-700 px-4 py-2 pr-8 text-white'
                    >
                        <option value='all'>All</option>
                        <optgroup label='Rarity'>
                            <option value='legendary'>Legendary</option>
                            <option value='epic'>Epic</option>
                            <option value='rare'>Rare</option>
                            <option value='uncommon'>Uncommon</option>
                            <option value='common'>Common</option>
                        </optgroup>
                        <optgroup label='Member'>
                            <option value='karina'>Karina</option>
                            <option value='winter'>Winter</option>
                            <option value='giselle'>Giselle</option>
                            <option value='ningning'>Ningning</option>
                            <option value='group'>Group</option>
                        </optgroup>
                    </select>
                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                        <svg
                            className='h-5 w-5 fill-current'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                        >
                            <path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
                        </svg>
                    </div>
                </div>

                <div className='relative'>
                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(
                                e.target.value as 'name' | 'rarity' | 'date'
                            )
                        }
                        className='cursor-pointer appearance-none rounded-md bg-purple-700 px-4 py-2 pr-8 text-white'
                    >
                        <option value='name'>Sort by name</option>
                        <option value='rarity'>Sort by rarity</option>
                        <option value='date'>Sort by date obtained</option>
                    </select>
                    <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                        <svg
                            className='h-5 w-5 fill-current'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                        >
                            <path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
                        </svg>
                    </div>
                </div>

                <label className='flex items-center gap-2'>
                    <input
                        type='checkbox'
                        checked={showOnlyOwned}
                        onChange={(e) => setShowOnlyOwned(e.target.checked)}
                        className='rounded-md'
                    />
                    <span className='text-white'>Owned only</span>
                </label>
            </div>

            {/* Cards Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                    {filteredPhotocards.map((photocard) => {
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
