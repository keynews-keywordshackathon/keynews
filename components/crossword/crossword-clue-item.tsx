"use client";

import { memo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CrosswordClueItemProps {
  number: number;
  text: string;
  isActive: boolean;
  onClick: () => void;
}

export const CrosswordClueItem = memo(function CrosswordClueItem({
  number,
  text,
  isActive,
  onClick,
}: CrosswordClueItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isActive]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        "flex gap-2 w-full text-left px-2 py-1.5 rounded text-sm transition-colors",
        isActive
          ? "bg-[var(--crossword-active-word)] font-medium"
          : "hover:bg-muted"
      )}
    >
      <span className="font-bold text-foreground/70 min-w-[1.5rem]">
        {number}
      </span>
      <span>{text}</span>
    </button>
  );
});
