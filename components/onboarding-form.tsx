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
import { 
    Calendar, Twitter, Mail, Youtube, Newspaper,
    Monitor, Bot, Trophy, Landmark, Film, Briefcase, 
    FlaskConical, Heart, Plane, Pill, UtensilsCrossed, 
    Leaf, Palette, GraduationCap, Gamepad2
} from 'lucide-react'

const INTEGRATIONS = [
    { 
        id: 'Google Calendar', 
        name: 'Google Calendar', 
        description: 'Events, schedules, and appointments',
        icon: Calendar 
    },
    { 
        id: 'X', 
        name: 'X (Twitter)', 
        description: 'Tweets, likes, and timeline',
        icon: Twitter 
    },
    { 
        id: 'Gmail', 
        name: 'Gmail', 
        description: 'Emails and newsletters',
        icon: Mail 
    },
    { 
        id: 'YouTube', 
        name: 'YouTube', 
        description: 'Subscriptions and watch history',
        icon: Youtube 
    },
]

const INTERESTS = [
    { id: 'tech', label: 'Technology', icon: Monitor },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'politics', label: 'Politics', icon: Landmark },
    { id: 'entertainment', label: 'Entertainment', icon: Film },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'science', label: 'Science', icon: FlaskConical },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'medicine', label: 'Medicine', icon: Pill },
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'climate', label: 'Climate', icon: Leaf },
    { id: 'art', label: 'Art', icon: Palette },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
]

export function OnboardingForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const searchParams = useSearchParams()
    const connectedAccountId = searchParams.get('connected_account_id')
    const [step, setStep] = useState(() => (connectedAccountId ? 3 : 1))
    const totalSteps = 3
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [fullName, setFullName] = useState('')
    const [location, setLocation] = useState('')
    const displayStep = connectedAccountId ? 3 : step

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



    const handleNext = () => {
        if (!connectedAccountId && step === 2) {
            // Save interests data in background while moving to account connections
            saveOnboardingData({
                fullName,
                location,
                interests: selectedInterests
            }).catch((error) => console.error('Error saving onboarding data:', error))
            setStep(step + 1)
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
            <Card className="mx-auto flex flex-col" style={{ width: 700, height: 600 }}>
                <CardHeader className="gap-4">
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            {displayStep === 1 && "Welcome to The Keywords Times"}
                            {displayStep === 2 && "What Interests You?"}
                            {displayStep === 3 && "Connect your world"}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Step {displayStep} of {totalSteps}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    <form onSubmit={handleSubmit} id="onboarding-form">
                        {displayStep === 1 && (
                            <div className="flex flex-col items-center justify-center gap-5 py-4">
                                <div className="size-16 rounded-full bg-[#f5f5f4] flex items-center justify-center">
                                    <Newspaper className="size-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-bold text-center">News That Knows You</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    We analyze your interests, connect to your digital life, 
                                    and create a personalized newspaper written for you. 
                                </p>
                                <div className="grid grid-cols-2 gap-4 w-full mt-10">
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
                            </div>
                        )}

                        {displayStep === 2 && (
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Choose the topics you&apos;d like to see in your personalized feed
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {INTERESTS.map((interest) => (
                                        <Button
                                            key={interest.id}
                                            type="button"
                                            variant="outline"
                                            onClick={() => toggleInterest(interest.id)}
                                            className={cn(
                                                "group w-full h-auto py-4 px-4 flex flex-row items-center justify-start gap-3 border-[1.5px] hover:border-black",
                                                selectedInterests.includes(interest.id) && "bg-[#edecea] border-black hover:bg-[#edecea]"
                                            )}
                                        >
                                            <div className={cn(
                                                "size-8 shrink-0 rounded-full bg-[#f5f5f4] flex items-center justify-center transition-colors",
                                                selectedInterests.includes(interest.id) ? "bg-[#e8e8e6] group-hover:bg-[#e8e8e6]" : "group-hover:bg-[#e8e8e6]"
                                            )}>
                                                <interest.icon className="size-4" strokeWidth={1.5} />
                                            </div>
                                            <span className="text-sm">{interest.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayStep === 3 && (
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Link your accounts to enhance personalization and get more relevant content
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {INTEGRATIONS.map((integration) => (
                                        <Button
                                            key={integration.id}
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleIntegrationClick(integration.id)}
                                            className="group w-full h-auto py-4 px-4 flex flex-row items-center justify-start gap-4 border-[1.5px] hover:border-black"
                                        >
                                            <div className="size-10 shrink-0 rounded-full bg-[#f5f5f4] group-hover:bg-[#e8e8e6] flex items-center justify-center transition-colors">
                                                <integration.icon className="size-5" strokeWidth={1.5} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">{integration.name}</p>
                                                <p className="text-sm text-muted-foreground font-normal">{integration.description}</p>
                                            </div>
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
                        <Button onClick={handleNext}>
                            Next
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
