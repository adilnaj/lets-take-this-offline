'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ArchivePagination({ page, total, pageSize }: {
  page: number; total: number; pageSize: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / pageSize)

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`/archive?${params.toString()}`)
  }

  if (totalPages <= 1) return null
  return (
    <div className="flex items-center gap-4 justify-center mt-6">
      <Button variant="outline" disabled={page <= 1} onClick={() => navigate(page - 1)}>Previous</Button>
      <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
      <Button variant="outline" disabled={page >= totalPages} onClick={() => navigate(page + 1)}>Next</Button>
    </div>
  )
}
