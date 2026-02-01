'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { generateInterestsAction } from '@/actions/generate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { readStreamableValue } from '@ai-sdk/rsc';
import {
    Brain,
    Search,
    FileText,
    ListChecks,
    Lightbulb,
    ChevronDown,
    CheckCircle2,
    XCircle,
    Loader2,
    Newspaper
} from 'lucide-react';

// --- Types ---

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
    images?: { label: string; tint: string; src?: string }[];
    sources?: { label: string; href: string }[];
    action?: { label?: string; cta?: string; href?: string };
};

type GeneratedItem = {
    interest: string;
    articles?: GeneratedArticle[];
};

type GenerationResult = {
    interests?: Record<string, string[]>;
    enrichedInterests?: Record<string, EnrichedInterest[]>;
    generatedSections?: Record<string, GeneratedItem[]>;
};

// Internal event type for the UI
type UIEventType =
    | 'start'
    | 'auth'
    | 'fetch'
    | 'plan'
    | 'search'
    | 'generate'
    | 'save'
    | 'complete'
    | 'error';

interface UIEvent {
    id: string;
    type: UIEventType;
    message: string;
    timestamp: string;
    isProcessing?: boolean;
    details?: string;
}

// --- Main Page Component ---

export default function GeneratePage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [events, setEvents] = useState<UIEvent[]>([]);
    const [result, setResult] = useState<GenerationResult | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of events
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [events]);

    const addEvent = useCallback((message: string, type: UIEventType = 'plan') => {
        setEvents(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            type,
            message,
            timestamp: new Date().toLocaleTimeString(),
            isProcessing: false
        }]);
    }, []);

    const updateLastEventProcessing = useCallback((isProcessing: boolean) => {
        setEvents(prev => {
            if (prev.length === 0) return prev;
            const newEvents = [...prev];
            newEvents[newEvents.length - 1] = {
                ...newEvents[newEvents.length - 1],
                isProcessing
            };
            return newEvents;
        });
    }, []);

    // Analyze log message to determine event type
    const mapLogToEvent = (log: string): UIEventType => {
        const lower = log.toLowerCase();
        if (lower.includes('authenticated')) return 'auth';
        if (lower.includes('fetching')) return 'fetch';
        if (lower.includes('prompt') || lower.includes('generating interests')) return 'plan';
        if (lower.includes('searching') || lower.includes('found')) return 'search';
        if (lower.includes('generating news') || lower.includes('cards')) return 'generate';
        if (lower.includes('saving') || lower.includes('saved')) return 'save';
        if (lower.includes('error') || lower.includes('failed')) return 'error';
        return 'plan';
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setEvents([]);
        setResult(null);
        addEvent('Starting generation process...', 'start');

        try {
            const { object } = await generateInterestsAction();

            for await (const partial of readStreamableValue(object)) {
                if (partial) {
                    if (partial.type === 'log') {
                        const eventType = mapLogToEvent(partial.message);
                        addEvent(partial.message, eventType);
                    } else if (partial.type === 'final_result') {
                        setResult(partial.data);
                        addEvent('Generation complete!', 'complete');
                    }
                }
            }
        } catch (error) {
            addEvent(`Error: ${error}`, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    // Determine current processing state for the carousel
    const processedEvents = useMemo(() => {
        return events.map((event, index) => {
            const isLast = index === events.length - 1;
            // If we are generating and this is the last event, mark it as processing
            // unless it's a completion or error event
            const isProcessing = isGenerating && isLast && event.type !== 'complete' && event.type !== 'error';
            return { ...event, isProcessing };
        });
    }, [events, isGenerating]);

    return (
        <div className="container mx-auto p-4 max-w-5xl min-h-screen flex flex-col gap-8">
            <div className="space-y-2 text-center py-8">
                <h1 className="text-4xl font-serif font-bold tracking-tight">Personalized News Edition</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Generate a custom newspaper based on your emails, calendar, and interests.
                </p>
            </div>

            {/* Control Center */}
            {!result && (
                <div className="w-full max-w-xl mx-auto">
                    <Card className="p-6 border-2">
                        <div className="flex flex-col items-center gap-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                size="lg"
                                className="w-full text-lg h-12"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating Your Edition...
                                    </>
                                ) : (
                                    <>
                                        <Newspaper className="mr-2 h-5 w-5" />
                                        Generate My Paper
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                Analyzes your recent digital footprint to find relevant news.
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            {/* Event Stream / Progress */}
            {(isGenerating || (events.length > 0 && !result)) && (
                <div className="w-full max-w-2xl mx-auto relative perspective-[1000px]">
                    {/* Top fade gradient overlay */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

                    <div
                        ref={scrollContainerRef}
                        className="space-y-3 max-h-[500px] overflow-y-auto pr-2 pb-10 pt-10 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: 'rotateX(2deg)' // Slight 3D effect like the reference
                        }}
                    >
                        {processedEvents.map((event) => (
                            <EventCarouselCard key={event.id} event={event} />
                        ))}

                        {isGenerating && events.length === 0 && (
                            <Card className="p-4">
                                <div className="flex items-center gap-3">
                                    <Brain className="h-5 w-5 text-foreground animate-pulse flex-shrink-0" />
                                    <span className="text-base font-medium bg-gradient-to-r from-foreground via-foreground/60 to-foreground bg-[length:200%_100%] animate-shimmer bg-clip-text text-transparent">
                                        Initializing...
                                    </span>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Results Display */}
            {result && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid gap-8">
                        <InterestSection title="Personal Interests" interests={result.enrichedInterests?.personal || result.interests?.personal?.map(i => ({ interest: i }))} />
                        <InterestSection title="Local Interests" interests={result.enrichedInterests?.local || result.interests?.local?.map(i => ({ interest: i }))} />
                        <InterestSection title="Global Interests" interests={result.enrichedInterests?.global || result.interests?.global?.map(i => ({ interest: i }))} />
                    </div>

                    <div className="border-t-4 border-double border-foreground py-8">
                        <h2 className="text-3xl font-serif font-bold text-center mb-12 uppercase tracking-widest">The Daily Brief</h2>

                        <GeneratedSection title="Personal News" items={result.generatedSections?.personal} />
                        <div className="h-8" />
                        <GeneratedSection title="Local News" items={result.generatedSections?.local} />
                        <div className="h-8" />
                        <GeneratedSection title="Global News" items={result.generatedSections?.global} />
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Subcomponents ---

function EventCarouselCard({ event }: { event: UIEvent }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = event.message.length > 150;
    const displayMessage = isExpanded ? event.message : event.message.substring(0, 150);

    const getIcon = () => {
        if (event.type === 'error') return <XCircle className="h-5 w-5 text-destructive" />;
        if (event.type === 'complete') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        if (event.type === 'auth') return <ListChecks className="h-5 w-5" />;
        if (event.type === 'fetch') return <Search className="h-5 w-5" />;
        if (event.type === 'search') return <Search className="h-5 w-5" />;
        if (event.type === 'generate') return <Brain className="h-5 w-5" />;
        if (event.type === 'plan') return <Lightbulb className="h-5 w-5" />;
        return <FileText className="h-5 w-5" />;
    };

    const getTitle = () => {
        switch (event.type) {
            case 'start': return 'Starting';
            case 'auth': return 'Authenticating';
            case 'fetch': return 'Gathering Data';
            case 'plan': return 'Analyzing & Planning';
            case 'search': return 'Researching Topics';
            case 'generate': return 'Writing Articles';
            case 'save': return 'Saving Results';
            case 'complete': return 'Finished';
            case 'error': return 'Failed';
            default: return 'System Event';
        }
    };

    return (
        <Card className={`p-4 transition-all duration-300 ${event.isProcessing ? 'border-primary/50 shadow-md scale-[1.02]' : 'hover:bg-muted/50'}`}>
            <div className="flex items-start gap-3">
                <div className={`${event.isProcessing ? 'animate-pulse text-primary' : 'text-muted-foreground'}`}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-semibold text-sm font-body ${event.isProcessing ? 'text-primary' : ''}`}>
                            {getTitle()}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{event.timestamp}</span>
                    </div>

                    <div className="text-sm text-muted-foreground leading-relaxed font-body">
                        {event.isProcessing ? (
                            <span className="bg-gradient-to-r from-foreground via-foreground/60 to-foreground bg-[length:200%_100%] animate-shimmer bg-clip-text text-transparent">
                                {event.message}
                            </span>
                        ) : (
                            <>
                                <div className="whitespace-pre-wrap break-words">
                                    {displayMessage}
                                    {!isExpanded && shouldTruncate && '...'}
                                </div>
                                {shouldTruncate && (
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="text-primary hover:underline text-xs mt-1 flex items-center gap-1"
                                    >
                                        {isExpanded ? 'Show less' : 'Show more'}
                                        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
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
                                        <li key={j} className="text-sm group">
                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
                                                <span className="flex-1 line-clamp-1 group-hover:underline">{article.title || article.url}</span>
                                            </a>
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
        <div className="container mx-auto max-w-4xl px-4">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-border flex-1" />
                <h3 className="font-serif text-2xl font-bold uppercase tracking-wider">{title}</h3>
                <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid gap-12">
                {items.map((item, i) => (
                    <div key={i} className="space-y-6">
                        {Array.isArray(item.articles) && item.articles.length > 0 ? (
                            item.articles.map((article, j) => (
                                <article key={j} className="grid md:grid-cols-12 gap-6 items-start">
                                    <div className="md:col-span-8 space-y-4">
                                        <h4 className="font-serif text-2xl font-bold leading-tight hover:text-blue-900 transition-colors">
                                            {article.title}
                                        </h4>
                                        <p className="font-sans text-sm font-medium uppercase tracking-wide text-muted-foreground">
                                            {article.relevance}
                                        </p>
                                        <div className="font-serif text-lg leading-relaxed text-foreground/90 prose prose-neutral dark:prose-invert max-w-none">
                                            {article.summary}
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
                                            {article.action?.href && (
                                                <a
                                                    href={article.action.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    {article.action.label || 'Read Full Story'}
                                                    <ChevronDown className="ml-1 h-3 w-3 -rotate-90" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-4 space-y-4">
                                        <div className="bg-muted p-4 rounded-lg space-y-3">
                                            <h5 className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Why This Matters</h5>
                                            <p className="text-sm">{article.actionReason}</p>
                                        </div>

                                        {article.sources && article.sources.length > 0 && (
                                            <div className="space-y-2">
                                                <h5 className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Sources</h5>
                                                <ul className="space-y-1">
                                                    {article.sources.map((source, k) => (
                                                        <li key={k}>
                                                            <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 truncate block">
                                                                {source.label || new URL(source.href).hostname}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}
