'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'motion/react'
import { Bebas_Neue } from 'next/font/google'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CollectionView from '@/components/photocards/CollectionView'
import PackOpening from '@/components/photocards/PackOpening'
import { Card, CardContent } from '@/components/ui/card'
import type {
    Photocard,
    UserPhotocard,
    CollectionStats,
    PhotocardPack,
    PackOpeningResult,
} from '@/lib/photocard-types'

const bebasNeue = Bebas_Neue({
    subsets: ['latin'],
    weight: ['400'],
})

type TabType = 'collection' | 'packs'

export default function PhotocardsPage() {
    const { user, isLoaded } = useUser()
    const [activeTab, setActiveTab] = useState<TabType>('collection')
    const [loading, setLoading] = useState(true)
    const [collection, setCollection] = useState<UserPhotocard[]>([])
    const [allPhotocards, setAllPhotocards] = useState<Photocard[]>([])
    const [collectionStats, setCollectionStats] =
        useState<CollectionStats | null>(null)
    const [availablePacks, setAvailablePacks] = useState<
        Array<
            PhotocardPack & { is_available: boolean; is_level_locked: boolean }
        >
    >([])
    const [userLevel, setUserLevel] = useState(1)

    useEffect(() => {
        if (isLoaded && user) {
            loadData()
        }
    }, [isLoaded, user])

    const loadData = async () => {
        setLoading(true)
        try {
            const collectionResponse = await fetch(
                '/api/photocards/collection?stats=true'
            )
            if (collectionResponse.ok) {
                const { collection: userCollection, stats } =
                    await collectionResponse.json()
                setCollection(userCollection)
                setCollectionStats(stats)
            }

            const photocardsResponse = await fetch('/api/photocards')
            if (photocardsResponse.ok) {
                const { photocards } = await photocardsResponse.json()
                setAllPhotocards(photocards)
            }

            const packsResponse = await fetch('/api/photocards/packs')
            if (packsResponse.ok) {
                const { packs } = await packsResponse.json()
                setAvailablePacks(packs)
            }

            const userResponse = await fetch('/api/user-account')
            if (userResponse.ok) {
                const { userAccount } = await userResponse.json()
                setUserLevel(userAccount.current_level)
            }
        } catch (error) {
            console.error('Error loading photocard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFavoriteToggle = async (photocardId: number) => {
        try {
            const userCard = collection.find(
                (uc) => uc.photocard_id === photocardId
            )
            if (!userCard) return

            const response = await fetch('/api/photocards/collection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    photocard_id: photocardId,
                    is_favorited: !userCard.is_favorited,
                }),
            })

            if (response.ok) {
                setCollection((prev) =>
                    prev.map((uc) =>
                        uc.photocard_id === photocardId
                            ? { ...uc, is_favorited: !uc.is_favorited }
                            : uc
                    )
                )
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
        }
    }

    const handleOpenPack = async (
        packId: number
    ): Promise<PackOpeningResult> => {
        try {
            const response = await fetch('/api/photocards/packs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pack_id: packId }),
            })

            if (!response.ok) {
                throw new Error('Failed to open pack')
            }

            const result: PackOpeningResult = await response.json()
            return result
        } catch (error) {
            console.error('Error opening pack:', error)
            throw error
        }
    }

    const handleOpeningComplete = async () => {
        await loadData()
    }

    const handleCardClick = (photocard: Photocard) => {
        console.log('Card clicked:', photocard)
    }

    if (!isLoaded) {
        return (
            <div className='quiz-creation flex min-h-screen items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent'></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className='quiz-creation flex min-h-screen items-center justify-center'>
                <div className='text-center text-white'>
                    <h1 className='mb-4 text-2xl font-bold'>
                        Sign in required
                    </h1>
                    <p className='mb-6'>
                        You need to sign in to view your photocard collection.
                    </p>
                    <Link href='/'>
                        <Button>Go home</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className='quiz-creation min-h-screen'>
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='relative flex w-full justify-center px-6 py-4 text-white'
            >
                <div className='absolute top-10 left-4 md:top-14 md:left-8'>
                    <Link href='/dashboard'>
                        <Button
                            variant='ghost'
                            size='sm'
                            className='text-white hover:bg-white/10'
                        >
                            <ArrowLeft size={16} />
                        </Button>
                    </Link>
                </div>
                <h1
                    className={`${bebasNeue.className} text-6xl font-bold md:text-8xl`}
                >
                    Photocards
                </h1>
            </motion.header>

            {/* Tab Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mb-8 flex justify-center'
            >
                <div className='flex p-1 text-white'>
                    <Button
                        variant={
                            activeTab === 'collection' ? 'default' : 'ghost'
                        }
                        onClick={() => setActiveTab('collection')}
                        className={`rounded-tr-none rounded-br-none ${
                            activeTab === 'collection'
                                ? 'bg-purple-500 hover:bg-purple-600'
                                : 'hover:bg-white/10'
                        } `}
                    >
                        <Package className='mr-2' size={16} />
                        Collection
                    </Button>
                    <Button
                        variant={activeTab === 'packs' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('packs')}
                        className={`rounded-tl-none rounded-bl-none ${
                            activeTab === 'packs'
                                ? 'bg-purple-500 hover:bg-purple-600'
                                : 'hover:bg-white/10'
                        } `}
                    >
                        <Package className='mr-2' size={16} />
                        Open packs
                    </Button>
                </div>
            </motion.div>

            {/* Content */}
            <main className='flex-1'>
                {loading ? (
                    <div className='flex justify-center py-12'>
                        <div className='h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent'></div>
                    </div>
                ) : activeTab === 'collection' ? (
                    <motion.div
                        key='collection'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {allPhotocards.length === 0 ? (
                            <div className='py-12 text-center text-white'>
                                <Package
                                    size={64}
                                    className='mx-auto mb-4 opacity-50'
                                />
                                <h3 className='mb-2 text-xl font-bold'>
                                    No photocards available yet
                                </h3>
                                <p className='mb-6 text-gray-300'>
                                    The photocard collection is being prepared.
                                    Check back soon!
                                </p>
                                <Button onClick={() => setActiveTab('packs')}>
                                    <Package className='mr-2' size={16} />
                                    Open packs
                                </Button>
                            </div>
                        ) : (
                            <CollectionView
                                collection={collection}
                                allPhotocards={allPhotocards}
                                stats={collectionStats || undefined}
                                onFavoriteToggle={handleFavoriteToggle}
                                onCardClick={handleCardClick}
                            />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key='packs'
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <PackOpening
                            packs={availablePacks}
                            onOpenPack={handleOpenPack}
                            userLevel={userLevel}
                            onOpeningComplete={handleOpeningComplete}
                        />
                    </motion.div>
                )}
            </main>

            {/* Quick stats footer */}
            {!loading && collectionStats && activeTab === 'collection' && (
                <motion.footer
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className='mt-8 px-6 pb-6'
                >
                    <Card className='mx-auto max-w-7xl border-2 border-purple-800 bg-white text-black'>
                        <CardContent className='p-4'>
                            <div className='flex items-center justify-around text-center'>
                                <div>
                                    <div className='text-lg font-bold'>
                                        {collectionStats.total_owned}/
                                        {collectionStats.total_cards}
                                    </div>
                                    <div className='text-xs'>Total cards</div>
                                </div>
                                <div>
                                    <div className='text-lg font-bold'>
                                        {collectionStats.completion_percentage.toFixed(
                                            1
                                        )}
                                        %
                                    </div>
                                    <div className='text-xs'>Complete</div>
                                </div>
                                <div>
                                    <div className='text-lg font-bold'>
                                        {collectionStats.rarest_owned.length}
                                    </div>
                                    <div className='text-xs'>Rare cards</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.footer>
            )}
        </div>
    )
}
