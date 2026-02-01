"use client";

/**
 * NYTimes-Style Front Page Section Component
 * 
 * A reusable component that mimics the NYTimes front page layout with a two-column design:
 * - Left column (30%): 2-3 article titles, first article has a blurb and action
 * - Center column (70%): Featured image with article title, blurb, and action
 * - Bottom row (spans full width): Two equal-width articles with images and actions
 * 
 * @example
 * ```tsx
 * import { NytFrontSection } from "@/components/home/nyt-front-section";
 * 
 * <NytFrontSection 
 *   {...nytData} 
 *   onArticleClick={(article) => setActiveArticle(article)} 
 * />
 * ```
 */

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { NytFrontSectionProps, NytArticle, OriginalArticle } from "@/lib/home/nyt-types";

// Action link with hover card showing relevance details
function ActionLink({ article }: { article: OriginalArticle }) {
  return (
    <div className="relative group/action inline-block">
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
  );
}

export function NytFrontSection({
  leftArticles,
  centerArticle,
  bottomArticles,
  onArticleClick,
}: NytFrontSectionProps) {
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

  const handleClick = (article: NytArticle) => {
    if (article.originalArticle && onArticleClick) {
      onArticleClick(article.originalArticle);
    }
  };

  return (
    <div className="grid grid-cols-[30%_70%] gap-4 border-t border-border py-6">
      {/* Left Column */}
      <div className="space-y-4">
        {leftArticles.map((article, index) => (
          <div
            key={index}
            className={`${index < leftArticles.length - 1 ? "border-b border-border pb-4" : ""}`}
          >
            <div
              className="group cursor-pointer"
              onClick={() => handleClick(article)}
            >
              <h3 className="headline-secondary text-lg text-foreground transition-colors group-hover:text-zinc-500">
                {article.title}
              </h3>
              {article.blurb && (
                <p className="article-body mt-2 text-muted-foreground transition-colors group-hover:text-zinc-400">
                  {article.blurb}
                </p>
              )}
            </div>
            {article.originalArticle && (
              <div className="mt-3">
                <ActionLink article={article.originalArticle} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center Column */}
      <div className="space-y-4">
        <div 
          className="group cursor-pointer"
          onClick={() => handleClick(centerArticle)}
        >
          {centerArticle.image && !(centerArticle.image.src && failedImages.has(centerArticle.image.src)) && (
            <div>
              <div
                className={`relative h-64 overflow-hidden newspaper-border-thin bg-gradient-to-br ${
                  centerArticle.image.tint || "from-zinc-500/20 via-white/90 to-white"
                }`}
              >
                <img
                  src={centerArticle.image.src}
                  alt={centerArticle.image.alt || centerArticle.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => markImageFailed(centerArticle.image?.src)}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
              </div>
              {centerArticle.image.label && (
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {centerArticle.image.label}
                </p>
              )}
            </div>
          )}
          <h2 className="headline-primary text-2xl text-foreground transition-colors group-hover:text-zinc-500 mt-4">
            {centerArticle.title}
          </h2>
          {centerArticle.blurb && (
            <p className="article-body mt-3 text-muted-foreground transition-colors group-hover:text-zinc-400">
              {centerArticle.blurb}
            </p>
          )}
        </div>
        
        {/* Action for Center Article */}
        {centerArticle.originalArticle && (
          <div className="mt-4">
            <ActionLink article={centerArticle.originalArticle} />
          </div>
        )}
      </div>

      {/* Bottom Row - spans full width */}
      <div className="col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-border">
        {bottomArticles.map((article, index) => (
          <div 
            key={index} 
            className="space-y-3"
          >
            <div
              className="group cursor-pointer"
              onClick={() => handleClick(article)}
            >
              {article.image && !(article.image.src && failedImages.has(article.image.src)) && (
                <div>
                  <div
                    className={`relative h-40 overflow-hidden newspaper-border-thin bg-gradient-to-br ${
                      article.image.tint || "from-zinc-500/20 via-white/90 to-white"
                    }`}
                  >
                    <img
                      src={article.image.src}
                      alt={article.image.alt || article.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={() => markImageFailed(article.image?.src)}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                  </div>
                  {article.image.label && (
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      {article.image.label}
                    </p>
                  )}
                </div>
              )}
              <h3 className="headline-secondary text-lg text-foreground transition-colors group-hover:text-zinc-500 mt-3">
                {article.title}
              </h3>
              {article.blurb && (
                <p className="article-body mt-2 text-muted-foreground transition-colors group-hover:text-zinc-400">
                  {article.blurb}
                </p>
              )}
            </div>
            {article.originalArticle && (
              <div className="mt-3">
                <ActionLink article={article.originalArticle} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
