"use client";

import Link from "next/link";
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
import { sections, weatherPanel } from "@/lib/home/sections";

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
                                    className={`relative h-28 overflow-hidden newspaper-border-thin bg-gradient-to-br ${image.tint} ${visibleImages.length === 1 ? "col-span-2" : ""
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


          </aside>
        </div>
      </main>
    </div>
  );
}
