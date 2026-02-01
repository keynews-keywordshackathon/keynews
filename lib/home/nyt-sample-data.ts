import type { NytFrontSectionProps } from "./nyt-types";

// Sample data for demonstration purposes
// Note: In the actual app, the NytFrontSection uses data transformed from
// the sections in lib/home/sections.ts with originalArticle references
// to enable click-to-open article modals.

export const nytSampleData: Omit<NytFrontSectionProps, 'onArticleClick'> = {
  leftArticles: [
    {
      title: "Major Policy Shift Announced",
      blurb: "The administration revealed new guidelines that will affect millions of citizens across the country.",
    },
    {
      title: "Tech Industry Responds to New Regulations",
    },
    {
      title: "Local Elections Show Surprising Results",
    },
  ],
  centerArticle: {
    title: "Breaking: Historic Agreement Reached",
    blurb: "After months of negotiations, world leaders have come to a consensus on climate action that could reshape global policy for decades.",
    image: {
      src: "",
      alt: "World leaders at summit",
      label: "Climate Summit",
      tint: "from-zinc-500/20 via-white/90 to-white",
    },
  },
  bottomArticles: [
    {
      title: "Local Community Center Opens",
      blurb: "Residents celebrate the grand opening of a new facility that will serve thousands.",
      image: {
        src: "",
        alt: "Community center",
        label: "Community",
        tint: "from-zinc-400/20 via-white/90 to-white",
      },
    },
    {
      title: "Education Reform Bill Advances",
      blurb: "Legislators move forward with proposals that could transform the school system.",
      image: {
        src: "",
        alt: "Education reform",
        label: "Education",
        tint: "from-zinc-500/20 via-white/90 to-white",
      },
    },
  ],
};
