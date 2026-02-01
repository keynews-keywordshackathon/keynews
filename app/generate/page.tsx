'use client'

import { useState } from 'react';
import { generateInterestsAction } from '@/actions/generate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { readStreamableValue } from '@ai-sdk/rsc';

type SourceArticle = {
    title: string | null;
    url: string;
    text: string | null;
    query?: string;
};

type EnrichedInterest = {
    interest: string;
    articles?: SourceArticle[];
};

type GeneratedArticle = {
    title: string;
    summary: string;
    relevance: string;
    actionReason: string;
    images?: { label: string; tint: string }[];
    sources?: { label: string; href: string }[];
    action?: { label?: string; cta?: string; href?: string };
};

type GeneratedItem = {
    interest: string;
    articles?: GeneratedArticle[];
};

export default function GeneratePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [result, setResult] = useState<{
        interests?: Record<string, string[]>;
        enrichedInterests?: Record<string, EnrichedInterest[]>;
        generatedSections?: Record<string, GeneratedItem[]>;
    } | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setLogs(['Starting generation...']);
        setResult(null);

        try {
            const { object } = await generateInterestsAction();
            
            for await (const partial of readStreamableValue(object)) {
                if (partial) {
                    if (partial.type === 'log') {
                        setLogs(prev => [...prev, partial.message]);
                    } else if (partial.type === 'final_result') {
                        setResult(partial.data);
                    }
                }
            }
        } catch (error) {
            setLogs(prev => [...prev, `Error: ${error}`]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-4">Generate Interests & News</h1>
            
            <Button onClick={handleGenerate} disabled={isLoading} className="mb-6">
                {isLoading ? 'Generating...' : 'Start Generation'}
            </Button>

            {logs.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1">{log}</div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && (
                <div className="grid gap-6">
                    <InterestSection title="Personal Interests" interests={result.enrichedInterests?.personal || result.personal} />
                    <InterestSection title="Local Interests" interests={result.enrichedInterests?.local || result.local} />
                    <InterestSection title="Global Interests" interests={result.enrichedInterests?.global || result.global} />

                    <GeneratedSection title="Generated Personal News" items={result.generatedSections?.personal} />
                    <GeneratedSection title="Generated Local News" items={result.generatedSections?.local} />
                    <GeneratedSection title="Generated Global News" items={result.generatedSections?.global} />
                    
                    <Card className="mt-8">
                        <CardHeader><CardTitle>Full JSON Result</CardTitle></CardHeader>
                        <CardContent>
                            <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-md overflow-x-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function InterestSection({ title, interests }: { title: string, interests: EnrichedInterest[] | undefined }) {
    if (!interests || !Array.isArray(interests)) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {interests.map((item, i) => (
                        <div key={i} className="border-b pb-4 last:border-0">
                            <h3 className="font-semibold text-lg mb-2">{item.interest}</h3>
                            {item.articles && item.articles.length > 0 ? (
                                <ul className="space-y-2">
                                    {item.articles.map((article, j) => (
                                        <li key={j} className="text-sm">
                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                                {article.title}
                                            </a>
                                            {article.text && (
                                                <p className="text-muted-foreground line-clamp-2 mt-1 text-xs">
                                                    {article.text}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No articles found.</p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function GeneratedSection({ title, items }: { title: string, items: GeneratedItem[] | undefined }) {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {items.map((item, i) => (
                        <div key={i} className="border-b pb-6 last:border-0">
                            <h3 className="font-semibold text-lg mb-3">{item.interest}</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {Array.isArray(item.articles) && item.articles.length > 0 ? (
                                    item.articles.map((article, j) => (
                                        <Card key={j} className="h-full">
                                            <CardHeader>
                                                <CardTitle className="text-base">{article.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 text-sm">
                                                <p className="text-muted-foreground">{article.summary}</p>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why it matters</p>
                                                    <p>{article.relevance}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why act now</p>
                                                    <p>{article.actionReason}</p>
                                                </div>
                                                {article.action?.href && (
                                                    <a
                                                        href={article.action.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm font-medium"
                                                    >
                                                        {article.action.label || 'Read more'}
                                                    </a>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No generated articles.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
