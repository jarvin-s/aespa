import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import type { Photocard, PhotocardEra } from '@/lib/photocard-types'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const searchParams = request.nextUrl.searchParams
        
        // Optional filters
        const member = searchParams.get('member')
        const era = searchParams.get('era')
        const rarity = searchParams.get('rarity')
        const minLevel = searchParams.get('min_level')
        const userOwned = searchParams.get('user_owned') === 'true'
        
        let query = supabase
            .from('photocards')
            .select(`
                *,
                era:photocard_eras(*)
            `)
            .order('rarity', { ascending: false })
            .order('level_required', { ascending: true })
        
        // Apply filters
        if (member && member !== 'all') {
            query = query.eq('member', member)
        }
        
        if (era && era !== 'all') {
            query = query.eq('era_id', era)
        }
        
        if (rarity && rarity !== 'all') {
            query = query.eq('rarity', rarity)
        }
        
        if (minLevel) {
            query = query.lte('level_required', parseInt(minLevel))
        }
        
        const { data: photocards, error } = await query
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        
        // If user wants to see only their owned cards
        if (userOwned) {
            const { userId } = await auth()
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            
            const { data: userPhotocards, error: userError } = await supabase
                .from('user_photocards')
                .select('photocard_id')
                .eq('user_id', userId)
            
            if (userError) {
                return NextResponse.json({ error: userError.message }, { status: 500 })
            }
            
            const ownedIds = userPhotocards?.map(up => up.photocard_id) || []
            const ownedPhotocards = photocards?.filter(card => ownedIds.includes(card.id)) || []
            
            return NextResponse.json({ photocards: ownedPhotocards })
        }
        
        return NextResponse.json({ photocards: photocards || [] })
    } catch (error) {
        console.error('Error fetching photocards:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
} 