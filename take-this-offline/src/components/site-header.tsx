'use client'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import type { User } from '@supabase/supabase-js'
import { Download } from 'lucide-react'

export function SiteHeader({ user }: { user?: User | null }) {
  const { canInstall, install } = usePWAInstall()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container max-w-2xl mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          Let's Take This Offline
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          )}
          {canInstall && (
            <button
              onClick={install}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              aria-label="Install app"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
