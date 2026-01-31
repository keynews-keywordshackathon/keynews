"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarDays,
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
import puzzleData from "@/lib/crossword/sample-puzzle.json";
import type { PuzzleData } from "@/lib/crossword/types";

const sections = [
  {
    id: "personal",
    title: "Personal",
    subtitle: "Signals from your calendar, inbox, and subscriptions",
    accent: "from-indigo-500/20 via-sky-500/10 to-transparent",
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
            tint: "from-indigo-500/30 via-white/85 to-white",
          },
          {
            label: "Resume workshop",
            tint: "from-sky-500/25 via-white/85 to-white",
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
            tint: "from-violet-500/30 via-white/85 to-white",
          },
          {
            label: "Team workspace",
            tint: "from-indigo-500/20 via-white/85 to-white",
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
      },
    ],
  },
  {
    id: "local",
    title: "Local",
    subtitle: "What’s happening around your city",
    accent: "from-emerald-500/20 via-lime-500/10 to-transparent",
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
            tint: "from-emerald-500/25 via-white/85 to-white",
          },
          {
            label: "Winter gear",
            tint: "from-lime-500/20 via-white/85 to-white",
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
            tint: "from-emerald-500/20 via-white/85 to-white",
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
    accent: "from-amber-500/20 via-rose-500/10 to-transparent",
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
            tint: "from-amber-500/25 via-white/85 to-white",
          },
          {
            label: "Research lab",
            tint: "from-rose-500/20 via-white/85 to-white",
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
            tint: "from-amber-500/20 via-white/85 to-white",
          },
          {
            label: "CI pipeline",
            tint: "from-rose-500/20 via-white/85 to-white",
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

  useEffect(() => {
    if (!activeArticle && !isCrosswordOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeArticle, isCrosswordOpen]);

  return (
    <div
      id="top"
      className="relative min-h-screen overflow-hidden bg-[#f6f4f0] text-zinc-900"
    >
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[30rem] w-[30rem] rounded-full bg-indigo-500/30 blur-3xl animate-[float_18s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[26rem] w-[26rem] rounded-full bg-amber-400/25 blur-3xl animate-[float_22s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_55%)]" />
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
                  <h3 className="mt-1 text-lg font-medium">{activeArticle.title}</h3>
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
                    <p className="text-xl leading-relaxed text-zinc-800">
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
                  <div className="rounded-2xl border-2 border-emerald-500/40 bg-white/30 p-5 shadow-[0_18px_40px_-35px_rgba(15,23,42,0.7)] backdrop-blur-xl">
                    <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-zinc-500">
                      Action
                    </p>
                    <div className="mt-3 space-y-3 text-sm text-zinc-700">
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
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
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

      <header className="relative z-10 border-b border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-600 shadow-sm">
              <Sparkles className="size-4 text-zinc-500" />
              AI Newspaper · Personalized · Live
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
                Keynews Daily
              </h1>
              <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
                A sleek, semi-transparent newsroom built for your signals, with bias-checked summaries and clear next steps.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2">
              <MapPin className="size-4 text-zinc-400" />
              Urbana-Champaign
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2">
              <CalendarDays className="size-4 text-zinc-400" />
              Saturday · 31 Jan
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2">
              <Newspaper className="size-4 text-zinc-400" />
              Edition 01
            </span>
          </div>
        </div>
      </header>

      {/* Stock ticker line - moves like NY Times */}
      <div className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-2">
          <div className="flex animate-marquee whitespace-nowrap">
            {stockPanel.tickers.map((item, index) => (
              <div key={item.name} className="mx-4 inline-flex items-center gap-2">
                <span className="font-medium">{item.name}</span>
                <span className={`font-medium ${item.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.change}
                </span>
                <span className="text-xs text-zinc-500">{item.note}</span>
                {index < stockPanel.tickers.length - 1 && (
                  <span className="text-zinc-300">·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <section className="grid gap-6 rounded-3xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl lg:grid-cols-[2fr_1fr]">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  <Sparkles className="size-4 text-zinc-400" />
                  High-Level Agent Flow
                </p>
                <h2 className="text-2xl font-semibold md:text-3xl">
                  Overview of personal, local, and global intelligence.
                </h2>
                <p className="text-base text-zinc-600">
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
                      className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-600 transition hover:-translate-y-0.5 hover:border-black/30"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 text-sm text-zinc-600">
                {[
                  "Personal feed drawn from calendar, inbox, and social signals",
                  "Local coverage tuned to location, weather, and community alerts",
                  "Global brief tailored to long-term interests and research goals",
                  "Each story verified across sources with action-ready takeaways",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm transition hover:-translate-y-0.5"
                  >
                    <span className="h-2 w-2 rounded-full bg-zinc-900" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              {sections.map((section) => {
                const SectionIcon = sectionIconMap[section.id as keyof typeof sectionIconMap];
                return (
                  <div
                    key={section.id}
                    id={section.id}
                    className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white/65 p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.6)] backdrop-blur-xl transition hover:-translate-y-1"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${section.accent}`}
                    />
                    <div className="relative z-10 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                            <SectionIcon className="size-4 text-zinc-400" />
                            {section.title}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold">{section.subtitle}</h3>
                        </div>
                        <Link
                          href="#top"
                          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 transition hover:text-zinc-900"
                        >
                          <ArrowUpRight className="size-4" />
                          Back to top
                        </Link>
                      </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      {section.articles.map((article) => (
                        <article
                          key={article.title}
                          className="rounded-2xl border border-white/30 bg-white/55 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl transition hover:-translate-y-0.5"
                        >
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              {article.images.map((image) => (
                                <div
                                  key={`${article.title}-${image.label}`}
                                  className={`relative h-28 overflow-hidden rounded-xl border border-black/10 bg-gradient-to-br ${image.tint} ${
                                    article.images.length === 1 ? "col-span-2" : ""
                                  }`}
                                >
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_70%)]" />
                                  <div className="relative z-10 flex h-full items-end p-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                                    {image.label}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-lg font-medium">{article.title}</h4>
                              <div className="relative">
                                <p className="text-sm leading-6 text-zinc-600">
                                  {getPreviewText(article.summary)}
                                </p>
                                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/75 to-transparent" />
                              </div>
                              <div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setActiveArticle(article)}
                                >
                                  Read full article
                                  <ArrowUpRight className="size-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                                <span className="font-medium uppercase tracking-[0.2em]">
                                  Sources
                                </span>
                                {article.sources.map((source) => (
                                  <Link
                                    key={source.href}
                                    href={source.href}
                                    className="rounded-full bg-white/80 px-3 py-1 transition hover:bg-white"
                                    target="_blank"
                                  >
                                    {source.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-zinc-900/5 via-white/80 to-white p-5 shadow-[0_18px_40px_-35px_rgba(15,23,42,0.7)]">
                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
                              Action
                            </p>
                            <div className="mt-3 space-y-3 text-sm text-zinc-700">
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
                            <div className="mt-4">
                              <Link
                                href={article.action.href}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition hover:text-emerald-500"
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
                  </div>
                );
              })}
            </section>

            <section className="rounded-3xl border border-black/10 bg-white/70 px-6 py-8 backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
                    Games
                  </p>
                  <h3 className="text-2xl font-medium">Daily Crossword</h3>
                  <p className="text-sm text-zinc-600">
                    Keep focus sharp with a quick puzzle tailored to your brief.
                  </p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setIsCrosswordOpen(true)}>
                  <Gamepad2 className="size-4" />
                  Open crossword
                </Button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-white/85 to-white p-5">
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                    <Gamepad2 className="size-4 text-zinc-400" />
                    Today&apos;s Game
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    15×15 grid with checks, reveals, and autosave.
                  </p>
                  <div className="mt-4">
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
                <div className="rounded-2xl border border-black/10 bg-white/80 p-5">
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
                    <TrendingUp className="size-4 text-zinc-400" />
                    Progress
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    Timer control, quick checks, and clue navigation are ready.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-black/10 bg-white/70 px-6 py-8 backdrop-blur-xl">
              <div className="grid gap-6 lg:grid-cols-[1.5fr_2fr] lg:items-center">
                <div className="space-y-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                    <Sparkles className="size-4 text-zinc-400" />
                    Personalized Actions
                  </p>
                  <h3 className="text-2xl font-semibold">Next moves, already queued.</h3>
                  <p className="text-sm text-zinc-600">
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
                      className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5"
                    >
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="mt-2 text-sm text-zinc-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-black/10 bg-white/70 p-5 backdrop-blur-xl">
              <div className="space-y-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                    <CloudSun className="size-4 text-zinc-400" />
                    {weatherPanel.title}
                  </p>
                  <h3 className="mt-2 text-xl font-medium">{weatherPanel.location}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{weatherPanel.summary}</p>
                </div>
                <div className="grid gap-3">
                  {weatherPanel.forecast.map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{item.day}</p>
                        <p className="text-xs text-zinc-500">{item.note}</p>
                      </div>
                      <p className="font-semibold text-zinc-700">{item.temp}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-sky-500/10 via-white/85 to-white p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">
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
                      <Button asChild size="sm">
                        <Link href={weatherPanel.action.href} target="_blank">
                          {weatherPanel.action.cta}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-2xl bg-white/60 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                    <Bot className="size-4 text-zinc-400" />
                    AI Assistant
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
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
