'use server'

import { createClient } from '@/lib/supabase/server'
import { getComposioClient } from './shared'

// ============================================================================
// YouTube MCP Server Actions
// ============================================================================

// Environment variable for auth config (add to .env):
// COMPOSIO_YOUTUBE_AUTH_CONFIG_ID=your_auth_config_id

/**
 * Start YouTube OAuth authentication flow for the current user
 * @param origin Optional base URL (e.g. from window.location.origin) so redirect lands on the right port
 * @returns Object containing the redirect URL for OAuth
 */
export async function startYouTubeAuth(origin?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    console.log('[Composio] Starting YouTube auth for user entity:', entityId)

    const client = getComposioClient()
    const authConfigId = process.env.COMPOSIO_YOUTUBE_AUTH_CONFIG_ID

    if (!authConfigId) {
        throw new Error('COMPOSIO_YOUTUBE_AUTH_CONFIG_ID not found. Please set it in your .env file.')
    }

    const baseUrl = origin || 'http://localhost:3000'
    const callbackUrl = `${baseUrl.replace(/\/$/, '')}/onboarding`

    try {
        const connectionRequest = await client.connectedAccounts.link(
            entityId,
            authConfigId,
            { callbackUrl }
        )

        if (connectionRequest.redirectUrl) {
            return { url: connectionRequest.redirectUrl }
        } else {
            throw new Error('No redirect URL returned from Composio')
        }
    } catch (error) {
        console.error('Error starting YouTube auth:', error)
        throw error
    }
}

/**
 * Fetch user's YouTube subscriptions (with pagination to get all)
 * @param maxPages Maximum number of pages to fetch (default 10 = up to 500 subscriptions)
 * @returns Object containing success status and array of subscriptions
 */
