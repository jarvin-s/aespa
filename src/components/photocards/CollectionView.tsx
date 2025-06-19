'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Calendar, Filter, Search, Star, Trophy, User } from 'lucide-react'
import PhotocardDisplay from './PhotocardDisplay'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type {
    Photocard,
    UserPhotocard,
    CollectionStats,
    PhotocardRarity,
    PhotocardMember,
} from '@/lib/photocard-types'
import { RARITY_CONFIG, MEMBER_CONFIG } from '@/lib/photocard-types'

interface CollectionViewProps {
    collection: UserPhotocard[]
    allPhotocards: Photocard[]
    stats?: CollectionStats
    onFavoriteToggle?: (photocardId: number) => void
    onCardClick?: (photocard: Photocard) => void
}

type FilterType = 'all' | PhotocardRarity | PhotocardMember

export default function CollectionView({
    collection,
    allPhotocards,
    stats,
    onFavoriteToggle,
    onCardClick,
}: CollectionViewProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
    const [showOnlyOwned, setShowOnlyOwned] = useState(false)
    const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'date'>('rarity')

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
                if (Object.keys(RARITY_CONFIG).includes(selectedFilter)) {
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
        <div className='mx-auto w-full max-w-7xl p-6'>
            {/* Collection Stats */}
            {stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mb-8'
                >
                    <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
                        <Card className='col-span-1 border-none bg-gradient-to-br from-purple-500 to-purple-700 text-white sm:col-span-2 md:col-span-1'>
                            <CardContent className='p-4 text-center'>
                                <Trophy className='mx-auto mb-2' size={24} />
                                <div className='mb-2 flex items-center justify-center gap-2 text-2xl font-bold'>
                                    <div>{stats.total_owned}</div>
                                    <span className='text-lg font-medium'>
                                        Cards owned
                                    </span>
                                </div>
                                <div className='text-sm opacity-90'>
                                    {stats.completion_percentage}% Complete
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='col-span-1 border-none bg-gradient-to-br from-purple-500 to-purple-700 text-white sm:col-span-2 md:col-span-1'>
                            <CardContent className='p-4 text-center'>
                                <Star className='mx-auto mb-2' size={24} />
                                <div className='mb-2 flex items-center justify-center gap-2 text-2xl font-bold'>
                                    <div>{stats.rarest_owned.length}</div>
                                    <span className='text-lg font-medium'>
                                        Rare collection
                                    </span>
                                </div>
                                <div className='text-sm opacity-90'>
                                    Epic+ cards
                                </div>
                                <div className='mt-1 text-xs'>
                                    Rare collection
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='col-span-1 border-none bg-gradient-to-br from-purple-500 to-purple-700 text-white sm:col-span-2 md:col-span-1'>
                            <CardContent className='p-4 text-center'>
                                <User className='mx-auto mb-2' size={24} />
                                <div className='mb-2 flex items-center justify-center gap-2 text-2xl font-bold'>
                                    <div>
                                        {Object.values(stats.by_member).reduce(
                                            (acc, member) =>
                                                acc +
                                                (member.owned > 0 ? 1 : 0),
                                            0
                                        )}
                                    </div>
                                    <span className='text-lg font-medium'>
                                        Members
                                    </span>
                                </div>
                                <div className='text-sm opacity-90'>
                                    Members
                                </div>
                                <div className='mt-1 text-xs'>
                                    Collections started
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='col-span-1 border-none bg-gradient-to-br from-purple-500 to-purple-700 text-white sm:col-span-2 md:col-span-1'>
                            <CardContent className='p-4 text-center'>
                                <Calendar className='mx-auto mb-2' size={24} />
                                <div className='mb-2 flex items-center justify-center gap-2 text-2xl font-bold'>
                                    <div>
                                        {Object.values(stats.by_era).reduce(
                                            (acc, era) =>
                                                acc + (era.owned > 0 ? 1 : 0),
                                            0
                                        )}
                                    </div>
                                    <span className='text-lg font-medium'>
                                        Eras
                                    </span>
                                </div>
                                <div className='mt-1 text-xs'>Represented</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rarity Progress */}
                    <Card className='mb-6 bg-white'>
                        <CardHeader>
                            <CardTitle>Collection progress by rarity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-3'>
                                {Object.entries(stats.by_rarity).map(
                                    ([rarity, data]) => {
                                        const rarityConfig =
                                            RARITY_CONFIG[
                                                rarity as PhotocardRarity
                                            ]
                                        const percentage =
                                            data.total > 0
                                                ? (data.owned / data.total) *
                                                  100
                                                : 0

                                        return (
                                            <div
                                                key={rarity}
                                                className='flex items-center gap-3'
                                            >
                                                <Badge
                                                    className={`bg-gradient-to-r ${rarityConfig.gradient} min-w-20 justify-center border-none text-white`}
                                                >
                                                    {rarityConfig.name}
                                                </Badge>
                                                <div className='flex-1'>
                                                    <div className='mb-1 flex justify-between text-sm'>
                                                        <span>
                                                            {data.owned}/
                                                            {data.total}
                                                        </span>
                                                        <span>
                                                            {percentage.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className='h-2 w-full rounded-full bg-gray-200'>
                                                        <div
                                                            className={`h-2 rounded-full bg-gradient-to-r ${rarityConfig.gradient}`}
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mb-6'
            >
                <div className='mb-4 flex flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 md:flex-row md:flex-wrap'>
                    <div className='flex w-full flex-wrap items-center gap-2 md:w-auto'>
                        <div className='relative flex-1 md:flex-none'>
                            <Search className='absolute top-3 left-3 h-4 w-4 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Search cards...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full rounded-lg border py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 md:w-auto'
                            />
                        </div>

                        <select
                            id='filter'
                            value={selectedFilter}
                            onChange={(e) =>
                                setSelectedFilter(e.target.value as FilterType)
                            }
                            className='w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500 md:w-auto'
                        >
                            <option value='all'>All categories</option>
                            <optgroup label='Rarity'>
                                {Object.entries(RARITY_CONFIG).map(
                                    ([rarity, config]) => (
                                        <option key={rarity} value={rarity}>
                                            {config.name}
                                        </option>
                                    )
                                )}
                            </optgroup>
                            <optgroup label='Member'>
                                {Object.entries(MEMBER_CONFIG).map(
                                    ([member, config]) => (
                                        <option key={member} value={member}>
                                            {config.displayName}
                                        </option>
                                    )
                                )}
                            </optgroup>
                        </select>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Button
                            size='sm'
                            onClick={() => setShowOnlyOwned(!showOnlyOwned)}
                            className={`${
                                showOnlyOwned
                                    ? 'bg-purple-800 text-white hover:bg-purple-900'
                                    : 'bg-white text-black hover:bg-gray-200'
                            }`}
                        >
                            <Filter size={16} className='mr-1' />
                            Owned only
                        </Button>

                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(
                                    e.target.value as 'name' | 'rarity' | 'date'
                                )
                            }
                            className='rounded-lg border px-2 py-1 focus:ring-2 focus:ring-purple-500'
                        >
                            <option value='rarity'>Sort by rarity</option>
                            <option value='name'>Sort by name</option>
                            <option value='date'>Sort by date</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='flex flex-col items-center justify-center'
            >
                {filteredPhotocards.length === 0 ? (
                    <div className='py-12 text-center text-gray-500'>
                        <div className='mb-4 text-4xl'>🔍</div>
                        <div className='mb-2 text-lg font-medium'>
                            No cards found
                        </div>
                        <div>Try adjusting your search or filters</div>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
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
                                    size='medium'
                                    onClick={() => onCardClick?.(photocard)}
                                    onFavorite={() =>
                                        onFavoriteToggle?.(photocard.id)
                                    }
                                />
                            )
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
