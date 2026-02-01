"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Gamepad2,
  Globe2,
  MapPin,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { CrosswordGame } from "@/components/crossword/crossword-game";
import { ConnectionsGame } from "@/components/connections/ConnectionsGame";
import puzzleData from "@/lib/crossword/sample-puzzle.json";
import type { PuzzleData } from "@/lib/crossword/types";
import { sections, weatherPanel } from "@/lib/home/sections";
import type { Puzzle } from "@/lib/connections/types";
import { NytFrontSection } from "@/components/home/nyt-front-section";
import { WeatherPanel } from "@/components/home/weather-panel";
import type { NytFrontSectionProps, NytArticle } from "@/lib/home/nyt-types";
import { createClient } from "@/lib/supabase/client";


const getPreviewText = (text: string, sentenceCount = 2) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, sentenceCount).join(" ");
};

// Transform sections articles into NYTimes format
// Returns both the NYT data and a Set of article titles used in the NYT section
const transformToNytFormat = (sectionData: typeof sections): {
  nytData: Omit<NytFrontSectionProps, 'onArticleClick'> | null;
  usedArticleTitles: Set<string>;
} => {
  const usedArticleTitles = new Set<string>();
  const allArticles = sectionData.flatMap((s) => s.articles);

  if (allArticles.length === 0) return { nytData: null, usedArticleTitles };

  const personalSection = sectionData.find((s) => s.id === "personal");
  const localSection = sectionData.find((s) => s.id === "local");

  // Find first article with images for center
  const centerArticle = allArticles.find((a) => a.images && a.images.length > 0) || allArticles[0];
  usedArticleTitles.add(centerArticle.title);

  // Left column: Personal articles (2-3, first has blurb) — exclude the center article
  const leftArticlesRaw = (personalSection?.articles || [])
    .filter((a) => a !== centerArticle)
    .slice(0, 3);

  leftArticlesRaw.forEach((a) => usedArticleTitles.add(a.title));

  const leftArticles = leftArticlesRaw.map((article, index) => ({
    title: article.title,
    blurb: index === 0 ? getPreviewText(article.summary, 2) : undefined,
    originalArticle: article,
  })) as NytArticle[];

  // Center article: Featured with image
  const centerNytArticle: NytArticle = {
    title: centerArticle.title,
    blurb: getPreviewText(centerArticle.summary, 3),
    image: centerArticle.images?.[0]
      ? {
        src: centerArticle.images[0].src ?? "",
        alt: centerArticle.images[0].label || centerArticle.title,
        label: centerArticle.images[0].label,
        tint: centerArticle.images[0].tint,
      }
      : undefined,
    originalArticle: centerArticle,
  };

  // Bottom row: Local articles (2 articles with images)
  const bottomArticlesRaw = (localSection?.articles || []).slice(0, 2);
  bottomArticlesRaw.forEach((a) => usedArticleTitles.add(a.title));

  const bottomArticlesList: NytArticle[] = bottomArticlesRaw.map((article) => ({
    title: article.title,
    blurb: getPreviewText(article.summary, 2),
    image: article.images?.[0]
      ? {
        src: article.images[0].src ?? "",
        alt: article.images[0].label || article.title,
        label: article.images[0].label,
        tint: article.images[0].tint,
      }
      : undefined,
    originalArticle: article,
  }));

  // Ensure we have exactly 2 articles, pad if needed
  const bottomArticles: [NytArticle, NytArticle] = [
    bottomArticlesList[0] || { title: "" },
    bottomArticlesList[1] || { title: "" },
  ];

  return {
    nytData: {
      leftArticles,
      centerArticle: centerNytArticle,
      bottomArticles,
    },
    usedArticleTitles,
  };
};

const sectionIconMap = {
  personal: User,
  local: MapPin,
  global: Globe2,
};

type Section = (typeof sections)[number];
type Article = Section["articles"][number];

const SECTIONS_CACHE_KEY = "keynews-sections-cache";

