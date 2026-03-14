'use client'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CompletionBannerProps {
  totalPoints: number
  streakCount: number
  allCompleted: boolean
}

export function CompletionBanner({ totalPoints, streakCount, allCompleted }: CompletionBannerProps) {
  if (!allCompleted) return null
  return (
    <Card className="border-green-500 bg-green-50 dark:bg-green-950">
      <CardContent className="pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-700 dark:text-green-400">Today's word: mastered!</p>
            <p className="text-sm text-muted-foreground">{totalPoints} points earned · {streakCount} day streak</p>
          </div>
        </div>
        <Badge variant="secondary">Daily Badge</Badge>
      </CardContent>
    </Card>
  )
}
