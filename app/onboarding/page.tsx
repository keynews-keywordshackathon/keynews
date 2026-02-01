import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from '@/components/onboarding-form'
import { HomePreview } from '@/components/home-preview'

export default async function OnboardingPage() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims) {
        redirect('/auth/login')
    }

    return (
        <div className="relative h-svh w-full overflow-hidden">
            <HomePreview />
            <div className="fixed inset-0 bg-white/40 backdrop-blur-[3.5px] z-40" />
            <div className="relative z-50 flex h-svh w-full items-center justify-center overflow-hidden p-6 md:p-10">
                <OnboardingForm />
            </div>
        </div>
    )
}
