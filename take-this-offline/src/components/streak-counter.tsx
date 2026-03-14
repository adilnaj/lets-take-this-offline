import { Flame } from 'lucide-react'

interface StreakCounterProps {
  streakCount: number
}

export function StreakCounter({ streakCount }: StreakCounterProps) {
  if (streakCount > 0) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-orange-500">
        <Flame className="h-4 w-4" />
        <span>{streakCount} day streak</span>
      </div>
    )
  }
  return (
    <p className="text-xs text-muted-foreground">Complete today's activities to start your streak!</p>
  )
}
