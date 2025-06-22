import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import type {
    CollectionStats,
    UserPhotocard,
    PhotocardRarity,
    PhotocardMember
} from '@/lib/photocard-types'

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const searchParams = request.nextUrl.searchParams
        const includeStats = searchParams.get('stats') === 'true'

        // Get user's photocard collection
        const { data: userPhotocards, error: collectionError } = await supabase
            .from('user_photocards')
            .select(`
                *,
                photocard:photocards(
                    *,
                    era:photocard_eras(*)
                )
            `)
            .eq('user_id', userId)
            .order('obtained_at', { ascending: false })

        if (collectionError) {
            return NextResponse.json({ error: collectionError.message }, { status: 500 })
        }

        const collection = userPhotocards || []

        if (!includeStats) {
            return NextResponse.json({ collection })
        }

        // Get all photocards for statistics
        const { data: allPhotocards, error: allCardsError } = await supabase
            .from('photocards')
            .select(`
                *,
                era:photocard_eras(*)
            `)

        if (allCardsError) {
            return NextResponse.json({ error: allCardsError.message }, { status: 500 })
        }

        // Calculate collection statistics
        const stats = calculateCollectionStats(collection, allPhotocards || [])

        return NextResponse.json({
            collection,
            stats
        })

    } catch (error) {
        console.error('Error fetching collection:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { photocard_id, is_favorited } = body

        if (!photocard_id) {
            return NextResponse.json({ error: 'Photocard ID required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check if user owns this photocard
        const { data: existingCard, error: checkError } = await supabase
            .from('user_photocards')
            .select('*')
            .eq('user_id', userId)
            .eq('photocard_id', photocard_id)
            .single()

        if (checkError || !existingCard) {
            return NextResponse.json({ error: 'Photocard not found in collection' }, { status: 404 })
        }

        // Update favorite status
        const { data: updatedCard, error: updateError } = await supabase
            .from('user_photocards')
            .update({ is_favorited })
            .eq('user_id', userId)
            .eq('photocard_id', photocard_id)
            .select(`
                *,
                photocard:photocards(
                    *,
                    era:photocard_eras(*)
                )
            `)
            .single()

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            photocard: updatedCard
        })

    } catch (error) {
        console.error('Error updating collection:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

function calculateCollectionStats(
    userCollection: UserPhotocard[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allPhotocards: any[]
): CollectionStats {
    const totalCards = allPhotocards.length
    const totalOwned = userCollection.length
    const completionPercentage = totalCards > 0 ? (totalOwned / totalCards) * 100 : 0

    // Initialize counters
    const rarityStats: CollectionStats['by_rarity'] = {
        common: { total: 0, owned: 0 },
        uncommon: { total: 0, owned: 0 },
        rare: { total: 0, owned: 0 },
        epic: { total: 0, owned: 0 },
        legendary: { total: 0, owned: 0 }
    }

    const memberStats: CollectionStats['by_member'] = {
        karina: { total: 0, owned: 0 },
        winter: { total: 0, owned: 0 },
        giselle: { total: 0, owned: 0 },
        ningning: { total: 0, owned: 0 },
        group: { total: 0, owned: 0 }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eraStats: { [era_name: string]: { total: number, owned: number, era: any } } = {}

    // Get owned photocard IDs for quick lookup
    const ownedIds = new Set(userCollection.map(uc => uc.photocard_id))

    // Count totals and owned by category
    allPhotocards.forEach(card => {
        // Rarity stats
        if (card.rarity in rarityStats) {
            rarityStats[card.rarity as PhotocardRarity].total++
            if (ownedIds.has(card.id)) {
                rarityStats[card.rarity as PhotocardRarity].owned++
            }
        }

        // Member stats
        if (card.member in memberStats) {
            memberStats[card.member as PhotocardMember].total++
            if (ownedIds.has(card.id)) {
                memberStats[card.member as PhotocardMember].owned++
            }
        }

        // Era stats
        if (card.era) {
            if (!eraStats[card.era.name]) {
                eraStats[card.era.name] = {
                    total: 0,
                    owned: 0,
                    era: card.era
                }
            }
            eraStats[card.era.name].total++
            if (ownedIds.has(card.id)) {
                eraStats[card.era.name].owned++
            }
        }
    })

    // Get recent acquisitions (last 10)
    const recentAcquisitions = userCollection
        .sort((a, b) => new Date(b.obtained_at).getTime() - new Date(a.obtained_at).getTime())
        .slice(0, 10)

    // Get rarest owned cards
    const rarityOrder: PhotocardRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common']
    const ownedCards = userCollection
        .filter(uc => uc.photocard)
        .map(uc => uc.photocard!)
        .sort((a, b) => {
            const aIndex = rarityOrder.indexOf(a.rarity)
            const bIndex = rarityOrder.indexOf(b.rarity)
            return aIndex - bIndex
        })
    const rarestOwned = ownedCards.slice(0, 5)

    return {
        total_cards: totalCards,
        total_owned: totalOwned,
        completion_percentage: Math.round(completionPercentage * 100) / 100,
        by_rarity: rarityStats,
        by_member: memberStats,
        by_era: eraStats,
        recent_acquisitions: recentAcquisitions,
        rarest_owned: rarestOwned
    }
} 