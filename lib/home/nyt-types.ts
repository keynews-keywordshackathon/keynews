// Original article type from sections
export type OriginalArticle = {
  title: string;
  summary: string;
  relevance: string;
  actionReason: string;
  images: { label: string; tint: string }[];
  sources: { label: string; href: string }[];
  action: { label: string; cta: string; href: string };
};

export interface NytArticle {
  title: string;
  blurb?: string; // Optional - only some articles have blurbs
  image?: { src: string; alt: string; label?: string; tint?: string };
  originalArticle?: OriginalArticle; // Reference to the original article for click handling
}

export interface NytFrontSectionProps {
  leftArticles: NytArticle[]; // 2-3 articles, first has blurb
  centerArticle: NytArticle; // Has image, title, blurb
  bottomArticles: [NytArticle, NytArticle]; // Exactly 2 articles
  onArticleClick?: (article: OriginalArticle) => void; // Callback when article is clicked
}
