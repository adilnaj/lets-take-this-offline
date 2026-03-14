'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FavoriteButtonProps {
  wordId: string
  initialFavorited: boolean
}

export function FavoriteButton({ wordId, initialFavorited }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    const previous = favorited
    setFavorited(f => !f)
    setIsLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setFavorited(data.favorited)
    } catch {
      setFavorited(previous)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={favorited ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}
    >
      <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
    </Button>
  )
}
