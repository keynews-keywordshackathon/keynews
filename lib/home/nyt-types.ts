export interface NytArticle {
  title: string;
  blurb?: string; // Optional - only some articles have blurbs
  image?: { src: string; alt: string; label?: string; tint?: string };
  href?: string;
}

export interface NytFrontSectionProps {
  leftArticles: NytArticle[]; // 2-3 articles, first has blurb
  centerArticle: NytArticle; // Has image, title, blurb
  bottomArticles: [NytArticle, NytArticle]; // Exactly 2 articles
}
