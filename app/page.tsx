"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CloudSun,
  Gamepad2,
  Globe2,
  MapPin,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { CrosswordGame } from "@/components/crossword/crossword-game";
import { ConnectionsGame } from "@/components/connections/ConnectionsGame";
import puzzleData from "@/lib/crossword/sample-puzzle.json";
import type { PuzzleData } from "@/lib/crossword/types";
import { sections, weatherPanel, stockPanel } from "@/lib/home/sections";
import type { Puzzle } from "@/lib/connections/types";
import { createClient } from "@/lib/supabase/client";


const getPreviewText = (text: string, sentenceCount = 2) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, sentenceCount).join(" ");
};

const sectionIconMap = {
  personal: User,
  local: MapPin,
  global: Globe2,
};

type Section = (typeof sections)[number];
type Article = Section["articles"][number];

export default function Home() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isCrosswordOpen, setIsCrosswordOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [connectionsPuzzle, setConnectionsPuzzle] = useState<Puzzle | null>(null);
  const [homeSections, setHomeSections] = useState<Section[]>(sections);

  useEffect(() => {
    if (!activeArticle && !isCrosswordOpen && !isConnectionsOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeArticle, isCrosswordOpen, isConnectionsOpen]);

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
      }
    };

    loadSections();

    return () => {
      isActive = false;
    };
  }, []);

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
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white/20 backdrop-blur-md"
              onClick={() => setActiveArticle(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.4
              }}
              className="relative w-[80vw] max-w-[80vw] overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/40 via-white/25 to-white/15 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.75)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                    Full Story
                  </p>
                  <h3 className="mt-1 text-2xl font-bold font-serif text-black">{activeArticle.title}</h3>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setActiveArticle(null)}>
                  Close
                </Button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-4">
                    {activeArticle.images.map((image) => (
                      <div
                        key={`${activeArticle.title}-${image.label}`}
                        className={`relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br ${image.tint} ${activeArticle.images.length === 1 ? "col-span-2" : ""
                          }`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                        <div className="relative z-10 flex h-full items-end p-4 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                          {image.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <p className="text-xl leading-relaxed text-zinc-800 font-serif">
                      {activeArticle.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                      <span className="font-medium uppercase tracking-[0.2em]">Sources</span>
                      {activeArticle.sources.map((source) => (
                        <Link
                          key={source.href}
                          href={source.href}
                          className="rounded-full bg-white/50 px-3 py-1 transition hover:bg-white/70"
                          target="_blank"
                        >
                          {source.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-emerald-500/30 bg-transparent p-5 shadow-[0_18px_40px_-35px_rgba(15,23,42,0.7)] backdrop-blur-xl">
                    <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                      <Sparkles className="size-3 text-emerald-600" />
                      Action
                    </p>
                    <div className="mt-4 space-y-4 text-sm text-zinc-700">
                      <div>
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                          Why it matters
                        </p>
                        <p className="mt-1">{activeArticle.relevance}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                          Why act now
                        </p>
                        <p className="mt-1">{activeArticle.actionReason}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={activeArticle.action.href}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
                      >
                        <ArrowRight className="size-4" />
                        {activeArticle.action.label}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
              { label: "Stocks", href: "#stocks" },
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
            <section id="agent-flow" className="newspaper-border grid gap-4 p-4 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-3">
                <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="size-4 text-muted-foreground" />
                  High-Level Agent Flow
                </p>
                <h2 className="headline-primary text-2xl text-foreground md:text-3xl">
                  Overview of personal, local, and global intelligence.
                </h2>
                <p className="article-body font-serif text-foreground/80">
                  MCP signals, personal context, bias checks, and actionable recaps power each
                  section. Jump into the coverage below.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Personal Brief", href: "#personal" },
                    { label: "Local Pulse", href: "#local" },
                    { label: "Global Desk", href: "#global" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="section-label border border-border px-3 py-2 text-muted-foreground transition hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="grid gap-0 text-sm text-muted-foreground">
                {[
                  "Personal feed drawn from calendar, inbox, and social signals",
                  "Local coverage tuned to location, weather, and community alerts",
                  "Global brief tailored to long-term interests and research goals",
                  "Each story verified across sources with action-ready takeaways",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border-b border-border py-2 last:border-0"
                  >
                    <span className="h-2 w-2 bg-foreground" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              {homeSections.map((section) => {
                const SectionIcon = sectionIconMap[section.id as keyof typeof sectionIconMap];
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
                      {section.articles.map((article) => (
                        <article
                          key={article.title}
                          onClick={() => setActiveArticle(article)}
                          className="group cursor-pointer py-4 transition lg:border-b lg:border-border lg:p-4 lg:odd:border-r lg:[&:nth-last-child(-n+2)]:border-b-0"
                        >
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              {article.images.map((image) => (
                                <div
                                  key={`${article.title}-${image.label}`}
                                  className={`relative h-28 overflow-hidden newspaper-border-thin bg-gradient-to-br ${image.tint} ${article.images.length === 1 ? "col-span-2" : ""
                                    }`}
                                >
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                                  <div className="caption relative z-10 flex h-full items-end p-2 uppercase tracking-[0.22em] text-muted-foreground">
                                    {image.label}
                                  </div>
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
                              <div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveArticle(article);
                                  }}
                                >
                                  Read full article
                                  <ArrowUpRight className="size-4" />
                                </Button>
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
                          <div className="mt-4 rounded-2xl border-2 border-emerald-500/30 bg-transparent p-4 shadow-sm">
                            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                              <Sparkles className="size-3 text-emerald-600" />
                              Action
                            </p>
                            <div className="mt-3 space-y-3 text-sm text-zinc-700 transition-colors group-hover:text-zinc-400">
                              <div>
                                <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500 transition-colors group-hover:text-zinc-400">
                                  Why it matters
                                </p>
                                <p className="mt-1">{article.relevance}</p>
                              </div>
                              <div>
                                <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500 transition-colors group-hover:text-zinc-400">
                                  Why act now
                                </p>
                                <p className="mt-1">{article.actionReason}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Link
                                onClick={(e) => e.stopPropagation()}
                                href={article.action.href}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
                              >
                                <ArrowRight className="size-4" />
                                {article.action.label}
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
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
            <section id="weather" className="newspaper-border p-4">
              <div className="space-y-4">
                <div>
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <CloudSun className="size-4 text-muted-foreground" />
                    {weatherPanel.title}
                  </p>
                  <h3 className="headline-secondary mt-2 text-2xl text-foreground">{weatherPanel.location}</h3>
                  <p className="article-body mt-2">{weatherPanel.summary}</p>
                </div>
                <div className="grid gap-0">
                  {weatherPanel.forecast.map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between border-b border-border py-3 text-sm last:border-0"
                    >
                      <div>
                        <p className="font-semibold">{item.day}</p>
                        <p className="text-xs text-muted-foreground">{item.note}</p>
                      </div>
                      <p className="font-semibold text-foreground">{item.temp}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border-2 border-emerald-500/30 bg-transparent p-4">
                  <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                    <Sparkles className="size-3 text-emerald-600" />
                    Action
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-zinc-700">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                        Why it matters
                      </p>
                      <p className="mt-1">{weatherPanel.relevance}</p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                        Why act now
                      </p>
                      <p className="mt-1">{weatherPanel.actionReason}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-black/15 bg-white/80 p-4">
                    <p className="text-sm font-medium text-zinc-800">
                      {weatherPanel.action.label}
                    </p>
                    <div className="mt-3">
                      <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link href={weatherPanel.action.href} target="_blank">
                          {weatherPanel.action.cta}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-b border-border" />

            <section id="stocks" className="newspaper-border p-4">
              <div className="space-y-3">
                <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  {stockPanel.title}
                </p>
                <div className="space-y-2">
                  {stockPanel.tickers.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="font-medium font-serif">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.change.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>
                          {item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="article-body mt-2 text-xs">{stockPanel.summary}</p>
                <div className="mt-3">
                  <Link
                    href={stockPanel.action.href}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 transition hover:text-emerald-600"
                  >
                    <ArrowRight className="size-3" />
                    {stockPanel.action.label}
                  </Link>
                </div>
              </div>
            </section>

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
