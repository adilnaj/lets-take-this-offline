import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container max-w-2xl mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          Let's Take This Offline
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
