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
type Section = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  articles: Article[];
};

export const sections: Section[] = [
  {
    id: "personal",
    title: "Personal",
    subtitle: "Signals from your calendar, inbox, and subscriptions",
    accent: "from-zinc-200/50 via-zinc-100/30 to-transparent",
    articles: [
      {
        title: "UIUC Career Fair slots open for AI-focused teams",
        summary:
          "Your calendar highlights a university career fair next week with a dedicated AI and systems track. The CS department's employer list shows several companies you follow, including two that recently funded research in trustworthy ML. A new invite in your inbox includes a student-only resume workshop the night before, which lines up with your preferred time block. The fair's schedule has been extended to accommodate engineering demos, giving you extra time to meet teams. Registration closes Friday, and the waitlist historically fills within 24 hours. Your availability window is still free in the afternoon.",
        relevance:
          "You're in UIUC Engineering and the event aligns with your AI systems track and open calendar slots.",
        actionReason:
          "Early registration keeps your preferred interview block before the waitlist grows.",
        images: [
          {
            label: "Career fair hall",
            tint: "from-zinc-500/20 via-white/90 to-white",
          },
          {
            label: "Resume workshop",
            tint: "from-zinc-400/20 via-white/90 to-white",
          },
        ],
        sources: [
          { label: "UIUC Career Services", href: "https://www.careercenter.illinois.edu/" },
          { label: "CS Illinois", href: "https://cs.illinois.edu/" },
        ],
        action: {
          label: "Reserve a slot and upload your resume tonight.",
          cta: "RSVP",
          href: "https://www.careercenter.illinois.edu/",
        },
      },
      {
        title: "AI Hackathon announcement aligns with your GitHub activity",
        summary:
          "A campus hackathon just announced a theme on agentic tools and safety, matching the repositories you starred this month. The event schedule overlaps only with a light meeting day on your calendar. Your YouTube subscriptions show you recently watched MCP tutorials, which pairs well with the hackathon's workshop lineup. Past winners built similar pipeline tools for research labs, suggesting a strong fit for your interests. Organizers are offering a priority review for teams that apply early. Your inbox already has a teammate invite draft.",
        relevance:
          "Your recent GitHub stars and MCP tutorial activity mirror the hackathon theme.",
        actionReason:
          "Early applications get priority review and better workshop slots for teams.",
        images: [
          {
            label: "Hackathon briefing",
            tint: "from-zinc-600/20 via-white/90 to-white",
          },
          {
            label: "Team workspace",
            tint: "from-zinc-500/20 via-white/90 to-white",
          },
        ],
        sources: [
          { label: "Hackathon Page", href: "https://www.hackillinois.org/" },
          { label: "MCP Overview", href: "https://modelcontextprotocol.io/" },
        ],
        action: {
          label: "Invite your teammate and submit the early-bird application.",
          cta: "Start team",
          href: "https://www.hackillinois.org/",
        },
      }
    ],
  },
  {
    id: "local",
    title: "Local",
    subtitle: "What's happening around your city",
    accent: "from-zinc-200/50 via-zinc-100/30 to-transparent",
    articles: [
      {
        title: "Colder stretch arrives midweek with overnight lows",
        summary:
          "Local forecasts show a multi-day cold snap with temperatures dipping below freezing after sunset. Wind speeds are expected to rise, which will make evening commutes feel colder than the official low. The forecast window includes your usual campus commute hours and your weekend errands slot. Several stores are running winter gear promotions ahead of the drop. The next warm-up is projected for early next week, so the cold window is short but sharp. Planning ahead will reduce time spent outdoors during the coldest hours.",
        relevance:
          "Your commute window overlaps with the coldest hours in Urbana-Champaign this week.",
        actionReason:
          "Buying gear before the drop avoids higher prices and limited sizes.",
        images: [
          {
            label: "Windy streets",
            tint: "from-zinc-500/20 via-white/90 to-white",
          },
          {
            label: "Winter gear",
            tint: "from-zinc-400/20 via-white/90 to-white",
          },
        ],
        sources: [
          { label: "OpenWeather", href: "https://openweathermap.org/" },
          { label: "City Alerts", href: "https://www.cityofurbana.org/" },
        ],
        action: {
          label: "Pick up insulated boots before the temperature drop.",
          cta: "Shop boots",
          href: "https://www.nike.com/w/winter-boots-4iw0kzy7ok",
        },
      },
      {
        title: "Transit schedule update adds late-night routes",
        summary:
          "The local transit authority approved extended service on two routes that align with your usual evening schedule. This includes additional runs after 10 p.m. on weekdays, which can reduce reliance on rideshares. The update starts in three weeks, with a public feedback window open now. Students have asked for these changes due to late lab sessions and events. The authority is also testing real-time capacity updates in the rider app. Early feedback influences whether the expansion becomes permanent.",
        relevance:
          "Your calendar shows evening labs, and the new routes cover your return time.",
        actionReason:
          "Feedback now increases the chance the late routes stay permanent.",
        images: [
          {
            label: "Late bus route",
            tint: "from-zinc-500/20 via-white/90 to-white",
          },
        ],
        sources: [
          { label: "Transit Authority", href: "https://mtd.org/" },
          { label: "Public Feedback", href: "https://mtd.org/inside/community/" },
        ],
        action: {
          label: "Submit feedback to keep the late routes.",
          cta: "Send feedback",
          href: "https://mtd.org/inside/community/",
        },
      },
    ],
  },
  {
    id: "global",
    title: "National & Global",
    subtitle: "Broader signals tailored to your interests",
    accent: "from-zinc-200/50 via-zinc-100/30 to-transparent",
    articles: [
      {
        title: "New AI governance framework emphasizes provenance",
        summary:
          "A national policy update introduces clearer guidance on model provenance and dataset documentation. The framework recommends standardized reporting for fine-tuned models used in high-impact domains. Industry groups responded with a proposed checklist for compliance and public disclosure. Your saved topics include AI safety and policy, making this relevant to your reading list. Universities are already planning workshops to interpret the new guidance. The document is open for public comment for the next 30 days.",
        relevance:
          "Your saved interests include AI policy and trustworthy ML research.",
        actionReason:
          "Comment windows close in 30 days and shape future compliance needs.",
        images: [
          {
            label: "Policy briefing",
            tint: "from-zinc-500/20 via-white/90 to-white",
          },
          {
            label: "Research lab",
            tint: "from-zinc-400/20 via-white/90 to-white",
          },
        ],
        sources: [
          { label: "National AI Initiative", href: "https://www.ai.gov/" },
          { label: "NIST", href: "https://www.nist.gov/" },
        ],
        action: {
          label: "Review the checklist and share feedback.",
          cta: "Read the draft",
          href: "https://www.ai.gov/",
        },
      },
      {
        title: "Open-source security push expands SBOM expectations",
        summary:
          "Major platforms are encouraging software bill of materials adoption beyond regulated industries. Updated guidance suggests SBOMs should include transitive dependencies and build metadata for faster vulnerability response. Several open-source communities are adding automated checks in CI for this purpose. Your subscriptions include DevSecOps channels that flagged similar changes last month. Early adoption can reduce audit time and improve supply-chain transparency. Tooling support is growing across major package managers.",
        relevance:
          "You follow DevSecOps channels and ship open-source tools that could be audited.",
        actionReason:
          "Adopting SBOMs early reduces future compliance overhead and audit time.",
        images: [
          {
            label: "Dependency graph",
            tint: "from-zinc-500/20 via-white/90 to-white",
          },
          {
            label: "CI pipeline",
            tint: "from-zinc-400/20 via-white/90 to-white",
          },
        ],
        sources: [
          { label: "OpenSSF", href: "https://openssf.org/" },
          { label: "CISA", href: "https://www.cisa.gov/" },
        ],
        action: {
          label: "Audit your project and generate an SBOM.",
          cta: "See tools",
          href: "https://openssf.org/",
        },
      },
      {
        title: "Quantum computing milestones reach practical applications",
        summary:
          "Recent breakthroughs in quantum error correction and qubit stability have moved quantum computing closer to practical applications. Several research labs demonstrated fault-tolerant operations with logical qubits, reducing error rates significantly. Industry partnerships are forming to explore quantum algorithms for drug discovery and materials science. Your reading history includes quantum computing updates, making this highly relevant. Major tech companies are hosting workshops on quantum programming frameworks next month.",
        relevance:
          "Your saved interests include quantum computing and advanced computing architectures.",
        actionReason:
          "Early understanding of quantum programming frameworks can provide a competitive edge.",
        images: [
          {
            label: "Quantum lab",
            tint: "from-zinc-500/20 via-white/90 to-white",
          },
          {
            label: "Algorithm visualization",
            tint: "from-zinc-400/20 via-white/90 to-white",
          },
        ],
        sources: [
          { label: "Quantum Computing Report", href: "https://quantumcomputingreport.com/" },
          { label: "IBM Quantum", href: "https://quantum.ibm.com/" },
        ],
        action: {
          label: "Explore quantum programming tutorials and sign up for workshops.",
          cta: "Learn quantum",
          href: "https://quantum.ibm.com/",
        },
      },
    ],
  },
];

export const weatherPanel = {
  title: "Weather",
  location: "Chicago",
  summary: "Loading weather data...",
  forecast: [
    { day: "Today", temp: "—", note: "Loading..." },
    { day: "Tomorrow", temp: "—", note: "Loading..." },
    { day: "Later", temp: "—", note: "Loading..." },
  ],
  relevance: "Weather conditions for your location.",
  actionReason: "Plan your day based on current conditions.",
  action: {
    label: "View detailed forecast",
    cta: "See more",
    href: "https://openweathermap.org/",
  },
};

export const stockPanel = {
  title: "Stocks",
  summary: "Tech and AI infrastructure names rallied ahead of earnings week.",
  tickers: [
    { name: "MSFT", change: "+1.8%", note: "Azure momentum" },
    { name: "NVDA", change: "+2.6%", note: "AI demand" },
    { name: "AMZN", change: "+1.1%", note: "Cloud growth" },
  ],
  relevance: "Your watchlist includes AI infrastructure and developer tools.",
  actionReason: "Earnings calls next week may shift prices quickly.",
  action: {
    label: "Review your positions and set alerts before earnings.",
    cta: "Open watchlist",
    href: "https://finance.yahoo.com/",
  },
};
