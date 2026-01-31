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

// Twitter actions
export {
    startTwitterAuth,
    getTwitterUser,
    getLikedTweets,
    getHomeTimeline,
} from './twitter'

// Future service exports (uncomment as you add them):
// export { ... } from './slack'
// export { ... } from './notion'
