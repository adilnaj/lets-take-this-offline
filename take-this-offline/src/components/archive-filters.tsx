'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { WordCategory } from '@/lib/words'

export function ArchiveFilters({ categories, currentKeyword, currentCategory, currentDateFrom, currentDateTo }: {
  categories: WordCategory[]
  currentKeyword: string
  currentCategory: string
  currentDateFrom: string
  currentDateTo: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    params.set('page', '1')
    router.push(`/archive?${params.toString()}`)
  }

  return (
    <div className="space-y-4 mb-6">
      <Input
        placeholder="Search words..."
        defaultValue={currentKeyword}
        onChange={e => {
          clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => updateParam('q', e.target.value), 300)
        }}
      />
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Badge
            key={cat}
            variant={currentCategory === cat ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => updateParam('category', currentCategory === cat ? '' : cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>
      <div className="flex gap-4 items-center">
        <Input type="date" defaultValue={currentDateFrom} onChange={e => updateParam('from', e.target.value)} className="w-auto" />
        <span className="text-muted-foreground text-sm">to</span>
        <Input type="date" defaultValue={currentDateTo} onChange={e => updateParam('to', e.target.value)} className="w-auto" />
      </div>
    </div>
  )
}
