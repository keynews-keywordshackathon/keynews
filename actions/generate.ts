'use server'

import { deepseek } from '@ai-sdk/deepseek';
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
            User Data:
            Emails (sample): ${JSON.stringify(emailData.slice(0, 10)).slice(0, 3000)}
            Calendar (sample): ${JSON.stringify(calendarData.slice(0, 10)).slice(0, 3000)}
            Liked Tweets (sample): ${JSON.stringify(twitterData.slice(0, 10)).slice(0, 3000)}

            Based on the above user data, generate three interests for personal, three for local, and three for national/global. 
            Each interest should be specific and detailed, including what suggests the user is interested in the topic, how it relates to them etc. 
            One paragraph for each interest.
            
            Format the output as JSON:
            {
            "personal": ["interest 1 description...", "interest 2 description...", "interest 3 description..."],
            "local": ["interest 1 description...", "interest 2 description...", "interest 3 description..."],
            "global": ["interest 1 description...", "interest 2 description...", "interest 3 description..."]
            }
        `;

        log('Sending prompt to DeepSeek...');

        // 4. Generate Text
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let interests: any = {};
        try {
            const { text } = await generateText({
                model: deepseek('deepseek-chat'),
                prompt: prompt,
            });
            log('Received response from DeepSeek.');
            
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
Generate 3 concise web search queries for the following interest.
Return a JSON array of strings only.

Category: ${category}
Interest: ${interest}
                `;
                const { text } = await generateText({
                    model: deepseek('deepseek-chat'),
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
