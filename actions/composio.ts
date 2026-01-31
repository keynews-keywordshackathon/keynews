'use server'

import { Composio } from '@composio/core'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

// Initialize clients
const getComposioClient = () => {
    const apiKey = process.env.COMPOSIO_API_KEY
    if (!apiKey) throw new Error('COMPOSIO_API_KEY not found')
    return new Composio({ apiKey })
}

const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY not found')
    return new OpenAI({ apiKey })
}

export async function startGmailAuth(entityId: string = 'default') {
    const client = getComposioClient()
    const authConfigId = process.env.COMPOSIO_GMAIL_AUTH_CONFIG_ID

    if (!authConfigId) {
        throw new Error('COMPOSIO_GMAIL_AUTH_CONFIG_ID not found. Please set it in your .env file.')
    }

    try {
        const connectionRequest = await client.connectedAccounts.link(
            entityId,
            authConfigId,
            {
                callbackUrl: 'http://localhost:3000/onboarding'
            }
        )

        if (connectionRequest.redirectUrl) {
            return { url: connectionRequest.redirectUrl }
        } else {
            throw new Error('No redirect URL returned from Composio')
        }
    } catch (error) {
        console.error('Error starting Gmail auth:', error)
        throw error
    }
}

export async function fetchEmails(entityId: string = 'default') {
    console.log('--- TEST LOG: fetchEmails server action called ---')
    const composio = getComposioClient()
    // Skipper OpenAI client for now

    try {
        // Direct execution without AI
        const tools = await composio.tools.get(entityId, {
            tools: ['GMAIL_FETCH_EMAILS'],
        })

        if (!tools || tools.length === 0) {
            return { success: false, error: 'No Gmail tools available' }
        }

        // Manually construct the execution request since we are skipping the AI step
        // We will execute the 'GMAIL_FETCH_EMAILS' action directly via composio.execute
        // Note: composio-core might not have a direct 'execute' on the top level or might require a different structure.
        // Actually, without the AI loop, we can just call the action if we know the action ID.
        // However, the standard way is via handleToolCalls which expects an OpenAI response structure.

        // Let's force a direct execution using the Composio SDK's execute action capability if available,
        // or mock the AI response structure to feed into handleToolCalls.

        // Mocking AI response for GMAIL_FETCH_EMAILS with max_results=10
        const mockToolCall = {
            id: 'call_mock_123',
            type: 'function',
            function: {
                name: 'GMAIL_FETCH_EMAILS',
                arguments: JSON.stringify({ max_results: 10 })
            }
        }

        // We can pass this mock call to the provider/handler
        // Re-creating the structure expected by handleToolCalls (OpenAI format)
        const mockResponse = {
            choices: [{
                message: {
                    tool_calls: [mockToolCall]
                }
            }]
        }

        console.log('Composio keys:', Object.keys(composio))

        // Using reference pattern: composio.provider.handleToolCalls
        // The previous error said composio.handleToolCall is not a function.
        // The reference file uses `.provider.handleToolCalls`.
        const fetchResult = await (composio as any).provider.handleToolCalls(entityId, mockResponse)

        console.log('[Composio] Email fetch result:', JSON.stringify(fetchResult, null, 2))

        // Save to Supabase
        try {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { error: insertError } = await supabase
                    .from('user_emails')
                    .upsert({
                        user_id: user.id,
                        email_data: fetchResult,
                        created_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    })

                if (insertError) {
                    console.error('[Supabase] Error saving emails:', insertError)
                } else {
                    console.log('[Supabase] Successfully saved emails for user:', user.id)
                }
            } else {
                console.warn('[Supabase] No authenticated user found, performing anonymous fetch')
            }
        } catch (dbError) {
            console.error('[Supabase] Unexpected error saving emails:', dbError)
            // Don't fail the fetch just because save failed
        }

        // Parse the emails from the result
        let emails: any[] = []

        if (Array.isArray(fetchResult)) {
            for (const item of fetchResult) {
                if (item.content) {
                    try {
                        const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
                        if (content.data?.messages) {
                            emails = content.data.messages
                        } else if (Array.isArray(content)) {
                            emails = content
                        }
                    } catch (e) {
                        console.error('[Composio] Error parsing email content:', e)
                    }
                }
            }
        }

        return { success: true, emails: emails.slice(0, 50) }
    } catch (error) {
        console.error('Error fetching emails:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch emails'
        }
    }
}

export async function analyzeEmailsWithAI(emails: any[]) {
    const openai = getOpenAIClient()

    try {
        const emailSummary = emails.map((email, idx) => {
            const subject = email.subject || email.preview?.subject || 'No subject'
            const sender = email.sender || email.from || 'Unknown'
            const preview = email.preview?.body || email.messageText?.substring(0, 200) || 'No content'

            return `Email ${idx + 1}:
Subject: ${subject}
From: ${sender}
Preview: ${preview}
---`
        }).join('\n\n')

        const analysisPrompt = `Analyze these ${emails.length} emails and provide insights about the user:

${emailSummary}

Based on these emails, provide a comprehensive analysis of:

1. Email Communication Overview
2. Job Inference
3. Work Environment
4. Personality Traits

Respond in JSON format matching this structure:
{
  "emailOverview": {
    "communicationStyle": "formal|informal|mixed",
    "averageEmailsPerDay": number,
    "commonTopics": ["topic1", "topic2"],
    "responsePattern": "description"
  },
  "jobInference": {
    "role": "role name",
    "industry": "industry name",
    "seniorityLevel": "entry|mid|senior|executive|unknown",
    "confidence": number
  },
  "workEnvironment": {
    "companyType": "corporate|startup|freelance|academic|unknown",
    "teamSize": "small|medium|large|unknown",
    "workMode": "remote|hybrid|office|unknown"
  },
  "personality": {
    "communicationStyle": "description",
    "responsiveness": "high|medium|low",
    "traits": ["trait1", "trait2", "trait3"]
  }
}`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert at analyzing email communication patterns and inferring professional and personality insights. Always respond with valid JSON only.',
                },
                {
                    role: 'user',
                    content: analysisPrompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        })

        const analysisText = response.choices[0]?.message?.content
        if (!analysisText) throw new Error('No analysis returned')

        return { success: true, analysis: JSON.parse(analysisText) }

    } catch (error) {
        console.error('Error analyzing emails:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to analyze emails'
        }
    }
}
