'use server'

import { createClient } from '@/lib/supabase/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { getComposioClient } from './shared'

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetchResult = await (composio as any).provider.handleToolCalls(entityId, mockResponse)

        console.log('[Composio] Calendar events result:', JSON.stringify(fetchResult, null, 2))

        // Parse the events from the result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// ============================================================================
// Calendar Event Creation from Article
// ============================================================================

interface ArticleForCalendar {
    title: string
    summary: string
    relevance: string
    actionReason: string
    action: { label: string; cta: string; href: string }
}

/**
 * Create a Google Calendar event based on an article's action.
 * Uses Gemini to determine event details, then Composio GOOGLECALENDAR_CREATE_EVENT.
 * @param article The article data to generate a calendar event from
 * @returns Object containing success status and event info
 */
export async function createArticleCalendarEvent(article: ArticleForCalendar) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    const entityId = user.id
    const composio = getComposioClient()
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY })

    try {
        const now = new Date().toISOString()

        // Step 1: Generate event details with Gemini
        const prompt = `Based on the following news article and its suggested action, generate a Google Calendar event that helps the reader act on this story.

Article Title: ${article.title}
Summary: ${article.summary}
Why it matters: ${article.relevance}
Suggested action: ${article.action.label}
Why act now: ${article.actionReason}
Relevant link: ${article.action.href}

Current date/time (UTC): ${now}

Write a JSON response with:
- "summary": a concise event title (e.g. "RSVP for UIUC Career Fair", "Submit transit feedback")
- "description": 2-3 sentence description including the relevant link and why this matters
- "start_datetime": an RFC 3339 UTC datetime string for when the user should do this (pick a reasonable upcoming time, e.g. tomorrow morning or later this week)
- "end_datetime": an RFC 3339 UTC datetime string for the end (30-60 min after start)
- "event_duration_minutes": duration in minutes

The event should be a realistic reminder/block for the user to take the suggested action.
Respond with valid JSON only, no markdown fences.`

        const { text: generated } = await generateText({
            model: google('gemini-3-flash-preview'),
            system: 'You create calendar events from news articles to help users take action. Always respond with valid JSON only.',
            prompt,
        })

        if (!generated) {
            return { success: false, error: 'Failed to generate event details' }
        }

        const eventDetails = JSON.parse(generated)

        // Step 2: Create calendar event via Composio
        const tools = await composio.tools.get(entityId, {
            tools: ['GOOGLECALENDAR_CREATE_EVENT'],
        })

        if (!tools || tools.length === 0) {
            return { success: false, error: 'Calendar tool not available. Please connect your Google Calendar.' }
        }

        const mockToolCall = {
            id: `call_event_${Date.now()}`,
            type: 'function',
            function: {
                name: 'GOOGLECALENDAR_CREATE_EVENT',
                arguments: JSON.stringify({
                    summary: eventDetails.summary,
                    description: eventDetails.description,
                    start_datetime: eventDetails.start_datetime,
                    event_duration_minutes: eventDetails.event_duration_minutes || 30,
                    calendar_id: 'primary',
                    send_updates: false,
                    visibility: 'default',
                    eventType: 'default',
                }),
            },
        }

        const mockResponse = {
            choices: [{
                message: {
                    tool_calls: [mockToolCall],
                },
            }],
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (composio as any).provider.handleToolCalls(entityId, mockResponse)

        console.log('[Composio] Calendar event creation result:', JSON.stringify(result, null, 2))

        return {
            success: true,
            summary: eventDetails.summary,
            start: eventDetails.start_datetime,
        }
    } catch (error) {
        console.error('Error creating calendar event from article:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create calendar event',
        }
    }
}
