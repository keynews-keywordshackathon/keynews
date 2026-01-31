/**
 * Re-export file for backwards compatibility
 * 
 * All Composio MCP server integrations are now organized in the composio/ directory:
 * - composio/index.ts - Shared utilities and re-exports
 * - composio/gmail.ts - Gmail-specific actions
 * 
 * To add a new MCP server integration:
 * 1. Create a new file: composio/[service-name].ts
 * 2. Import shared utilities: import { getComposioClient, getOpenAIClient } from './shared'
 * 3. Export your actions from composio/index.ts
 */
export * from './composio/index'
