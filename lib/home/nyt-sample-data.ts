import type { NytFrontSectionProps } from "./nyt-types";

// Sample data for the "titles" variant (4 article titles in right column)
export const nytSampleDataTitles: NytFrontSectionProps = {
  leftArticles: [
    {
      title: "Major Policy Shift Announced",
      blurb: "The administration revealed new guidelines that will affect millions of citizens across the country.",
      href: "#",
    },
    {
      title: "Tech Industry Responds to New Regulations",
      href: "#",
    },
    {
      title: "Local Elections Show Surprising Results",
      href: "#",
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
    href: "#",
  },
  rightVariant: "titles",
  rightArticles: [
    {
      title: "Market Closes Higher Amid Optimism",
      href: "#",
    },
    {
      title: "Sports: Championship Game Set for Sunday",
      href: "#",
    },
    {
      title: "Arts: New Exhibition Opens Downtown",
      href: "#",
    },
    {
      title: "Opinion: The Future of Urban Planning",
      href: "#",
    },
  ],
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
      href: "#",
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
      href: "#",
    },
  ],
};

// Sample data for the "image" variant (image + title + blurb in right column)
export const nytSampleDataImage: NytFrontSectionProps = {
  leftArticles: [
    {
      title: "Economic Forecast Shows Growth",
      blurb: "Analysts predict steady expansion over the next quarter, with key sectors leading the way.",
      href: "#",
    },
    {
      title: "Healthcare System Faces Challenges",
      href: "#",
    },
  ],
  centerArticle: {
    title: "Innovation in Renewable Energy",
    blurb: "Scientists announce breakthrough technology that could make solar power more efficient and affordable than ever before.",
    image: {
      src: "",
      alt: "Solar panels",
      label: "Renewable Energy",
      tint: "from-zinc-600/20 via-white/90 to-white",
    },
    href: "#",
  },
  rightVariant: "image",
  rightArticles: [
    {
      title: "Cultural Festival Draws Record Crowds",
      blurb: "This year's celebration brought together communities from across the region for a weekend of music, food, and art.",
      image: {
        src: "",
        alt: "Festival scene",
        label: "Festival",
        tint: "from-zinc-500/20 via-white/90 to-white",
      },
      href: "#",
    },
  ],
  bottomArticles: [
    {
      title: "Transportation Project Breaks Ground",
      blurb: "City officials break ground on a new transit line that will connect neighborhoods.",
      image: {
        src: "",
        alt: "Construction site",
        label: "Infrastructure",
        tint: "from-zinc-500/20 via-white/90 to-white",
      },
      href: "#",
    },
    {
      title: "Restaurant Scene Continues to Evolve",
      blurb: "Chefs experiment with new flavors and techniques, reshaping the local dining landscape.",
      image: {
        src: "",
        alt: "Restaurant interior",
        label: "Dining",
        tint: "from-zinc-400/20 via-white/90 to-white",
      },
      href: "#",
    },
  ],
};
