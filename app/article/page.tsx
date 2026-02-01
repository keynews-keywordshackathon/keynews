"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";

type ArticleImage = { label: string; tint: string; src?: string };
type ArticleSource = { label: string; href: string };
type ArticleAction = { label: string; cta: string; href: string };
type Article = {
  title: string;
  summary: string;
  relevance: string;
  actionReason: string;
  images: ArticleImage[];
  sources: ArticleSource[];
  action: ArticleAction;
};

function readArticle(key: string | null): Article | null {
  if (!key) return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function ArticlePage() {
  const searchParams = useSearchParams();
  const [article] = useState<Article | null>(() => readArticle(searchParams.get("id")));
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

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="article-body text-muted-foreground">Article not found.</p>
      </div>
    );
  }

  const visibleImages = article.images.filter(
    (image) => image.src && !failedImages.has(image.src)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to front page
            </Link>
            <h1 className="headline-masthead text-2xl leading-none text-foreground md:text-4xl">
              The Keywords Times
            </h1>
            <div className="w-[140px]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <article className="space-y-10">
          <div>
            <p className="section-label text-muted-foreground">Full Story</p>
            <h2 className="headline-primary mt-2 text-3xl text-foreground md:text-5xl">
              {article.title}
            </h2>
          </div>

          {visibleImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {visibleImages.map((image) => (
                <div
                  key={`${article.title}-${image.label}`}
                  className={`${visibleImages.length === 1 ? "col-span-2" : ""}`}
                >
                  <div className={`relative h-56 overflow-hidden newspaper-border-thin bg-gradient-to-br ${image.tint}`}>
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
          )}

          <div className="space-y-6">
            <p className="article-body font-serif text-xl leading-relaxed">
              {article.summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="section-label">Sources</span>
              {article.sources.map((source) => (
                <Link
                  key={source.href}
                  href={source.href}
                  className="newspaper-border-thin px-3 py-1 transition hover:bg-black/5"
                  target="_blank"
                >
                  {source.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="relative group/action inline-block">
              <Link
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
          </div>
        </article>
      </main>
    </div>
  );
}
