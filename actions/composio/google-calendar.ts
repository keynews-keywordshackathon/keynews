'use server'

import { createClient } from '@/lib/supabase/server'
import { getComposioClient, getOpenAIClient } from './shared'

// ============================================================================
// Google Calendar MCP Server Actions
// ============================================================================

// Environment variable for auth config (add to .env):
// COMPOSIO_GOOGLE_CALENDAR_AUTH_CONFIG_ID=your_auth_config_id

/**
 * Start Google Calendar OAuth authentication flow for the current user
 * @param origin Optional base URL (e.g. from window.location.origin) so redirect lands on the right port
 * @returns Object containing the redirect URL for OAuth
 */
export async function startCalendarAuth(origin?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    console.log('[Composio] Starting Calendar auth for user entity:', entityId)

    const client = getComposioClient()
    const authConfigId = process.env.COMPOSIO_GOOGLECALENDAR_AUTH_CONFIG_ID

    if (!authConfigId) {
        throw new Error('COMPOSIO_GOOGLECALENDAR_AUTH_CONFIG_ID not found. Please set it in your .env file.')
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
        console.error('Error starting Calendar auth:', error)
        throw error
    }
}

/**
 * Fetch calendar events from the user's connected Google Calendar
 * @returns Object containing success status and array of events
 */
export async function fetchCalendarEvents() {
    console.log('--- TEST LOG: fetchCalendarEvents server action called ---')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    console.log('[Composio] Fetching calendar events for user entity:', entityId)

    const composio = getComposioClient()

    try {
        // Get calendar tools
        const tools = await composio.tools.get(entityId, {
            tools: ['GOOGLECALENDAR_EVENTS_LIST'],
        })

        if (!tools || tools.length === 0) {
            return { success: false, error: 'No Calendar tools available' }
        }

        // Mock the AI response for calendar fetch
        const mockToolCall = {
            id: 'call_mock_calendar_123',
            type: 'function',
            function: {
                name: 'GOOGLECALENDAR_EVENTS_LIST',
                arguments: JSON.stringify({
                    max_results: 10,
                    time_min: new Date().toISOString()
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

        const fetchResult = await (composio as any).provider.handleToolCalls(entityId, mockResponse)

        console.log('[Composio] Calendar events result:', JSON.stringify(fetchResult, null, 2))

        // Parse the events from the result
        let events: any[] = []

        if (Array.isArray(fetchResult)) {
            for (const item of fetchResult) {
                if (item.content) {
                    try {
                        const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
                        if (content.data?.items) {
                            events = content.data.items
                        } else if (Array.isArray(content)) {
                            events = content
                        }
                    } catch (e) {
                        console.error('[Composio] Error parsing calendar content:', e)
                    }
                }
            }
        }

        // Save to Supabase
        try {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { error: insertError } = await supabase
                    .from('user_calendar_events')
                    .upsert({
                        user_id: user.id,
                        calendar_data: events,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    })

                if (insertError) {
                    console.error('[Supabase] Error saving calendar events:', insertError)
                } else {
                    console.log('[Supabase] Successfully saved calendar events for user:', user.id)
                }
            } else {
                console.warn('[Supabase] No authenticated user found, skipping calendar save')
            }
        } catch (dbError) {
            console.error('[Supabase] Unexpected error saving calendar events:', dbError)
        }

        return { success: true, events }
    } catch (error) {
        console.error('Error fetching calendar events:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch calendar events'
        }
    }
}

/**
 * Create a new calendar event
 * @param eventDetails Object containing event details (summary, start, end, etc.)
 * @returns Object containing success status and created event
 */
export async function createCalendarEvent(eventDetails: {
    summary: string
    description?: string
    start: string // ISO date string
    end: string // ISO date string
    location?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const entityId = user.id
    const composio = getComposioClient()

    try {
        const mockToolCall = {
            id: 'call_mock_create_event_123',
            type: 'function',
            function: {
                name: 'GOOGLECALENDAR_CREATE_EVENT',
                arguments: JSON.stringify(eventDetails)
            }
        }

        const mockResponse = {
            choices: [{
                message: {
                    tool_calls: [mockToolCall]
                }
            }]
        }

        const result = await (composio as any).provider.handleToolCalls(entityId, mockResponse)

        return { success: true, event: result }
    } catch (error) {
        console.error('Error creating calendar event:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create calendar event'
        }
    }
}
