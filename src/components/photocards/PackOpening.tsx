'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Package, Gift } from 'lucide-react'
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
    userLevel: number
    onOpeningComplete?: () => void
}

export default function PackOpening({
    packs,
    onOpenPack,
    userLevel,
    onOpeningComplete,
}: PackOpeningProps) {
    const [selectedPack, setSelectedPack] = useState<PhotocardPack | null>(null)
    const [isOpening, setIsOpening] = useState(false)
    const [openingResult, setOpeningResult] =
        useState<PackOpeningResult | null>(null)
    const [revealedCards, setRevealedCards] = useState<Photocard[]>([])
    const [showingResults, setShowingResults] = useState(false)

    const handleOpenPack = async (pack: PhotocardPack) => {
        if (isOpening) return

        setSelectedPack(pack)
        setIsOpening(true)
        setRevealedCards([])
        setShowingResults(false)

        try {
            const result = await onOpenPack(pack.id)
            console.log('Opening result:', result)
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

        for (let i = 0; i < cards.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 800))
            setRevealedCards((prev) => [...prev, cards[i]])
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
                                            userLevel={userLevel}
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
                                            userLevel={userLevel}
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
                                        className='flex justify-center'
                                    >
                                        {revealedCards[index] ? (
                                            <motion.div
                                                initial={{
                                                    scale: 0,
                                                    rotate: 180,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 300,
                                                    damping: 20,
                                                    delay: 0.2,
                                                }}
                                            >
                                                <PhotocardDisplay
                                                    photocard={
                                                        revealedCards[index]
                                                    }
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
                                            </motion.div>
                                        ) : (
                                            <motion.div className='flex h-64 w-48 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700'>
                                                <Package
                                                    size={48}
                                                    className='text-white'
                                                />
                                            </motion.div>
                                        )}
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
    userLevel: number
}

function PackCard({
    pack,
    onOpen,
    isOpening = false,
    isLocked = false,
}: PackCardProps) {
    const canAfford = pack.is_available && !isLocked

    return (
        <motion.div whileTap={canAfford ? { scale: 0.98 } : {}}>
            <Card
                className={`relative max-w-[300px] cursor-pointer overflow-hidden transition-all ${
                    canAfford
                        ? 'border-purple-400/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20'
                        : 'border-gray-600 opacity-60'
                } ${isOpening ? 'animate-pulse border-yellow-400' : ''} `}
            >
                <CardContent className='p-6'>
                    <div className='mb-4 text-center'>
                        <motion.div
                            animate={
                                isOpening ? { rotate: [0, 10, -10, 0] } : {}
                            }
                            transition={{
                                duration: 0.5,
                                repeat: isOpening ? Infinity : 0,
                            }}
                        >
                            <Package
                                size={48}
                                className={`mx-auto ${canAfford ? 'text-purple-400' : 'text-gray-500'}`}
                            />
                        </motion.div>
                    </div>

                    <div className='mb-4 text-center'>
                        <h3
                            className={`mb-2 text-lg font-bold ${canAfford ? 'text-white' : 'text-gray-400'}`}
                        >
                            {pack.name}
                        </h3>
                        <p
                            className={`mb-3 text-sm ${canAfford ? 'text-gray-300' : 'text-gray-500'}`}
                        >
                            {pack.description}
                        </p>

                        <div className='space-y-1 text-xs'>
                            <div
                                className={
                                    canAfford
                                        ? 'text-gray-300'
                                        : 'text-gray-500'
                                }
                            >
                                {pack.cards_per_pack} cards per pack
                            </div>
                            {pack.guaranteed_rarity && (
                                <div className='text-yellow-400'>
                                    Guaranteed {pack.guaranteed_rarity}+
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='mb-4'>
                        <div
                            className={`text-center text-sm ${canAfford ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {isLocked ? (
                                <>
                                    🔒 Unlocks at level{' '}
                                    {pack.available_from_level}
                                </>
                            ) : pack.cost_type === 'free' ? (
                                <>🎁 Free pack</>
                            ) : pack.cost_type === 'level' ? (
                                <>⭐ Level {pack.cost_amount} required</>
                            ) : (
                                <>
                                    💎 Costs {pack.cost_amount} {pack.cost_type}
                                </>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={onOpen}
                        disabled={!canAfford || isOpening}
                        className={`w-full transition-all ${
                            canAfford
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                : 'cursor-not-allowed bg-gray-600 text-gray-400'
                        } `}
                    >
                        {isOpening ? (
                            <>
                                <Sparkles
                                    className='mr-2 animate-spin'
                                    size={16}
                                />
                                Opening...
                            </>
                        ) : isLocked ? (
                            `Level ${pack.available_from_level} required`
                        ) : (
                            `Open pack`
                        )}
                    </Button>
                </CardContent>

                {canAfford && !isLocked && (
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5' />
                )}
            </Card>
        </motion.div>
    )
}
