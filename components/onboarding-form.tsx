'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { startGmailAuth, startCalendarAuth, startYouTubeAuth, startTwitterAuth, fetchEmails, fetchCalendarEvents, fetchYouTubeData, getTwitterUser, getLikedTweets, getHomeTimeline } from '@/actions/composio'
import { saveOnboardingData } from '@/actions/onboarding'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
const INTERESTS = [
    { id: 'tech', label: 'Technology', emoji: '💻' },
    { id: 'ai', label: 'AI', emoji: '🤖' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'politics', label: 'Politics', emoji: '🗳️' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
    { id: 'business', label: 'Business', emoji: '💼' },
    { id: 'science', label: 'Science', emoji: '🔬' },
    { id: 'health', label: 'Health', emoji: '🏥' },
    { id: 'travel', label: 'Travel', emoji: '✈️' },
    { id: 'medicine', label: 'Medicine', emoji: '💊' },
    { id: 'food', label: 'Food', emoji: '🍔' },
    { id: 'climate', label: 'Climate', emoji: '🌍' },
    { id: 'art', label: 'Art', emoji: '🎨' },
    { id: 'education', label: 'Education', emoji: '📚' },
    { id: 'gaming', label: 'Gaming', emoji: '🎮' },
]

export function OnboardingForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const searchParams = useSearchParams()
    const connectedAccountId = searchParams.get('connected_account_id')
    const [step, setStep] = useState(() => (connectedAccountId ? 2 : 1))
    const totalSteps = 2
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [fullName, setFullName] = useState('')
    const [location, setLocation] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const displayStep = connectedAccountId ? 2 : step

    useEffect(() => {
        console.log('--- TEST LOG: OnboardingForm mounted/updated.')
        console.log('All Search Params:', searchParams.toString())
        console.log('ConnectedAccountID:', connectedAccountId)
        if (connectedAccountId) {
            const fetchAndLog = async () => {
                // Fetch all; the ones they didn't connect will no-op or return empty
                console.log('Detected connected account, fetching emails, calendar, and YouTube...')
                try {
                    const [emailResult, calendarResult, youtubeResult] = await Promise.all([
                        fetchEmails(),
                        fetchCalendarEvents(),
                        fetchYouTubeData(),
                    ])
                    console.log('Email fetch result:', emailResult)
                    console.log('Calendar fetch result:', calendarResult)
                    console.log('YouTube fetch result:', youtubeResult)
                } catch (error) {
                    console.error('Failed to fetch after OAuth:', error)
                }

                // 2. Fetch Twitter Data
                try {
                    console.log('Attempting to fetch Twitter user...')
                    const userResult = await getTwitterUser()
                    console.log('Twitter User Result:', userResult)

                    if (userResult.success && userResult.data) {
                        // The structure can be deeply nested: data.data.data.id
                        const twitterUserId =
                            userResult.data.id ||
                            userResult.data.data?.id ||
                            userResult.data.data?.data?.id
                        if (twitterUserId) {
                            console.log('Got Twitter ID:', twitterUserId, 'Fetching tweets...')

                            // Fetch Liked Tweets
                            const likedResult = await getLikedTweets(twitterUserId)
                            console.log('Liked Tweets Result:', likedResult)

                            // Fetch Home Timeline
                            const timelineResult = await getHomeTimeline(twitterUserId)
                            console.log('Timeline Result:', timelineResult)
                        } else {
                            console.warn('Could not extract Twitter User ID from result:', userResult.data)
                        }
                    } else {
                        console.log('Twitter user fetch skipped or failed (might be a Gmail connection only)')
                    }
                } catch (error) {
                    console.error('Failed to fetch Twitter data:', error)
                }
            }
            fetchAndLog()
        }
    }, [connectedAccountId, searchParams])

    // Format: (currentStep / totalSteps) * 100
    const progress = (displayStep / totalSteps) * 100

    const toggleInterest = (interestId: string) => {
        setSelectedInterests((prev) =>
            prev.includes(interestId)
                ? prev.filter((i) => i !== interestId)
                : [...prev, interestId]
        )
    }



    const handleNext = async () => {
        if (!connectedAccountId && step === 1) {
            setIsSaving(true)
            try {
                const result = await saveOnboardingData({
                    fullName,
                    location,
                    interests: selectedInterests
                })

                if (result.success) {
                    setStep(step + 1)
                } else {
                    console.error('Failed to save onboarding data:', result.error)
                    // Optionally handle error UI here
                }
            } catch (error) {
                console.error('Error in handleNext:', error)
            } finally {
                setIsSaving(false)
            }
        } else if (!connectedAccountId && step < totalSteps) {
            setStep(step + 1)
        }
    }
    const handleIntegrationClick = async (platform: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : undefined
        if (platform === 'Gmail') {
            try {
                const result = await startGmailAuth(origin)
                if (result.url) {
                    window.location.assign(result.url)
                }
            } catch (error) {
                console.error('Failed to start Gmail auth:', error)
            }
        } else if (platform === 'Google Calendar') {
            try {
                const result = await startCalendarAuth(origin)
                if (result.url) {
                    window.location.assign(result.url)
                }
            } catch (error) {
                console.error('Failed to start Calendar auth:', error)
            }
        } else if (platform === 'YouTube') {
            try {
                const result = await startYouTubeAuth(origin)
                if (result.url) {
                    window.location.href = result.url
                }
            } catch (error) {
                console.error('Failed to start YouTube auth:', error)
            }
        } else if (platform === 'X') {
            try {
                const result = await startTwitterAuth(origin)
                if (result.url) {
                    window.location.assign(result.url)
                }
            } catch (error) {
                console.error('Failed to start Twitter auth:', error)
            }
        } else {
            console.log('Clicked', platform)
        }
    }

    const handleBack = () => {
        if (!connectedAccountId && step > 1) {
            setStep(step - 1)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement actual submission logic
        console.log('Form submitted', { selectedInterests })
    }

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="mx-auto flex flex-col" style={{ width: 700, height: 700 }}>
                <CardHeader className="gap-4">
                    <div className="flex items-center justify-between">
                        <CardTitle>Onboarding</CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Step {displayStep} of {totalSteps}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <CardDescription>
                        {step === 1
                            ? "Let's start with your basic information."
                            : 'Connect your accounts.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    <form onSubmit={handleSubmit} id="onboarding-form">
                        {displayStep === 1 && (
                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            placeholder="John Doe"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            placeholder="New York, NY"
                                            required
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <Label>Your Interests</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {INTERESTS.map((interest) => (
                                            <Button
                                                key={interest.id}
                                                type="button"
                                                variant={selectedInterests.includes(interest.id) ? 'default' : 'outline'}
                                                onClick={() => toggleInterest(interest.id)}
                                                className="w-full h-auto py-6 px-4 flex flex-row items-center justify-center gap-4"
                                            >
                                                <span className="text-xl">{interest.emoji}</span>
                                                <span className="text-sm">{interest.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {displayStep === 2 && (
                            <div className="grid gap-4">
                                <Label>Connect your accounts</Label>
                                <div className="grid grid-cols-1 gap-4">
                                    {['Google Calendar', 'X', 'Gmail', 'YouTube'].map((platform) => (
                                        <Button
                                            key={platform}
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleIntegrationClick(platform)}
                                            className="w-full h-24 flex flex-row items-center justify-center gap-2 text-xl font-medium"
                                        >
                                            {platform}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={displayStep === 1}
                    >
                        Back
                    </Button>
                    {displayStep < totalSteps ? (
                        <Button onClick={handleNext} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Next'}
                        </Button>
                    ) : (
                        <Button type="submit" form="onboarding-form">
                            Complete
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
