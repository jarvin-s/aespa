# XP System Implementation Guide

This guide explains how to set up and use the Experience Points (XP) system for user accounts in the aespa quiz application.

## Overview

The XP system tracks user progress through:
- **XP Calculation**: Every 2000 quiz points = 1 XP
- **Level Progression**: 
  - Level 1: 0 XP (starting level)
  - Level 2: 200 XP needed
  - Level 3: 400 more XP needed (600 total)
  - Level 4: 600 more XP needed (1200 total)
  - Pattern: Each level requires `(level - 1) * 200` more XP than the previous level

## Database Setup

### 1. Create the User Accounts Table

Run the SQL script in `database/user_accounts.sql` in your Supabase dashboard:

```sql
-- Create user_accounts table for XP and level tracking
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    username TEXT NOT NULL,
    avatar TEXT,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    xp_to_next_level INTEGER DEFAULT 200,
    total_quizzes_completed INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes and triggers (see full script for details)
```

### 2. Set Row Level Security (RLS)

The script includes RLS policies that allow:
- Users to read/update their own account data
- Public access to user data for leaderboards (username, level, XP only)

## API Endpoints

### `/api/user-account`

- **GET**: Fetch user account information (creates account if doesn't exist)
- **PUT**: Update user XP after quiz completion
- **POST**: Create or update user profile information

### Usage Examples

```typescript
// Fetch user account
const response = await fetch('/api/user-account')
const { userAccount } = await response.json()

// Update XP after quiz completion (handled automatically)
const response = await fetch('/api/user-account', {
    method: 'PUT',
    body: JSON.stringify({ scoreEarned: 8000 }) // = 4 XP
})
```

## XP Calculation Logic

The XP system uses the utility functions in `src/lib/xp-system.ts`:

### Key Functions

```typescript
// Calculate XP from quiz score
calculateXPFromScore(score: number): number

// Get total XP required for a specific level
getXPRequiredForLevel(level: number): number

// Calculate current level from total XP
getLevelFromXP(totalXP: number): number

// Calculate level progression after earning XP
calculateLevelProgression(currentXP: number, currentLevel: number, scoreEarned: number)
```

### Example Calculations

```typescript
// User scores 6000 points in a quiz
const xpEarned = calculateXPFromScore(6000) // = 3 XP

// Check level requirements
getXPRequiredForLevel(2) // = 200 XP
getXPRequiredForLevel(3) // = 600 XP
getXPRequiredForLevel(4) // = 1200 XP
```

## UI Components

### UserProfile Component

Display user XP and level information:

```jsx
import UserProfile from '@/components/ui/user-profile'

// Full profile view
<UserProfile />

// Compact view for navbar
<UserProfile showCompact={true} />
```

### Quiz Completion

The `QuizComplete` component automatically shows:
- XP earned from the quiz
- Current level and progress bar
- Level up animation if applicable

## Integration Points

### 1. Quiz Completion Flow

When a user completes a quiz:
1. Quiz score is calculated normally
2. `updateUserXP()` is called automatically in `/api/quiz` route
3. User account is updated with new XP and level
4. Quiz completion screen shows XP gained

### 2. Dashboard Integration

The dashboard now includes:
- User profile card showing level, XP, and progress
- Quiz history with scores
- Total statistics

### 3. Navbar Integration

The navbar displays a compact user profile showing:
- Current level
- Total XP
- Progress to next level

## Level Progression Examples

| Level | Total XP Required | XP for This Level |
|-------|------------------|-------------------|
| 1     | 0                | 0                 |
| 2     | 200              | 200               |
| 3     | 600              | 400               |
| 4     | 1,200            | 600               |
| 5     | 2,000            | 800               |
| 10    | 9,000            | 1,800             |

## Scoring Examples

| Quiz Score | XP Earned | Quizzes for Level 2 | Quizzes for Level 3 |
|------------|-----------|--------------------|--------------------|
| 2,000      | 1 XP      | 200 quizzes        | 400 more quizzes   |
| 4,000      | 2 XP      | 100 quizzes        | 200 more quizzes   |
| 6,000      | 3 XP      | 67 quizzes         | 134 more quizzes   |
| 8,000      | 4 XP      | 50 quizzes         | 100 more quizzes   |
| 10,000     | 5 XP      | 40 quizzes         | 80 more quizzes    |

## Testing the System

1. **Create a user account** by signing up and taking a quiz
2. **Check XP calculation** by completing quizzes with different scores
3. **Verify level progression** by accumulating enough XP
4. **Test UI components** in dashboard and navbar
5. **Check database updates** in Supabase dashboard

## Troubleshooting

### Common Issues

1. **User account not created**: Ensure Clerk authentication is working
2. **XP not updating**: Check API logs for errors in `/api/quiz` route
3. **Level not progressing**: Verify XP calculation logic
4. **UI not showing**: Check if user is authenticated and components are imported

### Database Queries for Debugging

```sql
-- Check user accounts
SELECT * FROM user_accounts ORDER BY total_xp DESC;

-- Check quiz sessions
SELECT user_id, score, completed FROM quiz_sessions WHERE completed = true;

-- Check XP distribution
SELECT current_level, COUNT(*) FROM user_accounts GROUP BY current_level;
```

## Future Enhancements

Potential improvements to the XP system:
- **Badges and Achievements**: Award special badges for milestones
- **Daily/Weekly Challenges**: Bonus XP opportunities
- **Leaderboard Integration**: Show XP-based rankings
- **Seasonal Events**: Special XP multipliers
- **Quiz Difficulty Multipliers**: More XP for harder quizzes

## Best Practices

1. **Always validate XP calculations** on the server side
2. **Handle edge cases** like negative scores or invalid data
3. **Cache user data** when appropriate to reduce database calls
4. **Log XP changes** for debugging and analytics
5. **Consider rate limiting** to prevent XP farming

This XP system provides a solid foundation for user engagement and can be extended with additional gamification features as needed. 