function getCachedSections(): Section[] {
  try {
    const cached = localStorage.getItem(SECTIONS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return sections;
}

export default function Home() {
  const router = useRouter();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isCrosswordOpen, setIsCrosswordOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [connectionsPuzzle, setConnectionsPuzzle] = useState<Puzzle | null>(null);
  const [homeSections, setHomeSections] = useState<Section[]>(getCachedSections);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const markImageFailed = (src?: string) => {
    if (!src) return;
    setFailedImages((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  };

  const openArticle = (article: Article) => {
    const key = `keynews-article-${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(article));
    router.push(`/article?id=${encodeURIComponent(key)}`);
  };

  useEffect(() => {
    if (!isCrosswordOpen && !isConnectionsOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCrosswordOpen, isConnectionsOpen]);

  useEffect(() => {
    if (!isConnectionsOpen || connectionsPuzzle) return;

    let isActive = true;

    fetch("/daily-puzzle.json")
      .then((response) => response.json())
      .then((data) => {
        if (isActive) {
          setConnectionsPuzzle(data as Puzzle);
        }
      })
      .catch(() => {
        if (isActive) {
          setConnectionsPuzzle({ id: "fallback", groups: [] });
        }
      });

    return () => {
      isActive = false;
    };
  }, [isConnectionsOpen, connectionsPuzzle]);

  useEffect(() => {
    let isActive = true;

    const loadSections = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("user_generated_sections")
        .select("sections")
        .eq("user_id", userData.user.id)
        .single();

      if (!isActive) return;
      if (!error && data?.sections && Array.isArray(data.sections)) {
        setHomeSections(data.sections);
        localStorage.setItem(SECTIONS_CACHE_KEY, JSON.stringify(data.sections));
      }
    };

    loadSections();

    return () => {
      isActive = false;
    };
  }, []);

  const { nytData, usedArticleTitles } = transformToNytFormat(homeSections);

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
    >
      <div className="pointer-events-none absolute inset-0" />
      <div
        className={`fixed inset-0 z-40 ${isAssistantOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${isAssistantOpen ? "opacity-80" : "opacity-0"
            }`}
          onClick={() => setIsAssistantOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white/90 backdrop-blur-xl shadow-2xl transition-transform duration-300 ${isAssistantOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                  AI Assistant
                </p>
                <h3 className="mt-1 text-lg font-medium">News sidekick</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsAssistantOpen(false)}>
                Retract
              </Button>
            </div>
            <div className="flex-1 overflow-hidden px-6 py-4">
              <div className="flex h-full flex-col gap-4 overflow-y-auto custom-scrollbar">
                <div className="max-w-[85%] rounded-2xl bg-white/80 px-4 py-3 text-sm text-zinc-700 shadow-sm">
                  Morning! Want a quick summary or deeper context on any story?
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-sm">
                  Summarize the personal brief and suggest follow-ups.
                </div>
                <div className="max-w-[85%] rounded-2xl bg-white/80 px-4 py-3 text-sm text-zinc-700 shadow-sm">
                  Your personal brief highlights the UIUC career fair opening, with registration
                  closing Friday. I can pull related company profiles or add a reminder. Which
                  follow-up do you want?
                </div>
              </div>
            </div>
            <div className="border-t border-black/5 px-6 py-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <input
                  type="text"
                  placeholder="Ask about today's coverage..."
                  className="flex-1 bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none"
                />
                <Button size="sm">Send</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isCrosswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white/20 backdrop-blur-md"
              onClick={() => setIsCrosswordOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 280,
                duration: 0.4,
              }}
              className="relative w-[92vw] max-w-[1200px] overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/40 via-white/25 to-white/15 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.75)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                    <Gamepad2 className="size-4 text-zinc-400" />
                    Games
                  </p>
                  <h3 className="mt-1 text-lg font-medium">Daily Crossword</h3>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setIsCrosswordOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto px-6 py-6 custom-scrollbar">
                <CrosswordGame puzzle={puzzleData as PuzzleData} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isConnectionsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white/20 backdrop-blur-md"
              onClick={() => setIsConnectionsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 280,
                duration: 0.4,
              }}
              className="relative w-[92vw] max-w-[1200px] overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/40 via-white/25 to-white/15 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.75)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                    <Gamepad2 className="size-4 text-zinc-400" />
                    Games
                  </p>
                  <h3 className="mt-1 text-lg font-medium">Connections</h3>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setIsConnectionsOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto px-6 py-6 custom-scrollbar">
                {connectionsPuzzle ? (
                  <ConnectionsGame puzzle={connectionsPuzzle} />
                ) : (
                  <div className="text-sm text-zinc-600">Loading connections...</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="relative z-10 bg-transparent">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-4 py-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
            </div>
            <div className="text-center">
              <h1 className="headline-masthead text-5xl leading-none text-foreground md:text-8xl">
                The Keywords Times
              </h1>
            </div>
            <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">

            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/1000">
            {[
              { label: "Personal", href: "#personal" },
              { label: "Local", href: "#local" },
              { label: "Global", href: "#global" },
              { label: "Weather", href: "#weather" },

              { label: "AI", href: "#agent-flow" },
              { label: "Games", href: "#games" },
              { label: "Actions", href: "#actions" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="section-label hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 border-y border-foreground/100 py-0.25">
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl space-y-4 px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">

            {/* NYTimes-Style Front Page Section */}
            {nytData && (
              <NytFrontSection
                {...nytData}
                onArticleClick={(article) => openArticle(article)}
              />
            )}

            {/* Additional sections below */}
            <section className="space-y-4">
              {homeSections.map((section) => {
                const SectionIcon = sectionIconMap[section.id as keyof typeof sectionIconMap];
                // Filter out articles already shown in NYT section
                const remainingArticles = section.articles.filter(
                  (article) => !usedArticleTitles.has(article.title)
                );

                // Skip section if no articles remain
                if (remainingArticles.length === 0) return null;

                return (
                  <div key={section.id} id={section.id} className="py-3">
                    <div className="mb-2 border-t border-b border-border" />

                    <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                          <SectionIcon className="size-4 text-muted-foreground" />
                          {section.title}
                        </p>
                        <h3 className="headline-primary mt-1 text-2xl text-foreground">{section.subtitle}</h3>
                      </div>
                      <Link
                        href="#top"
                        className="section-label inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                      >
                        <ArrowUpRight className="size-4" />
                        Back to top
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-y-0">
                      {remainingArticles.map((article) => {
                        const visibleImages = article.images.filter(
                          (image) => image.src && !failedImages.has(image.src)
                        );

                        return (
                          <article
                            key={article.title}
                            onClick={() => openArticle(article)}
                            className="group cursor-pointer py-4 transition lg:border-b lg:border-border lg:p-4 lg:odd:border-r lg:[&:nth-last-child(-n+2)]:border-b-0"
                          >
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                {visibleImages.map((image) => (
                                  <div
                                    key={`${article.title}-${image.label}`}
                                    className={`${visibleImages.length === 1 ? "col-span-2" : ""}`}
                                  >
                                    <div className={`relative h-28 overflow-hidden newspaper-border-thin bg-gradient-to-br ${image.tint}`}>
                                      {image.src && (
                                        <img
                                          src={image.src}
                                          alt={image.label || article.title}
                                          className="absolute inset-0 h-full w-full object-cover"
                                          onError={() => markImageFailed(image.src)}
                                        />
                                      )}
                                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                                    </div>
                                    {image.label && (
                                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                                        {image.label}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <h4 className="headline-secondary text-lg text-foreground transition-colors group-hover:text-zinc-500">{article.title}</h4>
                                <div className="relative">
                                  <p className="article-body font-serif transition-colors group-hover:text-zinc-400">
                                    {getPreviewText(article.summary)}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <span className="section-label">
                                    Sources
                                  </span>
                                  {article.sources.map((source) => (
                                    <Link
                                      key={source.href}
                                      onClick={(e) => e.stopPropagation()}
                                      href={source.href}
                                      className="newspaper-border-thin px-3 py-1 transition hover:bg-black/5"
                                      target="_blank"
                                    >
                                      {source.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 relative group/action inline-block">
                              <Link
                                onClick={(e) => e.stopPropagation()}
                                href={article.action.href}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
                              >
                                <Sparkles className="size-4" />
                                {article.action.label}
                              </Link>

                              {/* Hover Card */}
                              <div className="absolute left-0 top-full mt-2 w-72 opacity-0 invisible group-hover/action:opacity-100 group-hover/action:visible transition-all duration-200 z-50">
                                <div className="rounded-xl border border-border bg-white p-4 shadow-lg">
                                  {/* Arrow pointer */}
                                  <div className="absolute left-4 top-0 -translate-y-full">
                                    <div className="border-8 border-transparent border-b-white" />
                                  </div>
                                  <div className="absolute left-4 top-0 -translate-y-full">
                                    <div className="border-8 border-transparent border-b-border" style={{ marginTop: '-1px' }} />
                                  </div>
                                  <div className="space-y-3 text-sm text-zinc-700">
                                    <div>
                                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                                        Why it matters
                                      </p>
                                      <p className="mt-1">{article.relevance}</p>
                                    </div>
                                    <div>
                                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                                        Why act now
                                      </p>
                                      <p className="mt-1">{article.actionReason}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>

            <section id="games" className="py-3">
              <div className="mb-2 border-t border-b border-border" />
              <div className="mb-2 flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-2">
                  <p className="section-label text-muted-foreground">
                    Games
                  </p>
                  <h3 className="headline-primary text-2xl text-foreground">Daily Crossword</h3>
                  <p className="article-body font-serif">
                    Keep focus sharp with a quick puzzle tailored to your brief.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" className="gap-2" onClick={() => setIsCrosswordOpen(true)}>
                    <Gamepad2 className="size-4" />
                    Open crossword
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2" onClick={() => setIsConnectionsOpen(true)}>
                    <Gamepad2 className="size-4" />
                    Open connections
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="newspaper-border-thin p-4">
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <Gamepad2 className="size-4 text-muted-foreground" />
                    Today&apos;s Game
                  </p>
                  <p className="article-body font-serif mt-2 text-muted-foreground">
                    15×15 grid with checks, reveals, and autosave.
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => setIsCrosswordOpen(true)}
                    >
                      <Gamepad2 className="size-4" />
                      Play now
                    </Button>
                  </div>
                </div>
                <div className="newspaper-border-thin p-4">
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <Gamepad2 className="size-4 text-muted-foreground" />
                    Connections
                  </p>
                  <p className="article-body mt-2 text-muted-foreground">
                    Group 16 words into four linked categories.
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => setIsConnectionsOpen(true)}
                    >
                      <Gamepad2 className="size-4" />
                      Play now
                    </Button>
                  </div>
                </div>
                <div className="newspaper-border-thin p-4">
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="size-4 text-muted-foreground" />
                    Progress
                  </p>
                  <p className="article-body font-serif mt-2 text-muted-foreground">
                    Timer control, quick checks, and clue navigation are ready.
                  </p>
                </div>
              </div>
            </section>

            <section id="actions" className="py-3">
              <div className="mb-2 border-t border-b border-border" />
              <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr] lg:items-center">
                <div className="space-y-2">
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="size-4 text-muted-foreground" />
                    Personalized Actions
                  </p>
                  <h3 className="headline-primary text-2xl text-foreground">Next moves, already queued.</h3>
                  <p className="article-body font-serif text-muted-foreground">
                    Your homepage stays ready for contextual follow-ups like chat threads,
                    puzzle drops, and quick replies when breaking news changes.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Fact-check queue",
                      description:
                        "Flag any story for deeper verification with multiple sources and bias checks.",
                    },
                    {
                      title: "Daily brief export",
                      description:
                        "Send a polished digest to email, Slack, or calendar notes in one tap.",
                    },
                    {
                      title: "Puzzle refresh",
                      description:
                        "Generate new crossword or connections based on your trending keywords.",
                    },
                    {
                      title: "Smart follow-ups",
                      description:
                        "Ask a question and update the relevant story cards instantly.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="newspaper-border-thin p-3 transition hover:bg-black/5"
                    >
                      <h4 className="headline-secondary text-sm text-foreground">{item.title}</h4>
                      <p className="article-body mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <WeatherPanel initialData={weatherPanel} />

            <div className="border-t border-b border-border" />



            <div className="newspaper-border-thin bg-transparent p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <Bot className="size-4 text-muted-foreground" />
                    AI Assistant
                  </p>
                  <p className="article-body mt-1">
                    Open the assistant for quick analysis.
                  </p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setIsAssistantOpen(true)}>
                  <Bot className="size-4" />
                  Open
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
