import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'

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

        const { data: pack, error: packError } = await supabase
            .from('photocard_packs')
            .select('cost_type')
            .eq('id', pack_id)
            .single()

        if (packError || !pack) {
            return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
        }

        if (pack.cost_type !== 'free') {
            return NextResponse.json({ error: 'Not a free pack' }, { status: 400 })
        }

        const { data: cooldown } = await supabase
            .from('pack_opening_cooldowns')
            .select('last_opened_at')
            .eq('user_id', userId)
            .eq('pack_id', pack_id)
            .single()

        if (cooldown) {
            const lastOpened = new Date(cooldown.last_opened_at)
            const now = new Date()
            const nextAvailable = new Date(lastOpened)
            nextAvailable.setDate(nextAvailable.getDate() + 1)

            if (now < nextAvailable) {
                return NextResponse.json({
                    next_available: nextAvailable.toISOString()
                })
            }
        }

        return NextResponse.json({})

    } catch (error) {
        console.error('Error checking pack cooldown:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 