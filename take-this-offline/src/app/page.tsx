import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Phase 2 will replace this with the actual today's word page
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-gray-600">
        {user ? `Signed in as ${user.email}` : "Welcome to Let's Take This Offline"}
      </p>
    </main>
  )
}
