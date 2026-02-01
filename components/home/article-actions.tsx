"use client";

import Link from "next/link";
import { CalendarPlus, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createArticleEmailDraft, createArticleCalendarEvent } from "@/actions/composio";

interface ArticleForActions {
  title: string;
  summary: string;
  relevance: string;
  actionReason: string;
  action: { label: string; cta: string; href: string };
  sources?: { label: string; href: string }[];
}

const EMAIL_KEYWORDS = ["rsvp", "invite", "feedback", "submit", "sign up", "register", "send"];
const CALENDAR_KEYWORDS = ["rsvp", "register", "sign up", "reserve", "deadline", "slot", "workshop", "fair", "hackathon", "conference"];

function isEmailWorthy(article: ArticleForActions): boolean {
  const text = `${article.action.label ?? ""} ${article.action.cta ?? ""} ${article.actionReason ?? ""}`.toLowerCase();
  return EMAIL_KEYWORDS.some((kw) => text.includes(kw));
}

function isCalendarWorthy(article: ArticleForActions): boolean {
  const text = `${article.title ?? ""} ${article.action.label ?? ""} ${article.action.cta ?? ""} ${article.actionReason ?? ""}`.toLowerCase();
  return CALENDAR_KEYWORDS.some((kw) => text.includes(kw));
}

export function ArticleActions({ article }: { article: ArticleForActions }) {
  const [draftStatus, setDraftStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [calendarStatus, setCalendarStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [calendarError, setCalendarError] = useState<string | null>(null);

  if (!article.action) return null;

  const showEmail = isEmailWorthy(article);
  const showCalendar = isCalendarWorthy(article);

  if (!showEmail && !showCalendar) return null;

  const handleDraftEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftStatus("loading");
    setDraftError(null);
    try {
      const result = await createArticleEmailDraft({
        title: article.title,
        summary: article.summary,
        relevance: article.relevance,
        actionReason: article.actionReason,
        action: article.action,
        sources: article.sources || [],
      });
      if (result.success) {
        setDraftStatus("success");
      } else {
        setDraftStatus("error");
        setDraftError(result.error || "Failed to create draft");
      }
    } catch {
      setDraftStatus("error");
      setDraftError("Failed to create draft");
    }
  };

  const handleAddToCalendar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarStatus("loading");
    setCalendarError(null);
    try {
      const result = await createArticleCalendarEvent({
        title: article.title,
        summary: article.summary,
        relevance: article.relevance,
        actionReason: article.actionReason,
        action: article.action,
      });
      if (result.success) {
        setCalendarStatus("success");
      } else {
        setCalendarStatus("error");
        setCalendarError(result.error || "Failed to create event");
      }
    } catch {
      setCalendarStatus("error");
      setCalendarError("Failed to create event");
    }
  };

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap items-center gap-2">
        {showEmail && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-2"
            disabled={draftStatus === "loading" || draftStatus === "success"}
            onClick={handleDraftEmail}
          >
            <Mail className="size-4" />
            {draftStatus === "idle" && "Draft email"}
            {draftStatus === "loading" && "Creating draft..."}
            {draftStatus === "success" && "Draft created"}
            {draftStatus === "error" && "Retry draft"}
          </Button>
        )}
        {showCalendar && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-2"
            disabled={calendarStatus === "loading" || calendarStatus === "success"}
            onClick={handleAddToCalendar}
          >
            <CalendarPlus className="size-4" />
            {calendarStatus === "idle" && "Add to calendar"}
            {calendarStatus === "loading" && "Creating event..."}
            {calendarStatus === "success" && "Event created"}
            {calendarStatus === "error" && "Retry"}
          </Button>
        )}
      </div>
      {draftStatus === "success" && (
        <Link
          href="https://mail.google.com/mail/u/0/#drafts"
          target="_blank"
          className="block text-xs text-emerald-700 hover:underline"
        >
          Open Gmail drafts
        </Link>
      )}
      {draftStatus === "error" && draftError && (
        <p className="text-xs text-red-600">{draftError}</p>
      )}
      {calendarStatus === "success" && (
        <Link
          href="https://calendar.google.com"
          target="_blank"
          className="block text-xs text-emerald-700 hover:underline"
        >
          Open Google Calendar
        </Link>
      )}
      {calendarStatus === "error" && calendarError && (
        <p className="text-xs text-red-600">{calendarError}</p>
      )}
    </div>
  );
}
