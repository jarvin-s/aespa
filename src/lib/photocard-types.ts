export type PhotocardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type PhotocardMember = 'karina' | 'winter' | 'giselle' | 'ningning' | 'group'
export type PackCostType = 'aenergy' | 'free'
export type ObtainedMethod = 'pack_opening' | 'level_reward' | 'achievement' | 'special_event'

export interface PhotocardEra {
    id: number
    name: string
    display_name: string
    description?: string
    start_date?: string
    end_date?: string
    primary_color: string
    secondary_color: string
    background_image?: string
    is_active: boolean
    created_at: string
}

export interface Photocard {
    id: number
    member: PhotocardMember
    era_id: number
    name: string
    description?: string
    image_url: string
    rarity: PhotocardRarity
    level_required: number
    drop_weight: number
    is_event_exclusive: boolean
    is_achievement_reward: boolean
    border_color?: string
    background_gradient?: string
    special_effects?: string[]
    created_at: string
    updated_at: string
    era?: PhotocardEra
    isHidden?: boolean
}

export interface UserPhotocard {
    id: string
    user_id: string
    photocard_id: number
    obtained_at: string
    obtained_method: ObtainedMethod
    quantity: number
    is_favorited: boolean
    photocard?: Photocard
}

export interface PhotocardPack {
    id: number
    name: string
    description?: string
    icon_url?: string
    cost_type: PackCostType
    cost_amount: number
    cards_per_pack: number
    guaranteed_rarity?: PhotocardRarity
    available_from_level: number
    is_active: boolean
    created_at: string
}

export interface PackOpening {
    id: string
    user_id: string
    pack_id: number
    cards_obtained: number[]
    opened_at: string
    pack?: PhotocardPack
    photocards?: Photocard[]
}

export interface CollectionStats {
    total_cards: number
    total_owned: number
    completion_percentage: number
    by_rarity: {
        [key in PhotocardRarity]: {
            total: number
            owned: number
        }
    }
    by_member: {
        [key in PhotocardMember]: {
            total: number
            owned: number
        }
    }
    by_era: {
        [era_name: string]: {
            total: number
            owned: number
            era: PhotocardEra
        }
    }
    recent_acquisitions: UserPhotocard[]
    rarest_owned: Photocard[]
}

export interface PackOpeningResult {
    success: boolean
    pack: PhotocardPack
    cards_obtained: Photocard[]
    new_cards: Photocard[]
    duplicates: Photocard[]
    opening_id: string
}

export const RARITY_CONFIG: Record<PhotocardRarity, {
    color: string
    gradient: string
    glow: string
    name: string
    dropRate: string
}> = {
    common: {
        color: '#9CA3AF',
        gradient: 'from-gray-400 to-gray-600',
        glow: 'shadow-gray-400/20',
        name: 'Common',
        dropRate: '60%'
    },
    uncommon: {
        color: '#10B981',
        gradient: 'from-green-400 to-green-600',
        glow: 'shadow-green-400/30',
        name: 'Uncommon',
        dropRate: '25%'
    },
    rare: {
        color: '#3B82F6',
        gradient: 'from-blue-400 to-blue-600',
        glow: 'shadow-blue-400/40',
        name: 'Rare',
        dropRate: '10%'
    },
    epic: {
        color: '#8B5CF6',
        gradient: 'from-purple-400 to-purple-600',
        glow: 'shadow-purple-400/50',
        name: 'Epic',
        dropRate: '4%'
    },
    legendary: {
        color: '#F59E0B',
        gradient: 'from-yellow-400 to-orange-500',
        glow: 'shadow-yellow-400/60',
        name: 'Legendary',
        dropRate: '1%'
    }
}

export const MEMBER_CONFIG: Record<PhotocardMember, {
    color: string
    name: string
    displayName: string
}> = {
    karina: {
        color: '#FF1493',
        name: 'karina',
        displayName: 'Karina'
    },
    winter: {
        color: '#87CEEB',
        name: 'winter',
        displayName: 'Winter'
    },
    giselle: {
        color: '#32CD32',
        name: 'giselle',
        displayName: 'Giselle'
    },
    ningning: {
        color: '#FFD700',
        name: 'ningning',
        displayName: 'Ningning'
    },
    group: {
        color: '#A855F7',
        name: 'group',
        displayName: 'aespa'
    }
}

export function getRarityWeight(rarity: PhotocardRarity): number {
    switch (rarity) {
        case 'common': return 60
        case 'uncommon': return 25
        case 'rare': return 10
        case 'epic': return 4
        case 'legendary': return 1
        default: return 60
    }
}

export function formatObtainedMethod(method: ObtainedMethod): string {
    switch (method) {
        case 'pack_opening': return 'Pack opening'
        case 'level_reward': return 'Level reward'
        case 'achievement': return 'Achievement'
        case 'special_event': return 'Special event'
        default: return 'Unknown'
    }
}

export function canAffordPack(pack: PhotocardPack, userStats: { level: number, xp: number, score: number, aenergy: number }): boolean {
    if (userStats.level < pack.available_from_level) return false

    switch (pack.cost_type) {
        case 'free': return true
        case 'aenergy': return userStats.aenergy >= pack.cost_amount
        default: return false
    }
} 