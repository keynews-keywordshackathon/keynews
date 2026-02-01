"use client";

/**
 * NYTimes-Style Front Page Section Component
 * 
 * A reusable component that mimics the NYTimes front page layout with a two-column design:
 * - Left column (30%): 2-3 article titles, first article has a blurb
 * - Center column (70%): Featured image with article title and blurb
 * - Bottom row (spans full width): Two equal-width articles with images
 * 
 * @example
 * ```tsx
 * import { NytFrontSection } from "@/components/home/nyt-front-section";
 * import { nytSampleDataTitles } from "@/lib/home/nyt-sample-data";
 * 
 * <NytFrontSection {...nytSampleDataTitles} />
 * ```
 */

import Link from "next/link";
import type { NytFrontSectionProps } from "@/lib/home/nyt-types";

export function NytFrontSection({
  leftArticles,
  centerArticle,
  bottomArticles,
}: NytFrontSectionProps) {
  return (
    <div className="grid grid-cols-[30%_70%] gap-4 border-t border-b border-border py-6">
      {/* Left Column */}
      <div className="space-y-4">
        {leftArticles.map((article, index) => (
          <div
            key={index}
            className={index < leftArticles.length - 1 ? "border-b border-border pb-4" : ""}
          >
            {article.href ? (
              <Link href={article.href} className="group block">
                <h3 className="headline-secondary text-lg text-foreground transition-colors group-hover:text-zinc-500">
                  {article.title}
                </h3>
                {article.blurb && (
                  <p className="article-body mt-2 text-muted-foreground">{article.blurb}</p>
                )}
              </Link>
            ) : (
              <div>
                <h3 className="headline-secondary text-lg text-foreground">{article.title}</h3>
                {article.blurb && (
                  <p className="article-body mt-2 text-muted-foreground">{article.blurb}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center Column */}
      <div className="space-y-4">
        {centerArticle.image && (
          <div
            className={`relative h-64 overflow-hidden newspaper-border-thin bg-gradient-to-br ${
              centerArticle.image.tint || "from-zinc-500/20 via-white/90 to-white"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
            {centerArticle.image.label && (
              <div className="caption relative z-10 flex h-full items-end p-3 uppercase tracking-[0.22em] text-muted-foreground">
                {centerArticle.image.label}
              </div>
            )}
          </div>
        )}
        {centerArticle.href ? (
          <Link href={centerArticle.href} className="group block">
            <h2 className="headline-primary text-2xl text-foreground transition-colors group-hover:text-zinc-500">
              {centerArticle.title}
            </h2>
            {centerArticle.blurb && (
              <p className="article-body mt-3 text-muted-foreground">{centerArticle.blurb}</p>
            )}
          </Link>
        ) : (
          <div>
            <h2 className="headline-primary text-2xl text-foreground">{centerArticle.title}</h2>
            {centerArticle.blurb && (
              <p className="article-body mt-3 text-muted-foreground">{centerArticle.blurb}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row - spans full width */}
      <div className="col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-border">
        {bottomArticles.map((article, index) => (
          <div key={index} className="space-y-3">
            {article.image && (
              <div
                className={`relative h-40 overflow-hidden newspaper-border-thin bg-gradient-to-br ${
                  article.image.tint || "from-zinc-500/20 via-white/90 to-white"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                {article.image.label && (
                  <div className="caption relative z-10 flex h-full items-end p-2 uppercase tracking-[0.22em] text-muted-foreground">
                    {article.image.label}
                  </div>
                )}
              </div>
            )}
            {article.href ? (
              <Link href={article.href} className="group block">
                <h3 className="headline-secondary text-lg text-foreground transition-colors group-hover:text-zinc-500">
                  {article.title}
                </h3>
                {article.blurb && (
                  <p className="article-body mt-2 text-muted-foreground">{article.blurb}</p>
                )}
              </Link>
            ) : (
              <div>
                <h3 className="headline-secondary text-lg text-foreground">{article.title}</h3>
                {article.blurb && (
                  <p className="article-body mt-2 text-muted-foreground">{article.blurb}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
