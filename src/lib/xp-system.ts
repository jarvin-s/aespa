export interface UserAccount {
    id: string
    user_id: string
    username: string
    avatar: string | null
    total_xp: number
    current_level: number
    xp_to_next_level: number
    total_quizzes_completed: number
    total_score: number
    aenergy: number
    created_at: string
    updated_at: string
}

export interface XPCalculationResult {
    xpEarned: number
    newTotalXP: number
    levelUp: boolean
    newLevel: number
    xpToNextLevel: number
    aenergyEarned: number
}

/**
 * Calculate XP earned based on quiz score
 * XP is calculated in increments of 500 based on score
 * @param score - Final quiz score
 * @returns XP earned
 */
export function calculateXPFromScore(score: number): number {
    return Math.floor(score / 500)
}

/**
 * Calculate XP required for a specific level
 * Level 1: 0 XP
 * Level 2: 100 XP (100 XP needed)
 * Level 3: 300 XP (200 XP more needed, total 300 XP from level 2)
 * Level 4: 600 XP (300 XP more needed, total 600 XP from level 3)
 * Pattern: Each level requires (level * 50) more XP than the previous level
 * @param level - Target level
 * @returns Total XP required to reach that level
 */
export function getXPRequiredForLevel(level: number): number {
    if (level <= 1) return 0

    let totalXP = 0
    for (let i = 2; i <= level; i++) {
        totalXP += (i - 1) * 50
    }
    return totalXP
}

/**
 * Calculate what level a user should be based on their total XP
 * @param totalXP - User's total XP
 * @returns Current level based on XP
 */
export function getLevelFromXP(totalXP: number): number {
    let level = 1
    let requiredXP = 0

    while (requiredXP <= totalXP) {
        level++
        const nextLevelXP = getXPRequiredForLevel(level)
        if (nextLevelXP > totalXP) {
            return level - 1
        }
        requiredXP = nextLevelXP
    }

    return level
}

/**
 * Calculate XP needed to reach the next level
 * @param currentLevel - User's current level
 * @param totalXP - User's total XP
 * @returns XP needed for next level
 */
export function getXPToNextLevel(currentLevel: number, totalXP: number): number {
    const nextLevel = currentLevel + 1
    const xpRequiredForNextLevel = getXPRequiredForLevel(nextLevel)
    return Math.max(0, xpRequiredForNextLevel - totalXP)
}

/**
 * Calculate ænergy earned from quiz completion
 * @param score - Quiz score
 * @returns ænergy earned
 */
export function calculateAenergyFromScore(score: number): number {
    return 5 + Math.floor(score / 2000)
}

/**
 * Calculate ænergy earned from leveling up
 * @param newLevel - The level reached
 * @returns ænergy earned
 */
export function calculateAenergyFromLevelUp(newLevel: number): number {
    return newLevel * 25
}

/**
 * Calculate level progression and ænergy rewards
 * @param currentXP - User's current total XP
 * @param currentLevel - User's current level
 * @param scoreEarned - Score earned from quiz
 * @returns XP and ænergy calculation result
 */
export function calculateLevelProgression(
    currentXP: number,
    currentLevel: number,
    scoreEarned: number
): XPCalculationResult {
    const xpEarned = calculateXPFromScore(scoreEarned)
    const newTotalXP = currentXP + xpEarned
    const newLevel = getLevelFromXP(newTotalXP)
    const levelUp = newLevel > currentLevel
    const xpToNextLevel = getXPToNextLevel(newLevel, newTotalXP)

    const quizAenergy = calculateAenergyFromScore(scoreEarned)
    const levelUpAenergy = levelUp ? calculateAenergyFromLevelUp(newLevel) : 0
    const aenergyEarned = quizAenergy + levelUpAenergy

    return {
        xpEarned,
        newTotalXP,
        levelUp,
        newLevel,
        xpToNextLevel,
        aenergyEarned
    }
}

/**
 * Get level progression display info
 * @param level - Current level
 * @param totalXP - Total XP
 * @returns Display information for level progress
 */
export function getLevelProgressInfo(level: number, totalXP: number) {
    const currentLevelXP = getXPRequiredForLevel(level)
    const nextLevelXP = getXPRequiredForLevel(level + 1)
    const xpInCurrentLevel = totalXP - currentLevelXP
    const xpNeededForCurrentLevel = nextLevelXP - currentLevelXP
    const progressPercentage = xpNeededForCurrentLevel > 0
        ? (xpInCurrentLevel / xpNeededForCurrentLevel) * 100
        : 100

    return {
        currentLevelXP,
        nextLevelXP,
        xpInCurrentLevel,
        xpNeededForCurrentLevel,
        progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
        xpToNextLevel: nextLevelXP - totalXP
    }
} 