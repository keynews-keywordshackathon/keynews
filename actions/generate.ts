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
import { getTwitterUser, getLikedTweets, getHomeTimeline } from './composio/twitter';
import { createClient } from '@/lib/supabase/server';
import { sections as baseSections } from '@/lib/home/sections';
import { KeywordsAITelemetry } from '@keywordsai/tracing';

const keywordsAI = new KeywordsAITelemetry({
    apiKey: process.env.KEYWORDSAI_API_KEY,
});

export async function generateInterestsAction() {
    const stream = createStreamableValue();

    (async () => {
        const logs: string[] = [];
        const log = (message: string) => {
            logs.push(message);
            console.log(message); // Also log to server console
            stream.update({ type: 'log', message });
        };

        try {
            await keywordsAI.initialize();
            await keywordsAI.withWorkflow({ name: 'generate_interests_workflow' }, async () => {
                // 1. Authenticate
                const supabase = await createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

            log(`Authenticated user: ${user.email || 'User'}`);

            // 2. Fetch Data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let emailData: any[] = [];
            try {
                log('Fetching emails...');
                const emails = await fetchEmails();
                if (emails.success) {
                    emailData = emails.emails || [];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const recentEmails = emailData.slice(0, 5).map((e: any) => `"${e.subject}"`).join('\n- ');
                    log(`Fetched ${emailData.length} emails. Recent subjects:\n- ${recentEmails}`);
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const recentEvents = calendarData.slice(0, 5).map((e: any) => `"${e.summary || 'Event'}"`).join('\n- ');
                    log(`Fetched ${calendarData.length} calendar events. Recent:\n- ${recentEvents}`);
                } else {
                    log(`Failed to fetch calendar events: ${events.error}`);
                }
            } catch (e) {
                log(`Error fetching calendar events: ${e}`);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let twitterData: any[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let twitterTimelineData: any[] = [];
            try {
                log('Fetching Twitter user...');
                const twitterUser = await getTwitterUser();
                if (twitterUser.success && twitterUser.data) {
                    // Log structure for confirmation (can remove later if noisy)
                    console.log('[Debug] Twitter User Data:', JSON.stringify(twitterUser.data, null, 2));

                        // Handle deeply nested structure from Composio: data.data.data.id
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const rawData = twitterUser.data as any;
                        const twitterId =
                            rawData.id ||
                            rawData.data?.id ||
                            rawData.data?.data?.id ||
                            (Array.isArray(rawData) && rawData[0]?.id);

                    if (twitterId) {
                        log(`Fetching liked tweets for user @${twitterUser.data.username || 'unknown'}...`);
                        const tweets = await getLikedTweets(twitterId);
                        if (tweets.success) {
                            // Handle nested structure: rawData.data.data is the array of tweets
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const rawTweets = (tweets.data as any)?.data?.data || (tweets.data as any)?.data || tweets.data || [];
                            twitterData = Array.isArray(rawTweets) ? rawTweets : [];

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const snippets = twitterData.slice(0, 5).map((t: any) => `"${t.text?.substring(0, 100).replace(/\n/g, ' ')}..."`).join('\n- ');
                            log(`Fetched ${twitterData.length} liked tweets:\n- ${snippets}`);
                        } else {
                            log(`Failed to fetch liked tweets: ${tweets.error}`);
                        }

                        // Fetch Home Timeline
                        log(`Fetching home timeline for user @${twitterUser.data.username || 'unknown'}...`);
                        const timeline = await getHomeTimeline(twitterId);
                        if (timeline.success) {
                            // Handle nested structure: rawData.data.data is the array of tweets
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const rawTimeline = (timeline.data as any)?.data?.data || (timeline.data as any)?.data || timeline.data || [];
                            twitterTimelineData = Array.isArray(rawTimeline) ? rawTimeline : [];

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const snippets = twitterTimelineData.slice(0, 5).map((t: any) => `"${t.text?.substring(0, 100).replace(/\n/g, ' ')}..."`).join('\n- ');
                            log(`Fetched ${twitterTimelineData.length} timeline tweets:\n- ${snippets}`);
                        } else {
                            log(`Failed to fetch home timeline: ${timeline.error}`);
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
            Analyze user data from multiple sources to identify and articulate interests across three categories: personal, local, and national/global.
            </task>

            <context>
            This analysis will be used to understand the user's engagement patterns and preferences across different spheres of their life. The goal is to surface meaningful interests that connect to the user's signals, not list the activities themselves.
            </context>

            <user_data>
            <emails>
            ${JSON.stringify(emailData.slice(0, 10)).slice(0, 3000)}
            </emails>

            <calendar_events>
            ${JSON.stringify(calendarData.slice(0, 10)).slice(0, 3000)}
            </calendar_events>

            <twitter_likes>
            ${JSON.stringify(Array.isArray(twitterData) ? twitterData.slice(0, 10) : []).slice(0, 3000)}
            </twitter_likes>

            <twitter_timeline>
            ${JSON.stringify(Array.isArray(twitterTimelineData) ? twitterTimelineData.slice(0, 10) : []).slice(0, 3000)}
            </twitter_timeline>


            </user_data>

            <instructions>
            1. Analyze the user data above to identify patterns, recurring themes, and areas of engagement
            2. For each of the three categories (personal, local, global), identify exactly three distinct interests
            3. Personal interests must be related to the user's activities but NOT the activities themselves, it must specify the user's location and school/organization.
            - Example: if the user plays chess, infer interest in local chess tournaments, clubs, or training groups
            - Example: if the user uses data analytics, infer interest in data science clubs, meetups, or workshops at the school/company they attend.
            4. Local interests must be based on the user's location only, focusing on community events, city issues, or local institutions relevant to that location
            5. Global interests must be broader, high-level themes inferred from user signals, not specific events
            - Example: if the user joins hackathons, infer interests like computer science, software engineering, tech innovation, or big tech trends
            6. For each interest, write one detailed paragraph that includes:
            - The specific interest or topic area
            - Concrete evidence from the data that suggests this interest (e.g., specific emails, events, or tweets)
            - How this interest relates to the user's life and activities
            - Why this is a meaningful interest (not just a passing mention)
            7. Ensure interests are specific and actionable, not generic unless it is a global interest
            </instructions>

            <interest_categories>
            - **Personal**: Interest themes connected to the user's activities, phrased as opportunities or communities rather than the activity itself
            - **Local**: Location-driven interests tied to the user's city, neighborhood, or regional institutions and events
            - **Global**: Broad national or international themes inferred from user signals (industries, fields, or movements)
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
            - Personal and local interests should be specific and actionable
            - Global interests can be broader but still grounded in user signals
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
                    model: google('gemini-3-flash-preview'),
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
                    - Each query must include a time constraint (e.g., "2024", "2025", "recent", "May 2025")
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
                        model: google('gemini-3-flash-preview'),
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
                        const articles: { title: string | null, url: string, text: string | null, query: string, imageUrl?: string | null }[] = [];

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
                                    query,
                                    imageUrl: (r as { image?: string | null }).image ?? null
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

                const generateArticlesForInterest = async (
                    category: string,
                    interest: string,
                    articles: { title: string | null, url: string, text: string | null, query: string, imageUrl?: string | null }[]
                ) => {
                    try {
                        log(`Generating news cards for ${category} interest: "${interest.substring(0, 30)}..."`);
                        const sourceArticles = articles.slice(0, 6).map((article) => ({
                            title: article.title,
                            url: article.url,
                            text: article.text ? article.text.slice(0, 600) : null,
                            query: article.query,
                            imageUrl: article.imageUrl ?? null
                        }));

                        const prompt = `
                    <task>
                    Generate 1 to 2 detailed news report-length articles based on the interest and the source articles.
                    </task>

                    <interest>
                    <category>${category}</category>
                    <description>${interest}</description>
                    </interest>

                    <source_articles>
                    ${JSON.stringify(sourceArticles)}
                    </source_articles>

                    <requirements>
                    - Return ONLY valid JSON
                    - Output must be a JSON array of 1 to 2 objects
                    - Each object must match the article shape used in lib/home/sections.ts
                    - Each summary must be a news report length (500-800 words)
                    - Write in a newspaper voice with a New York Times-style tone
                    - Summaries and titles must read like news articles, not blogs, vlogs, or suggestions
                    - relevance must be a short phrase (max 8 words)
                    - actionReason must be a short phrase (max 8 words)
                    - Use source URLs in the sources list and action hrefs
                    - Include at least 2 sources per article
                    - Keep summaries grounded in source_articles content
                    - Use 1 to 2 image entries per article
                    - Each image entry must include a valid image URL from source_articles imageUrl when available
                    </requirements>

                    <image_tints>
                    ["from-zinc-500/20 via-white/90 to-white","from-zinc-400/20 via-white/90 to-white","from-zinc-600/20 via-white/90 to-white","from-zinc-200/50 via-zinc-100/30 to-transparent"]
                    </image_tints>

                    <output_format>
                    [
                      {
                        "title": "string",
                        "summary": "string",
                        "relevance": "string",
                        "actionReason": "string",
                        "images": [
                          { "label": "string", "tint": "string", "src": "string" },
                          { "label": "string", "tint": "string", "src": "string" }
                        ],
                        "sources": [
                          { "label": "string", "href": "string" }
                        ],
                        "action": {
                          "label": "string",
                          "cta": "string",
                          "href": "string"
                        }
                      }
                    ]
                    </output_format>
                `;

                    const { text } = await generateText({
                        model: google('gemini-3-flash-preview'),
                        prompt
                    });

                        const cleanResult = text.replace(/```json/g, '').replace(/```/g, '');
                        const parsed = JSON.parse(cleanResult);
                        if (Array.isArray(parsed)) {
                            const imageUrls = sourceArticles
                                .map((article) => article.imageUrl)
                                .filter((url): url is string => typeof url === 'string' && url.length > 0);
                            return parsed.map((article) => {
                                if (!article) return article;
                                const fallbackTint = 'from-zinc-500/20 via-white/90 to-white';
                                const rawImages = Array.isArray(article.images) ? article.images : [];
                                const updatedImages = rawImages.map((image: { src?: string }, index: number) => ({
                                    ...image,
                                    src: image.src || imageUrls[index] || imageUrls[0] || ''
                                }));
                                const finalImages = updatedImages.length > 0
                                    ? updatedImages
                                    : imageUrls[0]
                                        ? [{ label: article.title || 'Image', tint: fallbackTint, src: imageUrls[0] }]
                                        : [];
                                return {
                                    ...article,
                                    images: finalImages
                                };
                            });
                        }
                        return [];
                    } catch (e) {
                        log(`Error generating news cards: ${e}`);
                        return [];
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const generatedSections: any = { personal: [], local: [], global: [] };
                for (const category of ['personal', 'local', 'global']) {
                    for (const item of enrichedInterests[category]) {
                        const generatedArticles = await generateArticlesForInterest(category, item.interest, item.articles || []);
                        generatedSections[category].push({
                            interest: item.interest,
                            articles: generatedArticles
                        });
                        stream.update({ type: 'log', message: `Generated ${generatedArticles.length} cards for interest.` });
                    }
                }

                const savedSections = baseSections.map((section) => {
                    const items = generatedSections[section.id] || [];
                    const articles = items.flatMap((item: { articles?: unknown }) =>
                        Array.isArray(item.articles) ? item.articles : []
                    );
                    return {
                        ...section,
                        articles
                    };
                });

                try {
                    const { error } = await supabase
                        .from('user_generated_sections')
                        .upsert({
                            user_id: user.id,
                            sections: savedSections,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id'
                        });

                    if (error) {
                        log(`Failed to save generated sections: ${error.message}`);
                    } else {
                        log('Saved generated sections to Supabase.');
                    }
                } catch (e) {
                    log(`Error saving generated sections: ${e}`);
                }

                stream.update({ type: 'final_result', data: { interests, enrichedInterests, generatedSections } });
                stream.done();
            });
        } catch (e) {
            log(`Fatal error: ${e}`);
            stream.error(e);
        }
    })();

    return { object: stream.value };
}
