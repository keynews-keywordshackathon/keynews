// ============================================================================
// Re-export all service-specific actions
// ============================================================================

// Gmail actions
export {
    startGmailAuth,
    fetchEmails,
    analyzeEmailsWithAI,
} from './gmail'

// Google Calendar actions
export {
    startCalendarAuth,
    fetchCalendarEvents,
    createCalendarEvent,
} from './google-calendar'

// YouTube actions
export {
    startYouTubeAuth,
    fetchYouTubeSubscriptions,
    fetchYouTubeChannelActivities,
    fetchYouTubeData,
} from './youtube'

// Future service exports (uncomment as you add them):
// export { ... } from './slack'
// export { ... } from './notion'