export async function fetchYouTubeSubscriptions(maxPages: number = 10) {
    console.log('--- TEST LOG: fetchYouTubeSubscriptions server action called ---')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    console.log('[Composio] Fetching YouTube subscriptions for user entity:', entityId)

    const composio = getComposioClient()

    try {
        // Get YouTube tools
        const tools = await composio.tools.get(entityId, {
            tools: ['YOUTUBE_LIST_USER_SUBSCRIPTIONS'],
        })

        if (!tools || tools.length === 0) {
            return { success: false, error: 'No YouTube tools available' }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allSubscriptions: any[] = []
        let nextPageToken: string | undefined = undefined
        let pageCount = 0

        // Paginate through all results
        while (pageCount < maxPages) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args: Record<string, any> = { max_results: 50 }
            if (nextPageToken) {
                args.page_token = nextPageToken
            }

            const mockToolCall = {
                id: `call_mock_youtube_subs_${pageCount}`,
                type: 'function',
                function: {
                    name: 'YOUTUBE_LIST_USER_SUBSCRIPTIONS',
                    arguments: JSON.stringify(args)
                }
            }

            const mockResponse = {
                choices: [{
                    message: {
                        tool_calls: [mockToolCall]
                    }
                }]
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fetchResult = await (composio as any).provider.handleToolCalls(entityId, mockResponse)

            console.log(`[Composio] YouTube subscriptions page ${pageCount + 1} result:`, JSON.stringify(fetchResult, null, 2))

            // Parse this page's subscriptions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let pageItems: any[] = []
            let pageNextToken: string | undefined = undefined

            if (Array.isArray(fetchResult)) {
                for (const item of fetchResult) {
                    if (item.content) {
                        try {
                            const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
                            if (content.data?.items) {
                                pageItems = content.data.items
                            } else if (Array.isArray(content)) {
                                pageItems = content
                            }
                            // Get next page token
                            if (content.data?.nextPageToken) {
                                pageNextToken = content.data.nextPageToken
                            }
                        } catch (e) {
                            console.error('[Composio] Error parsing YouTube subscriptions:', e)
                        }
                    }
                }
            }

            allSubscriptions.push(...pageItems)
            pageCount++

            // Check if there's more pages
            if (!pageNextToken || pageItems.length === 0) {
                console.log(`[Composio] No more pages. Total subscriptions fetched: ${allSubscriptions.length}`)
                break
            }

            nextPageToken = pageNextToken
            console.log(`[Composio] Fetched ${allSubscriptions.length} subscriptions so far, getting next page...`)
        }

        // Extract channel names from subscriptions
        const channelNames = allSubscriptions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((sub: any) => sub.snippet?.title)
            .filter((name: string | undefined): name is string => !!name)

        console.log(`[Composio] Extracted ${channelNames.length} channel names from subscriptions`)

        return { success: true, subscriptions: allSubscriptions, channelNames }
    } catch (error) {
        console.error('Error fetching YouTube subscriptions:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch YouTube subscriptions'
        }
    }
}

/**
 * Fetch user's YouTube channel activities
 * @returns Object containing success status and array of activities
 */
export async function fetchYouTubeChannelActivities() {
    console.log('--- TEST LOG: fetchYouTubeChannelActivities server action called ---')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    console.log('[Composio] Fetching YouTube channel activities for user entity:', entityId)

    const composio = getComposioClient()

    try {
        // Get YouTube tools
        const tools = await composio.tools.get(entityId, {
            tools: ['YOUTUBE_GET_CHANNEL_ACTIVITIES'],
        })

        if (!tools || tools.length === 0) {
            return { success: false, error: 'No YouTube tools available' }
        }

        const mockToolCall = {
            id: 'call_mock_youtube_activities_123',
            type: 'function',
            function: {
                name: 'YOUTUBE_GET_CHANNEL_ACTIVITIES',
                arguments: JSON.stringify({
                    max_results: 50
                })
            }
        }

        const mockResponse = {
            choices: [{
                message: {
                    tool_calls: [mockToolCall]
                }
            }]
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetchResult = await (composio as any).provider.handleToolCalls(entityId, mockResponse)

        console.log('[Composio] YouTube channel activities result:', JSON.stringify(fetchResult, null, 2))

        // Parse the activities from the result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let activities: any[] = []

        if (Array.isArray(fetchResult)) {
            for (const item of fetchResult) {
                if (item.content) {
                    try {
                        const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
                        if (content.data?.items) {
                            activities = content.data.items
                        } else if (Array.isArray(content)) {
                            activities = content
                        }
                    } catch (e) {
                        console.error('[Composio] Error parsing YouTube activities:', e)
                    }
                }
            }
        }

        return { success: true, activities }
    } catch (error) {
        console.error('Error fetching YouTube channel activities:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch YouTube channel activities'
        }
    }
}

/**
 * Fetch all YouTube data (subscriptions + activities) and save to Supabase
 * @returns Object containing success status and fetched data
 */
export async function fetchYouTubeData() {
    console.log('--- TEST LOG: fetchYouTubeData server action called ---')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Fetch both in parallel
    const [subscriptionsResult, activitiesResult] = await Promise.all([
        fetchYouTubeSubscriptions(),
        fetchYouTubeChannelActivities(),
    ])

    const subscriptions = subscriptionsResult.success ? subscriptionsResult.subscriptions : []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelNames = subscriptionsResult.success ? (subscriptionsResult as any).channelNames || [] : []
    const activities = activitiesResult.success ? activitiesResult.activities : []

    // Save to Supabase
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error: insertError } = await supabase
                .from('user_youtube_data')
                .upsert({
                    user_id: user.id,
                    subscriptions: subscriptions,
                    channel_activities: activities,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (insertError) {
                console.error('[Supabase] Error saving YouTube data:', insertError)
            } else {
                console.log('[Supabase] Successfully saved YouTube data for user:', user.id)
            }
        } else {
            console.warn('[Supabase] No authenticated user found, skipping YouTube save')
        }
    } catch (dbError) {
        console.error('[Supabase] Unexpected error saving YouTube data:', dbError)
    }

    return {
        success: true,
        subscriptions,
        channelNames,
        activities,
        errors: {
            subscriptions: subscriptionsResult.success ? null : subscriptionsResult.error,
            activities: activitiesResult.success ? null : activitiesResult.error,
        }
    }

    // TODO: only gets 50 channels, try to gete more
}
