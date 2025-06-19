import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { calculateLevelProgression } from '@/lib/xp-system'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        const { data: userAccount, error } = await supabase
            .from('user_accounts')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error && error.code !== 'PGRST116') {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!userAccount) {
            const user = await (await clerkClient()).users.getUser(userId)
            const username = user.username || user.emailAddresses[0]?.emailAddress || 'Unknown'
            const avatar = user.imageUrl || '/images/default-avatar.png'

            const { data: newAccount, error: createError } = await supabase
                .from('user_accounts')
                .insert([{
                    user_id: userId,
                    username,
                    avatar,
                    total_xp: 0,
                    current_level: 1,
                    xp_to_next_level: 200,
                    total_quizzes_completed: 0,
                    total_score: 0
                }])
                .select()
                .single()

            if (createError) {
                return NextResponse.json({ error: createError.message }, { status: 500 })
            }

            return NextResponse.json({ userAccount: newAccount })
        }

        return NextResponse.json({ userAccount })
    } catch (error) {
        console.error('Error fetching user account:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

async function checkAndAwardBadges(userId: string, currentLevel: number) {
    try {
        const supabase = await createClient()

        const { data: eligibleBadges, error: badgesError } = await supabase
            .from('badges')
            .select('*')
            .gte('level_required', currentLevel)

        if (badgesError) {
            console.error('Error fetching eligible badges:', badgesError)
            return
        }

        if (!eligibleBadges || eligibleBadges.length === 0) {
            return
        }

        const { data: userBadges, error: userBadgesError } = await supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', userId)

        if (userBadgesError) {
            console.error('Error fetching user badges:', userBadgesError)
            return
        }

        const userBadgeIds = userBadges?.map((ub: { badge_id: number }) => ub.badge_id) || []

        const newBadges = eligibleBadges.filter((badge: { id: number }) => !userBadgeIds.includes(badge.id))

        if (newBadges.length > 0) {
            const { error: insertError } = await supabase
                .from('user_badges')
                .insert(
                    newBadges.map((badge: { id: number }) => ({
                        user_id: userId,
                        badge_id: badge.id
                    }))
                )

            if (insertError) {
                console.error('Error awarding badges:', insertError)
            }
        }
    } catch (error) {
        console.error('Error in checkAndAwardBadges:', error)
    }
}

async function awardLevelMilestonePack(userId: string, level: number) {
    try {
        const supabase = await createClient()

        let packId = 2 // Level up pack by default
        if (level >= 25) {
            packId = 5 // Legendary pack
        } else if (level >= 15) {
            packId = 4 // Elite pack
        } else if (level >= 10) {
            packId = 3 // Premium pack
        }

        const { data: availableCards } = await supabase
            .from('photocards')
            .select('*')
            .lte('level_required', level)

        if (!availableCards || availableCards.length === 0) {
            return
        }

        const cardsToAward: number[] = []
        const guaranteedRarities = level >= 25 ? ['epic', 'legendary'] : level >= 15 ? ['rare', 'epic'] : level >= 10 ? ['uncommon', 'rare'] : ['uncommon']

        for (let i = 0; i < 3; i++) {
            let selectedCard
            if (i === 0) {
                const eligibleCards = availableCards.filter(card =>
                    guaranteedRarities.includes(card.rarity)
                )
                selectedCard = eligibleCards[Math.floor(Math.random() * eligibleCards.length)]
            } else {
                const weights = availableCards.map(card => card.drop_weight || 100)
                const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
                let random = Math.random() * totalWeight

                for (let j = 0; j < availableCards.length; j++) {
                    random -= weights[j]
                    if (random <= 0) {
                        selectedCard = availableCards[j]
                        break
                    }
                }
            }

            if (selectedCard) {
                cardsToAward.push(selectedCard.id)
            }
        }

        await supabase
            .from('pack_openings')
            .insert({
                user_id: userId,
                pack_id: packId,
                cards_obtained: cardsToAward
            })
            .select()
            .single()

        const { data: existingCards } = await supabase
            .from('user_photocards')
            .select('photocard_id, quantity')
            .eq('user_id', userId)
            .in('photocard_id', cardsToAward)

        const existingCardMap = new Map(
            existingCards?.map((ec: { photocard_id: number; quantity: number }) => [
                ec.photocard_id,
                ec.quantity,
            ]) || []
        )

        const newCards = cardsToAward.filter(cardId => !existingCardMap.has(cardId))
        const duplicateCards = cardsToAward.filter(cardId => existingCardMap.has(cardId))

        if (newCards.length > 0) {
            const cardsToInsert = newCards.map(cardId => ({
                user_id: userId,
                photocard_id: cardId,
                obtained_method: 'level_reward' as const,
                quantity: 1
            }))

            await supabase
                .from('user_photocards')
                .insert(cardsToInsert)
        }

        for (const cardId of duplicateCards) {
            const currentQuantity = existingCardMap.get(cardId) || 1
            await supabase
                .from('user_photocards')
                .update({ quantity: currentQuantity + 1 })
                .eq('user_id', userId)
                .eq('photocard_id', cardId)
        }

        console.log(`Awarded level ${level} milestone pack to user ${userId}: ${cardsToAward.length} cards (${newCards.length} new, ${duplicateCards.length} duplicates)`)

    } catch (error) {
        console.error('Error awarding level milestone pack:', error)
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { scoreEarned } = body

        if (typeof scoreEarned !== 'number' || scoreEarned < 0) {
            return NextResponse.json(
                { error: 'Valid scoreEarned is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data: currentAccount, error: fetchError } = await supabase
            .from('user_accounts')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        if (!currentAccount) {
            return NextResponse.json({ error: 'User account not found' }, { status: 404 })
        }

        const progression = calculateLevelProgression(
            currentAccount.total_xp,
            currentAccount.current_level,
            scoreEarned
        )

        const { data: updatedAccount, error: updateError } = await supabase
            .from('user_accounts')
            .update({
                total_xp: progression.newTotalXP,
                current_level: progression.newLevel,
                xp_to_next_level: progression.xpToNextLevel,
                total_quizzes_completed: currentAccount.total_quizzes_completed + 1,
                total_score: currentAccount.total_score + scoreEarned
            })
            .eq('user_id', userId)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        if (progression.newLevel > currentAccount.current_level) {
            await checkAndAwardBadges(userId, progression.newLevel)

            if (progression.newLevel % 5 === 0) {
                await awardLevelMilestonePack(userId, progression.newLevel)
            }
        }

        const { data: userBadges } = await supabase
            .from('user_badges')
            .select(`
                badge_id,
                badges (
                    id,
                    title,
                    description,
                    image
                )
            `)
            .eq('user_id', userId)

        const badges = userBadges?.map(ub => ub.badges) || []

        return NextResponse.json({
            userAccount: {
                ...updatedAccount,
                badges
            },
            progression: {
                xpEarned: progression.xpEarned,
                levelUp: progression.levelUp,
                newLevel: progression.newLevel,
                previousLevel: currentAccount.current_level
            }
        })
    } catch (error) {
        console.error('Error updating user account:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const user = await (await clerkClient()).users.getUser(userId)
        const username = user.username || user.emailAddresses[0]?.emailAddress || 'Unknown'
        const avatar = user.imageUrl || '/images/default-avatar.png'

        const { data: existingAccount } = await supabase
            .from('user_accounts')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (existingAccount) {
            const { data: updatedAccount, error: updateError } = await supabase
                .from('user_accounts')
                .update({
                    username,
                    avatar
                })
                .eq('user_id', userId)
                .select()
                .single()

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 })
            }

            return NextResponse.json({ userAccount: updatedAccount })
        } else {
            const { data: newAccount, error: createError } = await supabase
                .from('user_accounts')
                .insert([{
                    user_id: userId,
                    username,
                    avatar,
                    total_xp: 0,
                    current_level: 1,
                    xp_to_next_level: 200,
                    total_quizzes_completed: 0,
                    total_score: 0
                }])
                .select()
                .single()

            if (createError) {
                return NextResponse.json({ error: createError.message }, { status: 500 })
            }

            return NextResponse.json({ userAccount: newAccount })
        }
    } catch (error) {
        console.error('Error creating/updating user account:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 