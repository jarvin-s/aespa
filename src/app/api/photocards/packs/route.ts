import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import type {
    PhotocardPack,
    PackOpeningResult,
    Photocard,
} from '@/lib/photocard-types'
import { canAffordPack } from '@/lib/photocard-types'

// GET - List available packs for user
export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Get user's current level for pack availability
        const { data: userAccount, error: userError } = await supabase
            .from('user_accounts')
            .select('current_level, total_xp, total_score')
            .eq('user_id', userId)
            .single()

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 500 })
        }

        // Get all active packs
        const { data: packs, error: packsError } = await supabase
            .from('photocard_packs')
            .select('*')
            .eq('is_active', true)
            .order('available_from_level', { ascending: true })

        if (packsError) {
            return NextResponse.json({ error: packsError.message }, { status: 500 })
        }

        // Filter packs based on user level and affordability
        const availablePacks = (packs || []).map(pack => ({
            ...pack,
            is_available: canAffordPack(pack, {
                level: userAccount?.current_level || 1,
                xp: userAccount?.total_xp || 0,
                score: userAccount?.total_score || 0
            }),
            is_level_locked: (userAccount?.current_level || 1) < pack.available_from_level
        }))

        return NextResponse.json({ packs: availablePacks })

    } catch (error) {
        console.error('Error fetching packs:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Open a pack
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { pack_id } = body

        if (!pack_id) {
            return NextResponse.json({ error: 'Pack ID required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get pack details
        const { data: pack, error: packError } = await supabase
            .from('photocard_packs')
            .select('*')
            .eq('id', pack_id)
            .eq('is_active', true)
            .single()

        if (packError || !pack) {
            return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
        }

        // Get user's current stats
        const { data: userAccount, error: userError } = await supabase
            .from('user_accounts')
            .select('current_level, total_xp, total_score')
            .eq('user_id', userId)
            .single()

        if (userError || !userAccount) {
            return NextResponse.json({ error: 'User account not found' }, { status: 404 })
        }

        if (!canAffordPack(pack, {
            level: userAccount.current_level,
            xp: userAccount.total_xp,
            score: userAccount.total_score
        })) {
            return NextResponse.json({ error: 'Cannot afford this pack' }, { status: 403 })
        }

        const { data: availableCards, error: cardsError } = await supabase
            .from('photocards')
            .select(`
                *,
                era:photocard_eras(*)
            `)
            .lte('level_required', userAccount.current_level)

        if (cardsError) {
            return NextResponse.json({ error: cardsError.message }, { status: 500 })
        }

        if (!availableCards || availableCards.length === 0) {
            return NextResponse.json({ error: 'No cards available' }, { status: 400 })
        }

        // Open the pack (simulate card drops)
        const openingResult = await openPack(pack, availableCards, userId, supabase)

        return NextResponse.json(openingResult)

    } catch (error) {
        console.error('Error opening pack:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function openPack(
    pack: PhotocardPack,
    availableCards: Photocard[],
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any
): Promise<PackOpeningResult> {
    try {
        const cardsToGive: Photocard[] = []
        const newCards: Photocard[] = []
        const duplicates: Photocard[] = []

        // Get user's existing collection
        const { data: userCollection } = await supabase
            .from('user_photocards')
            .select('photocard_id, quantity')
            .eq('user_id', userId)

        const ownedCards = new Map(
            (userCollection || []).map((uc: { photocard_id: number; quantity: number }) => [
                uc.photocard_id,
                uc.quantity || 1,
            ])
        )

        for (let i = 0; i < pack.cards_per_pack; i++) {
            let selectedCard: Photocard | null = null

            if (i === 0 && pack.guaranteed_rarity) {
                const guaranteedCards = availableCards.filter(card =>
                    card.rarity === pack.guaranteed_rarity
                )
                if (guaranteedCards.length > 0) {
                    selectedCard = getRandomCard(guaranteedCards)
                }
            }

            if (!selectedCard) {
                selectedCard = getWeightedRandomCard(availableCards)
            }

            if (selectedCard) {
                cardsToGive.push(selectedCard)

                if (ownedCards.has(selectedCard.id)) {
                    duplicates.push(selectedCard)
                } else {
                    newCards.push(selectedCard)
                }
            }
        }

        // Record the pack opening
        const { data: packOpening, error: openingError } = await supabase
            .from('pack_openings')
            .insert({
                user_id: userId,
                pack_id: pack.id,
                cards_obtained: cardsToGive.map(card => card.id)
            })
            .select()
            .single()

        if (openingError) {
            throw new Error(`Failed to record pack opening: ${openingError.message}`)
        }

        // Handle new cards - insert them with quantity 1
        if (newCards.length > 0) {
            const cardsToInsert = newCards.map(card => ({
                user_id: userId,
                photocard_id: card.id,
                obtained_method: 'pack_opening' as const,
                quantity: 1
            }))

            const { error: insertError } = await supabase
                .from('user_photocards')
                .insert(cardsToInsert)

            if (insertError) {
                console.error('Error adding new cards to collection:', insertError)
            }
        }

        // Handle duplicates - update their quantities
        if (duplicates.length > 0) {
            for (const card of duplicates) {
                const currentQuantity = Number(ownedCards.get(card.id)) || 1
                const { error: updateError } = await supabase
                    .from('user_photocards')
                    .update({ quantity: currentQuantity + 1 })
                    .eq('user_id', userId)
                    .eq('photocard_id', card.id)

                if (updateError) {
                    console.error(`Error updating quantity for card ${card.id}:`, updateError)
                }
            }
        }

        return {
            success: true,
            pack,
            cards_obtained: cardsToGive,
            new_cards: newCards,
            duplicates,
            opening_id: packOpening.id
        }

    } catch (error) {
        console.error('Error in openPack:', error)
        return {
            success: false,
            pack,
            cards_obtained: [],
            new_cards: [],
            duplicates: [],
            opening_id: ''
        }
    }
}

function getRandomCard(cards: Photocard[]): Photocard {
    return cards[Math.floor(Math.random() * cards.length)]
}

function getWeightedRandomCard(cards: Photocard[]): Photocard {
    const totalWeight = cards.reduce((sum, card) => sum + card.drop_weight, 0)

    let random = Math.random() * totalWeight

    for (const card of cards) {
        random -= card.drop_weight
        if (random <= 0) {
            return card
        }
    }

    return cards[0]
} 