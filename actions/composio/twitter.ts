'use server'

import { createClient } from '@/lib/supabase/server'
import { getComposioClient } from './shared'

// ============================================================================
// Twitter MCP Server Actions
// ============================================================================

/**
 * Start Twitter OAuth authentication flow for the current user
 * @param origin Optional base URL (e.g. from window.location.origin) so redirect lands on the right port
 * @returns Object containing the redirect URL for OAuth
 */
export async function startTwitterAuth(origin?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    console.log('[Composio] Starting Twitter auth for user entity:', entityId)

    const client = getComposioClient()
    const authConfigId = process.env.COMPOSIO_TWITTER_AUTH_CONFIG_ID

    if (!authConfigId) {
        throw new Error('COMPOSIO_TWITTER_AUTH_CONFIG_ID not found. Please set it in your .env file.')
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
        console.error('Error starting Twitter auth:', error)
        throw error
    }
}

/**
 * executeAction helper to run a specific Composio action via handleToolCalls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeAction(actionName: string, args: any, entityId: string) {
    const composio = getComposioClient()

    const mockToolCall = {
        id: 'call_mock_' + Math.random().toString(36).substring(7),
        type: 'function',
        function: {
            name: actionName,
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

    // Using existing pattern from gmail.ts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (composio as any).provider.handleToolCalls(entityId, mockResponse)

    // The result from handleToolCalls is typically an array of outputs
    // We want to return the output of our specific tool call
    if (Array.isArray(result) && result.length > 0) {
        const item = result[0]
        if (item.error) {
            throw new Error(item.error)
        }
        // data usually comes as a JSON string in 'content' or directly as object depending on the integration
        if (item.content) {
            try {
                return typeof item.content === 'string' ? JSON.parse(item.content) : item.content
            } catch {
                return item.content
            }
        }
    }

    return result
}

/**
 * Get the authenticated Twitter user details
 * Uses TWITTER_USER_LOOKUP_ME
 */
export async function getTwitterUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id

    try {
        const result = await executeAction(
            'TWITTER_USER_LOOKUP_ME',
            {},
            entityId
        )
        return { success: true, data: result }
    } catch (error) {
        console.error('Error getting Twitter user:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get Twitter user'
        }
    }
}

/**
 * Get tweets liked by the user
 * Uses TWITTER_RETURNS_POST_OBJECTS_LIKED_BY_THE_PROVIDED_USER_ID
 * @param twitterUserId The Twitter user ID (not the Supabase user ID usually, but the ID returned from getTwitterUser)
 */
export async function getLikedTweets(twitterUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    console.log('[Twitter] getLikedTweets called for user:', entityId, 'twitterUserId:', twitterUserId)

    try {
        console.log('[Twitter] Executing TWITTER_RETURNS_POST_OBJECTS_LIKED_BY_THE_PROVIDED_USER_ID...')
        const result = await executeAction(
            'TWITTER_RETURNS_POST_OBJECTS_LIKED_BY_THE_PROVIDED_USER_ID',
            { id: twitterUserId, max_results: 30 },
            entityId
        )
        console.log('[Twitter] Result execution success, result length:', Array.isArray(result) ? result.length : 'unknown')

        // Save to Supabase
        if (user && result) {
            console.log('[Twitter] Attempting to save liked tweets to Supabase...')
            const { error: insertError } = await supabase
                .from('user_tweets')
                .upsert({
                    user_id: user.id,
                    liked_tweets: result,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (insertError) {
                console.error('[Supabase] Error saving liked tweets:', insertError)
            } else {
                console.log('[Supabase] Successfully saved liked tweets for user:', user.id)
            }
        } else {
            console.log('[Twitter] Skipping save: user or result missing. User:', !!user, 'Result:', !!result)
        }

        return { success: true, data: result }
    } catch (error) {
        console.error('[Twitter] Error getting liked tweets:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get liked tweets'
        }
    }
}

/**
 * Get the user's home timeline
 * Uses TWITTER_USER_HOME_TIMELINE_BY_USER_ID
 * @param twitterUserId The Twitter user ID
 */
export async function getHomeTimeline(twitterUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    console.log('[Twitter] getHomeTimeline called for user:', entityId, 'twitterUserId:', twitterUserId)

    try {
        console.log('[Twitter] Executing TWITTER_USER_HOME_TIMELINE_BY_USER_ID...')
        const result = await executeAction(
            'TWITTER_USER_HOME_TIMELINE_BY_USER_ID',
            { id: twitterUserId, max_results: 30 },
            entityId
        )
        console.log('[Twitter] Timeline execution success, result length:', Array.isArray(result) ? result.length : 'unknown')

        // Save to Supabase
        if (user && result) {
            console.log('[Twitter] Attempting to save home timeline to Supabase...')
            const { error: insertError } = await supabase
                .from('user_tweets')
                .upsert({
                    user_id: user.id,
                    home_timeline: result,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (insertError) {
                console.error('[Supabase] Error saving home timeline:', insertError)
            } else {
                console.log('[Supabase] Successfully saved home timeline for user:', user.id)
            }
        } else {
            console.log('[Twitter] Skipping save: user or result missing. User:', !!user, 'Result:', !!result)
        }

        return { success: true, data: result }
    } catch (error) {
        console.error('[Twitter] Error getting home timeline:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get home timeline'
        }
    }
}
