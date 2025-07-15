'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package } from 'lucide-react'
import PhotocardDisplay from './PhotocardDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type {
    PhotocardPack,
    PackOpeningResult,
    Photocard,
} from '@/lib/photocard-types'
import { RARITY_CONFIG } from '@/lib/photocard-types'

interface PackOpeningProps {
    packs: Array<
        PhotocardPack & { is_available: boolean; is_level_locked: boolean }
    >
    onOpenPack: (packId: number) => Promise<PackOpeningResult>
    userAenergy: number
    onOpeningComplete?: () => void
}

export default function PackOpening({
    packs,
    onOpenPack,
    userAenergy,
    onOpeningComplete,
}: PackOpeningProps) {
    const [selectedPack, setSelectedPack] = useState<PhotocardPack | null>(null)
    const [isOpening, setIsOpening] = useState(false)
    const [revealedCards, setRevealedCards] = useState<
        (Photocard & { isHidden: boolean; isRevealing?: boolean })[]
    >([])
    const [showingResults, setShowingResults] = useState(false)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)

    const handleOpenPack = async (pack: PhotocardPack) => {
        if (isOpening) return

        setSelectedPack(pack)
        setIsOpening(true)
        setRevealedCards([])
        setShowingResults(false)
        setCurrentCardIndex(0)

        try {
            const result = await onOpenPack(pack.id)
            setRevealedCards(
                result.cards_obtained.map((card) => ({
                    ...card,
                    isHidden: true,
                }))
            )
            setShowingResults(true)
        } catch (error) {
            console.error('Error opening pack:', error)
        } finally {
            setIsOpening(false)
        }
    }

    const handleCardReveal = () => {
        if (currentCardIndex >= revealedCards.length) return

        setRevealedCards((prev) => {
            const newCards = [...prev]
            newCards[currentCardIndex] = {
                ...newCards[currentCardIndex],
                isHidden: false,
                isRevealing: true,
            }
            return newCards
        })

        setTimeout(() => {
            setRevealedCards((prev) => {
                const newCards = [...prev]
                newCards[currentCardIndex] = {
                    ...newCards[currentCardIndex],
                    isRevealing: false,
                }
                return newCards
            })
            setCurrentCardIndex((prev) => prev + 1)
        }, 500)
    }

    const resetOpening = () => {
        if (onOpeningComplete) {
            onOpeningComplete()
        }
        setSelectedPack(null)
        setRevealedCards([])
        setShowingResults(false)
        setCurrentCardIndex(0)
    }

    const availablePacks = packs.filter(
        (pack) => pack.is_available && !pack.is_level_locked
    )
    const lockedPacks = packs.filter((pack) => pack.is_level_locked)

    return (
        <div className='mx-auto w-full max-w-6xl p-6'>
            <AnimatePresence mode='wait'>
                {!showingResults ? (
                    <motion.div
                        key='pack-selection'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className='mb-8 flex flex-col items-center gap-4'>
                            <h3 className='mb-4 text-xl font-bold text-white'>
                                Available packs
                            </h3>
                            {availablePacks.length === 0 ? (
                                <div className='py-8 text-center text-gray-400'>
                                    <Package
                                        size={48}
                                        className='mx-auto mb-4 opacity-50'
                                    />
                                    <p>
                                        No packs available at your current level
                                    </p>
                                    <p className='mt-2 text-sm'>
                                        Keep playing to unlock more packs!
                                    </p>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                    {availablePacks.map((pack) => (
                                        <PackCard
                                            key={pack.id}
                                            pack={pack}
                                            onOpen={() => handleOpenPack(pack)}
                                            isOpening={
                                                isOpening &&
                                                selectedPack?.id === pack.id
                                            }
                                            userAenergy={userAenergy}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {lockedPacks.length > 0 && (
                            <div className='mb-8 flex flex-col items-center gap-4'>
                                <h3 className='mb-4 text-xl font-bold text-white'>
                                    Unlock at higher levels
                                </h3>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                    {lockedPacks.map((pack) => (
                                        <PackCard
                                            key={pack.id}
                                            pack={pack}
                                            onOpen={() => {}}
                                            isLocked={true}
                                            userAenergy={userAenergy}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key='pack-opening'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className='text-center'
                    >
                        <div className='mb-8'>
                            <h2 className='mb-2 text-3xl font-bold text-white'>
                                {selectedPack?.name} opened!
                            </h2>
                            <p className='text-gray-400'>
                                Drag cards in any direction to reveal them
                            </p>
                        </div>

                        <div className='flex flex-col items-center gap-12'>
                            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-12'>
                                {/* Left revealed card */}
                                {currentCardIndex > 0 && (
                                    <motion.div
                                        key={`revealed-0`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className='relative'>
                                            <PhotocardDisplay
                                                photocard={revealedCards[0]}
                                                isOwned={true}
                                                size='medium'
                                                className='transform'
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {currentCardIndex > 1 && (
                                    <motion.div
                                        key={`revealed-1`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className='relative'>
                                            <PhotocardDisplay
                                                photocard={revealedCards[1]}
                                                isOwned={true}
                                                size='medium'
                                                className='transform'
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {currentCardIndex > 2 && (
                                    <motion.div
                                        key={`revealed-2`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className='relative'>
                                            <PhotocardDisplay
                                                photocard={revealedCards[2]}
                                                isOwned={true}
                                                size='medium'
                                                className='transform'
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            {currentCardIndex >= revealedCards.length && (
                                <div className='flex justify-center'>
                                    <Button
                                        onClick={resetOpening}
                                        className='bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 text-white hover:from-purple-600 hover:to-pink-600'
                                        size='lg'
                                    >
                                        Open another pack
                                    </Button>
                                </div>
                            )}

                            {/* Center card stack for dragging */}
                            {currentCardIndex < revealedCards.length && (
                                <div className='relative mb-8 flex min-h-[400px] items-center justify-center'>
                                    <AnimatePresence mode='popLayout'>
                                        {revealedCards.map(
                                            (card, index) =>
                                                index >= currentCardIndex && (
                                                    <motion.div
                                                        key={`stack-${index}`}
                                                        className='perspective-1000 absolute'
                                                        initial={false}
                                                        animate={{
                                                            x:
                                                                (index -
                                                                    currentCardIndex) *
                                                                10,
                                                            y:
                                                                (index -
                                                                    currentCardIndex) *
                                                                10,
                                                            rotate:
                                                                (index -
                                                                    currentCardIndex) *
                                                                2,
                                                            scale:
                                                                index ===
                                                                currentCardIndex
                                                                    ? 1
                                                                    : 0.95,
                                                        }}
                                                        style={{
                                                            zIndex:
                                                                revealedCards.length -
                                                                index,
                                                        }}
                                                    >
                                                        {index ===
                                                        currentCardIndex ? (
                                                            <motion.div
                                                                drag
                                                                dragConstraints={{
                                                                    left: -100,
                                                                    right: 100,
                                                                    top: -100,
                                                                    bottom: 100,
                                                                }}
                                                                dragElastic={
                                                                    0.7
                                                                }
                                                                onDragEnd={(
                                                                    e,
                                                                    { offset }
                                                                ) => {
                                                                    const distance =
                                                                        Math.sqrt(
                                                                            Math.pow(
                                                                                offset.x,
                                                                                2
                                                                            ) +
                                                                                Math.pow(
                                                                                    offset.y,
                                                                                    2
                                                                                )
                                                                        )
                                                                    if (
                                                                        distance >
                                                                        100
                                                                    ) {
                                                                        handleCardReveal()
                                                                    }
                                                                }}
                                                                className='preserve-3d relative'
                                                                animate={{
                                                                    rotateY:
                                                                        card.isHidden
                                                                            ? 0
                                                                            : 180,
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 260,
                                                                    damping: 20,
                                                                }}
                                                                style={{
                                                                    cursor: card.isHidden
                                                                        ? 'grab'
                                                                        : 'default',
                                                                }}
                                                            >
                                                                <motion.div className='absolute inset-0 flex h-64 w-48 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 backface-hidden'>
                                                                    <Package
                                                                        size={
                                                                            48
                                                                        }
                                                                        className='text-white'
                                                                    />
                                                                </motion.div>

                                                                <motion.div className='rotate-y-180 backface-hidden'>
                                                                    <PhotocardDisplay
                                                                        photocard={
                                                                            card
                                                                        }
                                                                        isOwned={
                                                                            true
                                                                        }
                                                                        size='large'
                                                                        className='transform'
                                                                    />
                                                                </motion.div>
                                                            </motion.div>
                                                        ) : (
                                                            <div className='flex h-64 w-48 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700'>
                                                                <Package
                                                                    size={48}
                                                                    className='text-white opacity-50'
                                                                />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

interface PackCardProps {
    pack: PhotocardPack & { is_available?: boolean }
    onOpen: () => void
    isOpening?: boolean
    isLocked?: boolean
    userAenergy: number
}

function PackCard({
    pack,
    onOpen,
    isOpening = false,
    isLocked = false,
    userAenergy,
}: PackCardProps) {
    const [error, setError] = useState<string | null>(null)
    const [nextAvailable, setNextAvailable] = useState<Date | null>(null)
    const [timeLeft, setTimeLeft] = useState<string>('')
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const checkCooldown = async () => {
            if (pack.cost_type === 'free') {
                try {
                    const response = await fetch(
                        '/api/photocards/packs/cooldown',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pack_id: pack.id }),
                        }
                    )
                    const data = await response.json()

                    if (data.next_available) {
                        setNextAvailable(new Date(data.next_available))
                    }
                } catch (error) {
                    console.error('Error checking cooldown:', error)
                } finally {
                    setIsChecking(false)
                }
            } else {
                setIsChecking(false)
            }
        }

        checkCooldown()
    }, [pack.cost_type, pack.id])

    useEffect(() => {
        if (nextAvailable) {
            const calculateTimeLeft = () => {
                const now = new Date()
                const diff = nextAvailable.getTime() - now.getTime()

                if (diff <= 0) {
                    setNextAvailable(null)
                    setTimeLeft('')
                    setError(null)
                    return false
                }

                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor(
                    (diff % (1000 * 60 * 60)) / (1000 * 60)
                )
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)

                const formattedHours = String(hours).padStart(2, '0')
                const formattedMinutes = String(minutes).padStart(2, '0')
                const formattedSeconds = String(seconds).padStart(2, '0')

                setTimeLeft(
                    `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
                )
                return true
            }

            if (!calculateTimeLeft()) return

            const interval = setInterval(calculateTimeLeft, 1000)
            return () => clearInterval(interval)
        }
    }, [nextAvailable])

    const handleOpenClick = () => {
        try {
            onOpen()
            setError(null)
        } catch (error: unknown) {
            const err = error as { error?: string; next_available?: string }
            if (err.next_available) {
                setNextAvailable(new Date(err.next_available))
            }
            setError(err.error || 'Failed to open pack')
        }
    }

    const canOpen =
        !isLocked &&
        !isChecking &&
        (pack.cost_type === 'free' ||
            (pack.cost_type === 'aenergy' && userAenergy >= pack.cost_amount))

    return (
        <Card className='relative overflow-hidden bg-black/50 transition-all hover:bg-black/60'>
            <CardContent className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                    <h3 className='text-xl font-bold text-white'>
                        {pack.name}
                    </h3>
                    {pack.cost_type === 'aenergy' ? (
                        <div className='flex items-center gap-2'>
                            <AenergyIcon />
                            <span className='font-bold text-purple-400'>
                                {pack.cost_amount}
                            </span>
                        </div>
                    ) : (
                        <div className='rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400'>
                            Free
                        </div>
                    )}
                </div>

                <p className='mb-4 text-sm text-gray-400'>{pack.description}</p>

                <div className='mb-6 flex items-center gap-4'>
                    <div>
                        <p className='text-sm text-gray-400'>Cards per pack</p>
                        <p className='font-bold text-white'>
                            {pack.cards_per_pack}
                        </p>
                    </div>
                    {pack.guaranteed_rarity && (
                        <div>
                            <p className='text-sm text-gray-400'>
                                Guaranteed rarity
                            </p>
                            <p
                                className='font-bold'
                                style={{
                                    color: RARITY_CONFIG[pack.guaranteed_rarity]
                                        .color,
                                }}
                            >
                                {RARITY_CONFIG[pack.guaranteed_rarity].name}
                            </p>
                        </div>
                    )}
                </div>

                {error && <p className='mb-4 text-sm text-red-400'>{error}</p>}

                <Button
                    onClick={handleOpenClick}
                    disabled={!canOpen || isOpening || !!timeLeft || isChecking}
                    className={`w-full transition-all ${
                        canOpen && !timeLeft && !isChecking
                            ? 'cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                            : 'cursor-not-allowed bg-gray-600 text-gray-400'
                    } `}
                >
                    {isLocked ? (
                        <>
                            <Package className='mr-2 h-5 w-5' />
                            Available at level {pack.available_from_level}
                        </>
                    ) : isChecking ? (
                        'Checking availability...'
                    ) : isOpening ? (
                        'Opening...'
                    ) : timeLeft ? (
                        <>
                            Available in
                            <span className='font-mono text-yellow-400'>
                                {timeLeft}
                            </span>
                        </>
                    ) : (
                        'Open pack'
                    )}
                </Button>
            </CardContent>

            {canOpen && !isLocked && !timeLeft && !isChecking && (
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5' />
            )}
        </Card>
    )
}

const AenergyIcon = () => {
    return (
        <>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 64 64'
            >
                <path
                    fill='#890096'
                    d='M43.4.159L12.06 28.492l24.31 7.538L18.12 64l35.26-33.426l-18.978-8.464z'
                />
            </svg>
        </>
    )
}
