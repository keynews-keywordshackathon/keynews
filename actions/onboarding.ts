'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SaveOnboardingDataResult = {
    success: boolean
    error?: string
}

export async function saveOnboardingData(data: {
    fullName: string
    location: string
    interests: string[]
}): Promise<SaveOnboardingDataResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    try {
        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: user.id,
                full_name: data.fullName,
                location: data.location,
                interests: data.interests,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })

        if (error) {
            console.error('Error saving onboarding data:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error saving onboarding data:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
