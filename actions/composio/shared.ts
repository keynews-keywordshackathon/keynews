import { Composio } from '@composio/core'
import OpenAI from 'openai'

// ============================================================================
// Shared Composio Client Utilities
// ============================================================================

/**
 * Get an authenticated Composio client instance
 */
export const getComposioClient = () => {
    const apiKey = process.env.COMPOSIO_API_KEY
    if (!apiKey) throw new Error('COMPOSIO_API_KEY not found')
    return new Composio({ apiKey })
}

/**
 * Get an authenticated OpenAI client instance
 */
export const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY not found')
    return new OpenAI({ apiKey })
}
