'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package, Gift } from 'lucide-react'
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
    const [openingResult, setOpeningResult] =
        useState<PackOpeningResult | null>(null)
    const [revealedCards, setRevealedCards] = useState<(Photocard & { isHidden?: boolean })[]>([])
    const [showingResults, setShowingResults] = useState(false)
    const [cardsVisible, setCardsVisible] = useState(false)

    const handleOpenPack = async (pack: PhotocardPack) => {
        if (isOpening) return

        setSelectedPack(pack)
        setIsOpening(true)
        setRevealedCards([])
        setShowingResults(false)
        setCardsVisible(false)

        try {
            const result = await onOpenPack(pack.id)
            setOpeningResult(result)
            await animateCardReveal(result.cards_obtained)
        } catch (error) {
            console.error('Error opening pack:', error)
        } finally {
            setIsOpening(false)
        }
    }

    const animateCardReveal = async (cards: Photocard[]) => {
        setShowingResults(true)
        
        setRevealedCards(cards.map(card => ({ ...card, isHidden: true })))
        
        setCardsVisible(true)

        await new Promise((resolve) => setTimeout(resolve, 500))

        for (let i = 0; i < cards.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setRevealedCards(prev => {
                const newCards = [...prev]
                newCards[i] = { ...cards[i], isHidden: false }
                return newCards
            })
        }
    }

    const resetOpening = () => {
        if (onOpeningComplete) {
            onOpeningComplete()
        }
        setSelectedPack(null)
        setOpeningResult(null)
        setRevealedCards([])
        setShowingResults(false)
        setCardsVisible(false)
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
                        <div className='mb-8 text-center'>
                            <motion.div className='mb-4 inline-block'>
                                <Gift size={48} className='text-purple-500' />
                            </motion.div>
                            <h2 className='mb-2 text-3xl font-bold text-white md:text-5xl'>
                                Photocard packs
                            </h2>
                            <p className='text-md text-gray-300 md:text-xl'>
                                Open packs to collect aespa photocards!
                            </p>
                        </div>

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
                        </div>

                        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
                            {selectedPack &&
                                Array.from({
                                    length: selectedPack.cards_per_pack,
                                }).map((_, index) => (
                                    <div
                                        key={index}
                                        className='flex justify-center perspective-1000'
                                    >
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ 
                                                opacity: cardsVisible ? 1 : 0,
                                                rotateY: revealedCards[index]?.isHidden ? 0 : 180,
                                            }}
                                            transition={{
                                                opacity: { duration: 0.3 },
                                                rotateY: {
                                                    type: 'spring',
                                                    stiffness: 260,
                                                    damping: 20,
                                                }
                                            }}
                                            className='relative preserve-3d'
                                        >
                                            {/* Front side (Package) */}
                                            <motion.div 
                                                className='absolute inset-0 flex h-64 w-48 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 backface-hidden'
                                            >
                                                <Package
                                                    size={48}
                                                    className='text-white'
                                                />
                                            </motion.div>

                                            {/* Back side (Photocard) */}
                                            <motion.div
                                                className='backface-hidden rotate-y-180'
                                            >
                                                {revealedCards[index] && (
                                                    <>
                                                        <PhotocardDisplay
                                                            photocard={revealedCards[index]}
                                                            isOwned={true}
                                                            size='large'
                                                            className='transform hover:scale-105'
                                                        />
                                                        {openingResult?.new_cards.includes(
                                                            revealedCards[index]
                                                        ) && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 20,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                className='mt-2 font-bold text-green-400'
                                                            >
                                                                NEW!
                                                            </motion.div>
                                                        )}
                                                    </>
                                                )}
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                ))}
                        </div>

                        {openingResult &&
                            revealedCards.length ===
                                openingResult.cards_obtained.length && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className='mb-6'
                                >
                                    <Card className='border-purple-500/30 bg-black/40'>
                                        <CardContent className='p-6'>
                                            <h3 className='mb-4 text-xl font-bold text-white'>
                                                Opening results
                                            </h3>
                                            <div className='flex flex-col justify-center gap-4 text-center md:flex-row'>
                                                <div>
                                                    <div className='text-2xl font-bold text-green-400'>
                                                        {
                                                            openingResult
                                                                .new_cards
                                                                .length
                                                        }
                                                    </div>
                                                    <div className='text-sm text-gray-300'>
                                                        New cards
                                                    </div>
                                                </div>
                                                <div className='flex flex-col justify-between text-sm text-gray-300'>
                                                    Rarities obtained:
                                                    <div className='flex justify-center gap-2'>
                                                        {Object.entries(
                                                            openingResult.cards_obtained.reduce(
                                                                (acc, card) => {
                                                                    acc[
                                                                        card.rarity
                                                                    ] =
                                                                        (acc[
                                                                            card
                                                                                .rarity
                                                                        ] ||
                                                                            0) +
                                                                        1
                                                                    return acc
                                                                },
                                                                {} as Record<
                                                                    string,
                                                                    number
                                                                >
                                                            )
                                                        ).map(
                                                            ([
                                                                rarity,
                                                                count,
                                                            ]) => {
                                                                const config =
                                                                    RARITY_CONFIG[
                                                                        rarity as keyof typeof RARITY_CONFIG
                                                                    ]
                                                                return (
                                                                    <div
                                                                        key={
                                                                            rarity
                                                                        }
                                                                        className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold ${config.gradient} text-white`}
                                                                    >
                                                                        {count}x{' '}
                                                                        {
                                                                            config.name
                                                                        }
                                                                    </div>
                                                                )
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className='text-2xl font-bold text-yellow-400'>
                                                        {
                                                            openingResult
                                                                .duplicates
                                                                .length
                                                        }
                                                    </div>
                                                    <div className='text-sm text-gray-300'>
                                                        Duplicates
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                        <Button
                            onClick={resetOpening}
                            className='bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 text-white hover:from-purple-600 hover:to-pink-600'
                            size='lg'
                        >
                            Open another pack
                        </Button>
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
