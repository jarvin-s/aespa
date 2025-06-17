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

        return NextResponse.json({
            userAccount: updatedAccount,
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