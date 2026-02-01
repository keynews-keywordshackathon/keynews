"use client";

import {
  MapPin,
  Globe2,
  User,
  Newspaper,
  CloudSun,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { sections, weatherPanel, stockPanel } from "@/lib/home/sections";

const getPreviewText = (text: string, sentenceCount = 2) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, sentenceCount).join(" ");
};

const sectionIconMap = {
  personal: User,
  local: MapPin,
  global: Globe2,
};

export function HomePreview() {
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

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none paper-texture text-foreground">
      <header className="relative z-10 border-b border-foreground/20 bg-transparent">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-3 text-xs text-muted-foreground">
            <span className="dateline">Saturday, January 31, 2026</span>
            <span className="section-label">Today&apos;s Paper</span>
            <span className="dateline">S&amp;P 500 -0.43%</span>
          </div>
          <div className="grid items-center gap-4 py-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
              <span className="section-label">U.S.</span>
              <span className="section-label">International</span>
              <span className="section-label">Canada</span>
              <span className="section-label">Español</span>
              <span className="section-label">中文</span>
            </div>
            <div className="text-center">
              <h1 className="headline-masthead text-4xl text-foreground md:text-6xl">
                Keynews Daily
              </h1>
              <p className="section-label mt-2 text-muted-foreground">
                AI Newspaper · Personalized · Live
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
              <span className="dateline inline-flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                Urbana-Champaign
              </span>
              <span className="dateline inline-flex items-center gap-2">
                <Newspaper className="size-4 text-muted-foreground" />
                Edition 01
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 border-y border-border py-2 text-xs text-muted-foreground">
            {[
              { label: "Personal", href: "#personal" },
              { label: "Local", href: "#local" },
              { label: "Global", href: "#global" },
              { label: "Weather", href: "#weather" },
              { label: "Stocks", href: "#stocks" },
            ].map((item) => (
              <span key={item.label} className="section-label">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl space-y-4 px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <section className="newspaper-border grid gap-4 p-4 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-3">
                <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="size-4 text-muted-foreground" />
                  High-Level Agent Flow
                </p>
                <h2 className="headline-primary text-2xl text-foreground md:text-3xl">
                  Overview of personal, local, and global intelligence.
                </h2>
                <p className="article-body text-muted-foreground">
                  MCP signals, personal context, bias checks, and actionable recaps power each
                  section. Jump into the coverage below.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              {sections.slice(0, 2).map((section) => {
                const SectionIcon = sectionIconMap[section.id as keyof typeof sectionIconMap];
                return (
                  <div key={section.id} className="py-3">
                    <div className="mb-2 border-t border-b border-border" />
                    
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                          <SectionIcon className="size-4 text-muted-foreground" />
                          {section.title}
                        </p>
                        <h3 className="headline-primary mt-1 text-2xl text-foreground">{section.subtitle}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-y-0">
                      {section.articles.slice(0, 2).map((article) => {
                        const visibleImages = article.images.filter(
                          (image) => image.src && !failedImages.has(image.src)
                        );

                        return (
                          <article
                            key={article.title}
                            className="group py-4 transition lg:border-b lg:border-border lg:p-4 lg:odd:border-r lg:[&:nth-last-child(-n+2)]:border-b-0"
                          >
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                {visibleImages.map((image) => (
                                  <div
                                    key={`${article.title}-${image.label}`}
                                    className={`relative h-28 overflow-hidden newspaper-border-thin bg-gradient-to-br ${image.tint} ${
                                      visibleImages.length === 1 ? "col-span-2" : ""
                                    }`}
                                  >
                                    {image.src && (
                                      <img
                                        src={image.src}
                                        alt={image.label}
                                        className="absolute inset-0 h-full w-full object-cover"
                                        onError={() => markImageFailed(image.src)}
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                                    <div className="caption relative z-10 flex h-full items-end p-2 uppercase tracking-[0.22em] text-muted-foreground">
                                      {image.label}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            <div className="space-y-2">
                              <h4 className="headline-secondary text-lg text-foreground">{article.title}</h4>
                              <div className="relative">
                                <p className="article-body text-muted-foreground">
                                  {getPreviewText(article.summary)}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="section-label">
                                  Sources
                                </span>
                                {article.sources.map((source) => (
                                  <span
                                    key={source.href}
                                    className="newspaper-border-thin px-3 py-1"
                                  >
                                    {source.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 rounded-2xl border-2 border-emerald-500/30 bg-transparent p-4 shadow-sm">
                            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                              <Sparkles className="size-3 text-emerald-600" />
                              Action
                            </p>
                            <div className="mt-3 space-y-3 text-sm text-zinc-700">
                              <div>
                                <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                                  Why it matters
                                </p>
                                <p className="mt-1">{article.relevance}</p>
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
          </div>

          <aside className="space-y-4">
            <section className="newspaper-border p-4">
              <div className="space-y-4">
                <div>
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <CloudSun className="size-4 text-muted-foreground" />
                    {weatherPanel.title}
                  </p>
                  <h3 className="headline-secondary mt-2 text-2xl text-foreground">{weatherPanel.location}</h3>
                  <p className="article-body mt-2 text-muted-foreground">{weatherPanel.summary}</p>
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
              </div>
            </section>

            <div className="border-t border-b border-border" />

            <section className="newspaper-border p-4">
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
                <p className="article-body mt-2 text-xs text-muted-foreground">{stockPanel.summary}</p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
