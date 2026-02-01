'use server'

import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
import { generateText } from 'ai';
import { createStreamableValue } from '@ai-sdk/rsc';
import Exa from 'exa-js';
import { fetchEmails } from './composio/gmail';
import { fetchCalendarEvents } from './composio/google-calendar';
import { getTwitterUser, getLikedTweets } from './composio/twitter';
import { createClient } from '@/lib/supabase/server';

export async function generateInterestsAction() {
  const stream = createStreamableValue();

  (async () => {
    const logs: string[] = [];
    const log = (message: string) => {
        logs.push(message);
        stream.update({ type: 'log', message });
    };

    try {
        // 1. Authenticate
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        log(`Authenticated user: ${user.id}`);

        // 2. Fetch Data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let emailData: any[] = [];
        try {
            log('Fetching emails...');
            const emails = await fetchEmails();
            if (emails.success) {
                emailData = emails.emails || [];
                log(`Fetched ${emailData.length} emails.`);
            } else {
                log(`Failed to fetch emails: ${emails.error}`);
            }
        } catch (e) {
            log(`Error fetching emails: ${e}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let calendarData: any[] = [];
        try {
            log('Fetching calendar events...');
            const events = await fetchCalendarEvents();
            if (events.success) {
                calendarData = events.events || [];
                log(`Fetched ${calendarData.length} calendar events.`);
            } else {
                log(`Failed to fetch calendar events: ${events.error}`);
            }
        } catch (e) {
            log(`Error fetching calendar events: ${e}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let twitterData: any[] = [];
        try {
            log('Fetching Twitter user...');
            const twitterUser = await getTwitterUser();
            if (twitterUser.success && twitterUser.data) {
                const twitterId = twitterUser.data.id || (Array.isArray(twitterUser.data) && twitterUser.data[0]?.id);
                
                if (twitterId) {
                    log(`Fetching liked tweets for Twitter ID: ${twitterId}...`);
                    const tweets = await getLikedTweets(twitterId);
                    if (tweets.success) {
                        twitterData = tweets.data || [];
                        log(`Fetched ${Array.isArray(twitterData) ? twitterData.length : 'some'} liked tweets.`);
                    } else {
                        log(`Failed to fetch liked tweets: ${tweets.error}`);
                    }
                } else {
                    log('Could not determine Twitter User ID from response.');
                }
            } else {
                log(`Failed to fetch Twitter user: ${twitterUser.error}`);
            }
        } catch (e) {
            log(`Error fetching Twitter data: ${e}`);
        }

        // 3. Prepare Prompt
        const prompt = `
            <task>
            Analyze user data from multiple sources to identify and articulate specific interests across three categories: personal, local, and national/global.
            </task>

            <context>
            This analysis will be used to understand the user's engagement patterns and preferences across different spheres of their life. The goal is to surface meaningful, specific interests that reflect genuine engagement, not generic categories.
            </context>

            <user_data>
            <emails>
            ${JSON.stringify(emailData.slice(0, 10)).slice(0, 3000)}
            </emails>

            <calendar_events>
            ${JSON.stringify(calendarData.slice(0, 10)).slice(0, 3000)}
            </calendar_events>

            <twitter_likes>
            ${JSON.stringify(twitterData.slice(0, 10)).slice(0, 3000)}
            </twitter_likes>
            </user_data>

            <instructions>
            1. Analyze the user data above to identify patterns, recurring themes, and areas of engagement
            2. For each of the three categories (personal, local, global), identify exactly three distinct interests
            3. For each interest, write one detailed paragraph that includes:
            - The specific interest or topic area
            - Concrete evidence from the data that suggests this interest (e.g., specific emails, events, or tweets)
            - How this interest relates to the user's life and activities
            - Why this is a meaningful interest (not just a passing mention)
            4. Ensure interests are specific and actionable, not generic (e.g., "urban gardening with focus on native plants" rather than "gardening")
            </instructions>

            <interest_categories>
            - **Personal**: Interests related to hobbies, self-improvement, health, personal development, or individual pursuits
            - **Local**: Interests tied to the user's community, city, neighborhood, or regional issues and events
            - **Global**: Interests in national or international topics, trends, issues, or movements
            </interest_categories>

            <output_format>
            Provide your response as valid JSON with the following structure:
            {
            "personal": [
                "Interest 1: [Detailed paragraph describing the interest, evidence from data, and relevance to user]",
                "Interest 2: [Detailed paragraph describing the interest, evidence from data, and relevance to user]",
                "Interest 3: [Detailed paragraph describing the interest, evidence from data, and relevance to user]"
            ],
            "local": [
                "Interest 1: [Detailed paragraph describing the interest, evidence from data, and relevance to user]",
                "Interest 2: [Detailed paragraph describing the interest, evidence from data, and relevance to user]",
                "Interest 3: [Detailed paragraph describing the interest, evidence from data, and relevance to user]"
            ],
            "global": [
                "Interest 1: [Detailed paragraph describing the interest, evidence from data, and relevance to user]",
                "Interest 2: [Detailed paragraph describing the interest, evidence from data, and relevance to user]",
                "Interest 3: [Detailed paragraph describing the interest, evidence from data, and relevance to user]"
            ]
            }
            </output_format>

            <constraints>
            - Each paragraph must be substantive (4-6 sentences minimum)
            - Include specific references to the data provided
            - Avoid generic or overly broad interests
            - Ensure all three interests in each category are distinct from each other
            - Output must be valid, parseable JSON
            </constraints>
        `;  

        log('Sending prompt to Gemini...');

        // 4. Generate Text
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let interests: any = {};
        try {
            const { text } = await generateText({
                model: google('gemini-3-pro-preview'),
                prompt: prompt,
            });
            log('Received response from Gemini.');
            
            // Try to parse JSON
            const cleanResult = text.replace(/```json/g, '').replace(/```/g, '');
            interests = JSON.parse(cleanResult);
            stream.update({ type: 'interests', data: interests });
        } catch (e) {
            log(`Error generating/parsing interests: ${e}`);
            throw e;
        }

        // 5. Search Exa for News
        log('Starting Exa news search for generated interests...');
        const exa = new Exa(process.env.EXA_API_KEY);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enrichedInterests: any = { personal: [], local: [], global: [] };

        const generateQueriesForInterest = async (category: string, interest: string) => {
            try {
                const queryPrompt = `
                    <task>
                    Generate three concise, targeted web search queries to find recent, relevant information about a specific user interest.
                    </task>

                    <context>
                    These search queries will be used to discover current articles, trends, and developments related to the user's interest. The queries should be optimized for search engines and focus on recent content from the last year to ensure relevance and timeliness.
                    </context>

                    <interest_details>
                    <category>${category}</category>
                    <interest_description>${interest}</interest_description>
                    </interest_details>

                    <instructions>
                    1. Analyze the interest description to identify key topics, themes, and specific aspects worth exploring
                    2. Generate exactly three distinct search queries that:
                    - Are concise and focused (5-10 words each)
                    - Target different angles or aspects of the interest
                    - Are optimized for search engine effectiveness
                    - Include temporal constraints to find recent content from the last year
                    3. Ensure queries are specific enough to return relevant results, not generic broad searches
                    4. Avoid redundancy - each query should explore a different dimension of the interest
                    </instructions>

                    <query_requirements>
                    - Each query must include a time constraint (e.g., "2024", "2025", "last year", "recent")
                    - Focus on actionable, specific search terms rather than generic phrases
                    - Use terminology that would appear in recent articles, news, or discussions
                    - Consider including terms like "trends", "developments", "latest", "new" when appropriate
                    - Optimize for discoverability of current, high-quality content
                    </query_requirements>

                    <examples>
                    <example>
                    If the interest is about "sustainable urban farming practices in Chicago":
                    Good queries:
                    - "Chicago urban farming innovations 2024 2025"
                    - "sustainable rooftop gardens Chicago recent developments"
                    - "community farming initiatives Chicago last year"

                    Bad queries (too generic or no temporal constraint):
                    - "urban farming"
                    - "Chicago gardening"
                    - "sustainable agriculture techniques"
                    </example>
                    </examples>

                    <output_format>
                    Return ONLY a valid JSON array of exactly three strings. Do not include any explanation, preamble, or additional text.

                    Format:
                    ["query 1", "query 2", "query 3"]

                    Each query should be a plain text string optimized for web search engines.
                    </output_format>

                    <constraints>
                    - Output must be valid, parseable JSON array
                    - Exactly three queries required
                    - Each query must be 5-10 words long
                    - Each query must include temporal reference to last year/2024/2025
                    - No markdown formatting, code blocks, or explanatory text
                    - Queries should be distinct and non-overlapping
                    </constraints>
                `;  
                const { text } = await generateText({
                    model: google('gemini-3-pro-preview'),
                    prompt: queryPrompt,
                });
                const cleanResult = text.replace(/```json/g, '').replace(/```/g, '');
                const parsed = JSON.parse(cleanResult);
                if (Array.isArray(parsed)) {
                    return parsed.filter((q) => typeof q === 'string' && q.trim().length > 0).slice(0, 3);
                }
                if (parsed && Array.isArray(parsed.queries)) {
                    return parsed.queries.filter((q: unknown) => typeof q === 'string' && q.trim().length > 0).slice(0, 3);
                }
                return [interest];
            } catch (e) {
                log(`Error generating queries for interest: ${e}`);
                return [interest];
            }
        };

        const processInterest = async (category: string, interest: string) => {
            try {
                log(`Generating search queries for ${category} interest: "${interest.substring(0, 30)}..."`);
                const queries = await generateQueriesForInterest(category, interest);
                const articles: { title: string | null, url: string, text: string | null, query: string }[] = [];

                for (const query of queries) {
                    log(`Searching news for query: "${query.substring(0, 40)}..."`);
                    const result = await exa.searchAndContents(query, {
                        type: "auto",
                        useAutoprompt: true,
                        category: "news",
                        numResults: 3,
                        text: true
                    });
                    for (const r of result.results) {
                        articles.push({
                            title: r.title ?? null,
                            url: r.url,
                            text: r.text ?? null,
                            query
                        });
                    }
                }
                
                return {
                    interest,
                    queries,
                    articles
                };
            } catch (e) {
                log(`Error searching Exa for interest: ${e}`);
                return { interest, queries: [], articles: [], error: String(e) };
            }
        };

        // Process all categories
        for (const category of ['personal', 'local', 'global']) {
            if (interests[category] && Array.isArray(interests[category])) {
                for (const interest of interests[category]) {
                    const enriched = await processInterest(category, interest);
                    enrichedInterests[category].push(enriched);
                    // Stream partial update if needed, or just logs
                    stream.update({ type: 'log', message: `Found ${enriched.articles.length} articles for interest.` });
                }
            }
        }

        stream.update({ type: 'final_result', data: enrichedInterests });
        stream.done();

    } catch (e) {
        log(`Fatal error: ${e}`);
        stream.error(e);
    }
  })();

  return { object: stream.value };
}
