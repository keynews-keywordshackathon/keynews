"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CloudSun,
  Gamepad2,
  Globe2,
  MapPin,
  Newspaper,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { CrosswordGame } from "@/components/crossword/crossword-game";
import { ConnectionsGame } from "@/components/connections/ConnectionsGame";
import puzzleData from "@/lib/crossword/sample-puzzle.json";
import type { PuzzleData } from "@/lib/crossword/types";
import type { Puzzle } from "@/lib/connections/types";

const sections = [
  {
    id: "personal",
    title: "Personal",
    subtitle: "Signals from your calendar, inbox, and subscriptions",
    accent: "from-zinc-200/50 via-zinc-100/30 to-transparent",
    articles: [
      {
        title: "UIUC Career Fair slots open for AI-focused teams",
        summary:
          "Your calendar highlights a university career fair next week with a dedicated AI and systems track. The CS department’s employer list shows several companies you follow, including two that recently funded research in trustworthy ML. A new invite in your inbox includes a student-only resume workshop the night before, which lines up with your preferred time block. The fair’s schedule has been extended to accommodate engineering demos, giving you extra time to meet teams. Registration closes Friday, and the waitlist historically fills within 24 hours. Your availability window is still free in the afternoon.",
        relevance:
          "You’re in UIUC Engineering and the event aligns with your AI systems track and open calendar slots.",
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
          "A campus hackathon just announced a theme on agentic tools and safety, matching the repositories you starred this month. The event schedule overlaps only with a light meeting day on your calendar. Your YouTube subscriptions show you recently watched MCP tutorials, which pairs well with the hackathon’s workshop lineup. Past winners built similar pipeline tools for research labs, suggesting a strong fit for your interests. Organizers are offering a priority review for teams that apply early. Your inbox already has a teammate invite draft.",
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
    subtitle: "What’s happening around your city",
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

const weatherPanel = {
  title: "Weather",
  location: "Urbana-Champaign",
  summary: "Snow arrives Thursday night with sub-freezing lows through Saturday morning.",
  forecast: [
    { day: "Thu", temp: "28° / 18°", note: "Snow after 9 PM" },
    { day: "Fri", temp: "24° / 14°", note: "Windy, icy" },
    { day: "Sat", temp: "30° / 20°", note: "Flurries" },
  ],
  relevance: "Your morning commute overlaps with the lowest temperatures this week.",
  actionReason: "Buying boots before the storm avoids low inventory and delivery delays.",
  action: {
    label: "Grab insulated boots and traction grips today.",
    cta: "Shop boots",
    href: "https://www.nike.com/w/winter-boots-4iw0kzy7ok",
  },
};

const stockPanel = {
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

const getPreviewText = (text: string, sentenceCount = 2) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, sentenceCount).join(" ");
};

const sectionIconMap = {
  personal: User,
  local: MapPin,
  global: Globe2,
};

export default function Home() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<
    (typeof sections)[number]["articles"][number] | null
  >(null);
  const [isCrosswordOpen, setIsCrosswordOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [connectionsPuzzle, setConnectionsPuzzle] = useState<Puzzle | null>(null);

  useEffect(() => {
    if (!activeArticle && !isCrosswordOpen && !isConnectionsOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeArticle, isCrosswordOpen, isConnectionsOpen]);

  useEffect(() => {
    if (!isConnectionsOpen || connectionsPuzzle) return;

    let isActive = true;

    fetch("/daily-puzzle.json")
      .then((response) => response.json())
      .then((data) => {
        if (isActive) {
          setConnectionsPuzzle(data as Puzzle);
        }
      })
      .catch(() => {
        if (isActive) {
          setConnectionsPuzzle({ id: "fallback", groups: [] });
        }
      });

    return () => {
      isActive = false;
    };
  }, [isConnectionsOpen, connectionsPuzzle]);

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-hidden paper-texture text-foreground"
    >
      <div className="pointer-events-none absolute inset-0" />
      <div
        className={`fixed inset-0 z-40 ${
          isAssistantOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${
            isAssistantOpen ? "opacity-80" : "opacity-0"
          }`}
          onClick={() => setIsAssistantOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white/90 backdrop-blur-xl shadow-2xl transition-transform duration-300 ${
            isAssistantOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                  AI Assistant
                </p>
                <h3 className="mt-1 text-lg font-medium">News sidekick</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsAssistantOpen(false)}>
                Retract
              </Button>
            </div>
            <div className="flex-1 overflow-hidden px-6 py-4">
              <div className="flex h-full flex-col gap-4 overflow-y-auto custom-scrollbar">
                <div className="max-w-[85%] rounded-2xl bg-white/80 px-4 py-3 text-sm text-zinc-700 shadow-sm">
                  Morning! Want a quick summary or deeper context on any story?
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-sm">
                  Summarize the personal brief and suggest follow-ups.
                </div>
                <div className="max-w-[85%] rounded-2xl bg-white/80 px-4 py-3 text-sm text-zinc-700 shadow-sm">
                  Your personal brief highlights the UIUC career fair opening, with registration
                  closing Friday. I can pull related company profiles or add a reminder. Which
                  follow-up do you want?
                </div>
              </div>
            </div>
            <div className="border-t border-black/5 px-6 py-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <input
                  type="text"
                  placeholder="Ask about today's coverage..."
                  className="flex-1 bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none"
                />
                <Button size="sm">Send</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white/20 backdrop-blur-md"
              onClick={() => setActiveArticle(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.4 
              }}
              className="relative w-[80vw] max-w-[80vw] overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/40 via-white/25 to-white/15 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.75)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                    Full Story
                  </p>
                  <h3 className="mt-1 text-2xl font-bold font-serif text-black">{activeArticle.title}</h3>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setActiveArticle(null)}>
                  Close
                </Button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto px-8 py-8 custom-scrollbar">
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-4">
                    {activeArticle.images.map((image) => (
                      <div
                        key={`${activeArticle.title}-${image.label}`}
                        className={`relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br ${image.tint} ${
                          activeArticle.images.length === 1 ? "col-span-2" : ""
                        }`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                        <div className="relative z-10 flex h-full items-end p-4 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                          {image.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <p className="text-xl leading-relaxed text-zinc-800 font-serif">
                      {activeArticle.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                      <span className="font-medium uppercase tracking-[0.2em]">Sources</span>
                      {activeArticle.sources.map((source) => (
                        <Link
                          key={source.href}
                          href={source.href}
                          className="rounded-full bg-white/50 px-3 py-1 transition hover:bg-white/70"
                          target="_blank"
                        >
                          {source.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-emerald-500/30 bg-transparent p-5 shadow-[0_18px_40px_-35px_rgba(15,23,42,0.7)] backdrop-blur-xl">
                    <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                      <Sparkles className="size-3 text-emerald-600" />
                      Action
                    </p>
                    <div className="mt-4 space-y-4 text-sm text-zinc-700">
                      <div>
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                          Why it matters
                        </p>
                        <p className="mt-1">{activeArticle.relevance}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500">
                          Why act now
                        </p>
                        <p className="mt-1">{activeArticle.actionReason}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={activeArticle.action.href}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
                      >
                        <ArrowRight className="size-4" />
                        {activeArticle.action.label}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCrosswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white/20 backdrop-blur-md"
              onClick={() => setIsCrosswordOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 280,
                duration: 0.4,
              }}
              className="relative w-[92vw] max-w-[1200px] overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/40 via-white/25 to-white/15 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.75)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                    <Gamepad2 className="size-4 text-zinc-400" />
                    Games
                  </p>
                  <h3 className="mt-1 text-lg font-medium">Daily Crossword</h3>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setIsCrosswordOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto px-6 py-6 custom-scrollbar">
                <CrosswordGame puzzle={puzzleData as PuzzleData} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isConnectionsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white/20 backdrop-blur-md"
              onClick={() => setIsConnectionsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 280,
                duration: 0.4,
              }}
              className="relative w-[92vw] max-w-[1200px] overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/40 via-white/25 to-white/15 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.75)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                    <Gamepad2 className="size-4 text-zinc-400" />
                    Games
                  </p>
                  <h3 className="mt-1 text-lg font-medium">Connections</h3>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setIsConnectionsOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="max-h-[80vh] overflow-y-auto px-6 py-6 custom-scrollbar">
                {connectionsPuzzle ? (
                  <ConnectionsGame puzzle={connectionsPuzzle} />
                ) : (
                  <div className="text-sm text-zinc-600">Loading connections...</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl space-y-4 px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <section id="agent-flow" className="newspaper-border grid gap-4 p-4 lg:grid-cols-[2fr_1fr]">
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
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Personal Brief", href: "#personal" },
                    { label: "Local Pulse", href: "#local" },
                    { label: "Global Desk", href: "#global" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="section-label border border-border px-3 py-2 text-muted-foreground transition hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="grid gap-0 text-sm text-muted-foreground">
                {[
                  "Personal feed drawn from calendar, inbox, and social signals",
                  "Local coverage tuned to location, weather, and community alerts",
                  "Global brief tailored to long-term interests and research goals",
                  "Each story verified across sources with action-ready takeaways",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border-b border-border py-2 last:border-0"
                  >
                    <span className="h-2 w-2 bg-foreground" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              {sections.map((section) => {
                const SectionIcon = sectionIconMap[section.id as keyof typeof sectionIconMap];
                return (
                  <div key={section.id} id={section.id} className="py-3">
                    <div className="mb-2 border-t border-b border-border" />
                    
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                          <SectionIcon className="size-4 text-muted-foreground" />
                          {section.title}
                        </p>
                        <h3 className="headline-primary mt-1 text-2xl text-foreground">{section.subtitle}</h3>
                      </div>
                      <Link
                        href="#top"
                        className="section-label inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                      >
                        <ArrowUpRight className="size-4" />
                        Back to top
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-y-0">
                      {section.articles.map((article) => (
                        <article
                          key={article.title}
                          onClick={() => setActiveArticle(article)}
                          className="group cursor-pointer py-4 transition lg:border-b lg:border-border lg:p-4 lg:odd:border-r lg:[&:nth-last-child(-n+2)]:border-b-0"
                        >
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              {article.images.map((image) => (
                                <div
                                  key={`${article.title}-${image.label}`}
                                  className={`relative h-28 overflow-hidden newspaper-border-thin bg-gradient-to-br ${image.tint} ${
                                    article.images.length === 1 ? "col-span-2" : ""
                                  }`}
                                >
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                                  <div className="caption relative z-10 flex h-full items-end p-2 uppercase tracking-[0.22em] text-muted-foreground">
                                    {image.label}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <h4 className="headline-secondary text-lg text-foreground transition-colors group-hover:text-zinc-500">{article.title}</h4>
                              <div className="relative">
                                <p className="article-body text-muted-foreground transition-colors group-hover:text-zinc-400">
                                  {getPreviewText(article.summary)}
                                </p>
                              </div>
                              <div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveArticle(article);
                                  }}
                                >
                                  Read full article
                                  <ArrowUpRight className="size-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="section-label">
                                  Sources
                                </span>
                                {article.sources.map((source) => (
                                  <Link
                                    key={source.href}
                                    onClick={(e) => e.stopPropagation()}
                                    href={source.href}
                                    className="newspaper-border-thin px-3 py-1 transition hover:bg-black/5"
                                    target="_blank"
                                  >
                                    {source.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 rounded-2xl border-2 border-emerald-500/30 bg-transparent p-4 shadow-sm">
                            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                              <Sparkles className="size-3 text-emerald-600" />
                              Action
                            </p>
                            <div className="mt-3 space-y-3 text-sm text-zinc-700 transition-colors group-hover:text-zinc-400">
                              <div>
                                <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500 transition-colors group-hover:text-zinc-400">
                                  Why it matters
                                </p>
                                <p className="mt-1">{article.relevance}</p>
                              </div>
                              <div>
                                <p className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-zinc-500 transition-colors group-hover:text-zinc-400">
                                  Why act now
                                </p>
                                <p className="mt-1">{article.actionReason}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Link
                                onClick={(e) => e.stopPropagation()}
                                href={article.action.href}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
                              >
                                <ArrowRight className="size-4" />
                                {article.action.label}
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            <section id="games" className="py-3">
              <div className="mb-2 border-t border-b border-border" />
              <div className="mb-2 flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-2">
                  <p className="section-label text-muted-foreground">
                    Games
                  </p>
                  <h3 className="headline-primary text-2xl text-foreground">Daily Games</h3>
                  <p className="article-body text-muted-foreground">
                    Keep focus sharp with a quick puzzle tailored to your brief.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" className="gap-2" onClick={() => setIsCrosswordOpen(true)}>
                    <Gamepad2 className="size-4" />
                    Open crossword
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2" onClick={() => setIsConnectionsOpen(true)}>
                    <Gamepad2 className="size-4" />
                    Open connections
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="newspaper-border-thin p-4">
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <Gamepad2 className="size-4 text-muted-foreground" />
                    Today&apos;s Game
                  </p>
                  <p className="article-body mt-2 text-muted-foreground">
                    15×15 grid with checks, reveals, and autosave.
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => setIsCrosswordOpen(true)}
                    >
                      <Gamepad2 className="size-4" />
                      Play now
                    </Button>
                  </div>
                </div>
                <div className="newspaper-border-thin p-4">
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <Gamepad2 className="size-4 text-muted-foreground" />
                    Connections
                  </p>
                  <p className="article-body mt-2 text-muted-foreground">
                    Group 16 words into four linked categories.
                  </p>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2"
                      onClick={() => setIsConnectionsOpen(true)}
                    >
                      <Gamepad2 className="size-4" />
                      Play now
                    </Button>
                  </div>
                </div>
                <div className="newspaper-border-thin p-4">
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="size-4 text-muted-foreground" />
                    Progress
                  </p>
                  <p className="article-body mt-2 text-muted-foreground">
                    Timer control, quick checks, and clue navigation are ready.
                  </p>
                </div>
              </div>
            </section>

            <section id="actions" className="py-3">
              <div className="mb-2 border-t border-b border-border" />
              <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr] lg:items-center">
                <div className="space-y-2">
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="size-4 text-muted-foreground" />
                    Personalized Actions
                  </p>
                  <h3 className="headline-primary text-2xl text-foreground">Next moves, already queued.</h3>
                  <p className="article-body text-muted-foreground">
                    Your homepage stays ready for contextual follow-ups like chat threads,
                    puzzle drops, and quick replies when breaking news changes.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Fact-check queue",
                      description:
                        "Flag any story for deeper verification with multiple sources and bias checks.",
                    },
                    {
                      title: "Daily brief export",
                      description:
                        "Send a polished digest to email, Slack, or calendar notes in one tap.",
                    },
                    {
                      title: "Puzzle refresh",
                      description:
                        "Generate new crossword or connections based on your trending keywords.",
                    },
                    {
                      title: "Smart follow-ups",
                      description:
                        "Ask a question and update the relevant story cards instantly.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="newspaper-border-thin p-3 transition hover:bg-black/5"
                    >
                      <h4 className="headline-secondary text-sm text-foreground">{item.title}</h4>
                      <p className="article-body mt-1 text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section id="weather" className="newspaper-border p-4">
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
                <div className="rounded-2xl border-2 border-emerald-500/30 bg-transparent p-4">
                  <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                    <Sparkles className="size-3 text-emerald-600" />
                    Action
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-zinc-700">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                        Why it matters
                      </p>
                      <p className="mt-1">{weatherPanel.relevance}</p>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                        Why act now
                      </p>
                      <p className="mt-1">{weatherPanel.actionReason}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-black/15 bg-white/80 p-4">
                    <p className="text-sm font-medium text-zinc-800">
                      {weatherPanel.action.label}
                    </p>
                    <div className="mt-3">
                      <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link href={weatherPanel.action.href} target="_blank">
                          {weatherPanel.action.cta}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-b border-border" />

            <section id="stocks" className="newspaper-border p-4">
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
                 <div className="mt-3">
                    <Link
                      href={stockPanel.action.href}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 transition hover:text-emerald-600"
                    >
                      <ArrowRight className="size-3" />
                      {stockPanel.action.label}
                    </Link>
                  </div>
              </div>
            </section>

            <div className="newspaper-border-thin bg-transparent p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-label inline-flex items-center gap-2 text-muted-foreground">
                    <Bot className="size-4 text-muted-foreground" />
                    AI Assistant
                  </p>
                  <p className="article-body mt-1 text-muted-foreground">
                    Open the assistant for quick analysis.
                  </p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setIsAssistantOpen(true)}>
                  <Bot className="size-4" />
                  Open
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
