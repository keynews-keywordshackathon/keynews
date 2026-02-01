'use client'

import { useState } from 'react';
import { generateInterestsAction } from '@/actions/generate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { readStreamableValue } from '@ai-sdk/rsc';

export default function GeneratePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null);

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
                    <InterestSection title="Personal Interests" interests={result.personal} />
                    <InterestSection title="Local Interests" interests={result.local} />
                    <InterestSection title="Global Interests" interests={result.global} />
                    
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InterestSection({ title, interests }: { title: string, interests: any[] }) {
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
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {item.articles.map((article: any, j: number) => (
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
