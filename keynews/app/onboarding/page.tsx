import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-svh w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Welcome to Onboarding</h1>
        <p className="text-muted-foreground">
          Let&apos;s get you set up with your new account.
        </p>
      </div>
    </div>
  )
}
