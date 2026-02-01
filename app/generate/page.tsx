'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { generateInterestsAction } from '@/actions/generate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { readStreamableValue } from '@ai-sdk/rsc';
import {
    NotebookPen,
    Search,
    FileText,
    ListChecks,
    Lightbulb,
    CheckCircle2,
    XCircle,
    Mail,
    Calendar,
    Twitter
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
    const [userName, setUserName] = useState<string | null>(null);
    const [phase, setPhase] = useState<'initial' | 'researching' | 'generating'>('initial');
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
        if (lower.includes('generating news') || lower.includes('cards') || lower.includes('drafting')) return 'generate';
        if (lower.includes('saving') || lower.includes('saved')) return 'save';
        if (lower.includes('error') || lower.includes('failed')) return 'error';
        return 'plan';
    };

    const handleGenerate = async () => {
        setEvents([]);
        setResult(null);
        setPhase('initial');
        // Delay showing "Starting..." until we have the user name for the header

        try {
            const { object, userName: initialName } = await generateInterestsAction();

            if (initialName) {
                setUserName(initialName);
            }

            setIsGenerating(true);
            addEvent('Starting generation process...', 'start');

            for await (const partial of readStreamableValue(object)) {
                if (partial) {
                    if (partial.type === 'log') {
                        const eventType = mapLogToEvent(partial.message);
                        addEvent(partial.message, eventType);

                        // Update phases based on specific logs
                        if (partial.message.includes('Received list of interests from Gemini')) {
                            setPhase('researching');
                        } else if (partial.message.includes('Drafting article') || partial.message.includes('Generating news cards')) {
                            setPhase('generating');
                        }
                    } else if (partial.type === 'user_info') {
                        setUserName(partial.data.name);
                    } else if (partial.type === 'final_result') {
                        setResult(partial.data);
                        addEvent('Generation complete', 'complete');
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

    // Auto-start generation on load
    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            handleGenerate();
        }
    }, []);

    return (
        <div className="container mx-auto p-4 max-w-5xl flex flex-col gap-4 h-screen overflow-hidden">
            <div className="space-y-2 text-center py-4 flex-shrink-0">
                <h1 className="text-3xl font-serif font-bold tracking-tight min-h-[1.2em]">
                    {phase === 'researching' && userName ? `Researching about ${userName}'s interests` :
                        phase === 'generating' ? "Generating personalized news report" :
                            userName ? `Learning more about ${userName}` :
                                <span className="invisible">Loading...</span>}
                </h1>
            </div>

            {/* Event Stream / Progress */}
            {(isGenerating || events.length > 0) && (
                <div className="w-full max-w-2xl mx-auto relative perspective-[1000px] flex-1 min-h-0">
                    {/* Top fade gradient overlay */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

                    <div
                        ref={scrollContainerRef}
                        className="space-y-3 h-full overflow-y-auto px-4 pb-16 pt-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                                    <NotebookPen className="h-5 w-5 text-foreground animate-pulse flex-shrink-0" />
                                    <span className="text-base font-medium bg-gradient-to-r from-foreground via-foreground/60 to-foreground bg-[length:200%_100%] animate-shimmer bg-clip-text text-transparent">
                                        Initializing...
                                    </span>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Results Display - Removed as per user request */}
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
        if (event.type === 'fetch') {
            const lower = event.message.toLowerCase();
            if (lower.includes('email')) return <Mail className="h-5 w-5" />;
            if (lower.includes('twitter') || lower.includes('tweet')) return <Twitter className="h-5 w-5" />;
            if (lower.includes('calendar') || lower.includes('event')) return <Calendar className="h-5 w-5" />;
            return <Search className="h-5 w-5" />;
        }
        if (event.type === 'search') return <Search className="h-5 w-5" />;
        if (event.type === 'generate') return <NotebookPen className="h-5 w-5" />;
        if (event.type === 'plan') return <Lightbulb className="h-5 w-5" />;
        return <FileText className="h-5 w-5" />;
    };

    const getTitle = () => {
        switch (event.type) {
            case 'start': return 'Starting';
            case 'auth': return 'Authenticating';
            case 'fetch': {
                const lower = event.message.toLowerCase();
                if (lower.includes('email')) return 'Fetching Emails';
                if (lower.includes('twitter') || lower.includes('tweet')) return 'Fetching Twitter';
                if (lower.includes('calendar') || lower.includes('event')) return 'Fetching Calendar';
                return 'Gathering Data';
            }
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
                            <div className="whitespace-pre-wrap break-words">
                                {event.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
