"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { formatTime } from "@/lib/crossword/constants";
import type { GameAction } from "@/lib/crossword/types";

interface CrosswordToolbarProps {
  elapsedSeconds: number;
  isPaused: boolean;
  dispatch: React.Dispatch<GameAction>;
  /** When true, puzzle was revealed; timer and actions are disabled */
  isLocked?: boolean;
}

type DropdownType = "check" | "reveal" | "clear" | null;

export function CrosswordToolbar({
  elapsedSeconds,
  isPaused,
  dispatch,
  isLocked = false,
}: CrosswordToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [allowUnlockOverride] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("unlock") !== null;
  });

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);

  const showUnlockForTesting =
    isLocked &&
    (process.env.NODE_ENV === "development" || allowUnlockOverride);

  useEffect(() => {
    if (!openDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown, closeDropdown]);

  const toggleDropdown = (type: DropdownType) => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const dispatchAndClose = (action: GameAction) => {
    dispatch(action);
    closeDropdown();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" ref={dropdownRef}>
      {/* Timer */}
      <button
        onClick={() => !isLocked && dispatch({ type: "TOGGLE_TIMER" })}
        disabled={isLocked}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-sm font-mono transition-colors ${
          isLocked
            ? "border-border/50 text-muted-foreground cursor-not-allowed"
            : "border-border hover:bg-muted"
        }`}
      >
        {isPaused ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
        {formatTime(elapsedSeconds)}
      </button>

      {/* Check dropdown */}
      <div className="relative">
        <button
          onClick={() => !isLocked && toggleDropdown("check")}
          disabled={isLocked}
          className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
            isLocked
              ? "border-border/50 text-muted-foreground cursor-not-allowed"
              : "border-border hover:bg-muted"
          }`}
        >
          Check
        </button>
        {openDropdown === "check" && (
          <DropdownMenu>
            <DropdownItem
              label="Check Cell"
              onClick={() => dispatchAndClose({ type: "CHECK_CELL" })}
            />
            <DropdownItem
              label="Check Word"
              onClick={() => dispatchAndClose({ type: "CHECK_WORD" })}
            />
            <DropdownItem
              label="Check Puzzle"
              onClick={() => dispatchAndClose({ type: "CHECK_PUZZLE" })}
            />
          </DropdownMenu>
        )}
      </div>

      {/* Reveal dropdown */}
      <div className="relative">
        <button
          onClick={() => !isLocked && toggleDropdown("reveal")}
          disabled={isLocked}
          className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
            isLocked
              ? "border-border/50 text-muted-foreground cursor-not-allowed"
              : "border-border hover:bg-muted"
          }`}
        >
          Reveal
        </button>
        {openDropdown === "reveal" && (
          <DropdownMenu>
            <DropdownItem
              label="Reveal Cell"
              onClick={() => dispatchAndClose({ type: "REVEAL_CELL" })}
            />
            <DropdownItem
              label="Reveal Word"
              onClick={() => dispatchAndClose({ type: "REVEAL_WORD" })}
            />
            <DropdownItem
              label="Reveal Puzzle"
              onClick={() => dispatchAndClose({ type: "REVEAL_PUZZLE" })}
            />
          </DropdownMenu>
        )}
      </div>

      {/* Clear dropdown */}
      <div className="relative">
        <button
          onClick={() => !isLocked && toggleDropdown("clear")}
          disabled={isLocked}
          className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
            isLocked
              ? "border-border/50 text-muted-foreground cursor-not-allowed"
              : "border-border hover:bg-muted"
          }`}
        >
          Clear
        </button>
        {openDropdown === "clear" && (
          <DropdownMenu>
            <DropdownItem
              label="Clear Word"
              onClick={() => dispatchAndClose({ type: "CLEAR_WORD" })}
            />
            <DropdownItem
              label="Clear Puzzle"
              onClick={() => dispatchAndClose({ type: "CLEAR_PUZZLE" })}
            />
          </DropdownMenu>
        )}
      </div>

      {/* Testing override: unlock puzzle when revealed */}
      {showUnlockForTesting && (
        <button
          type="button"
          onClick={() => dispatch({ type: "UNLOCK_PUZZLE" })}
          className="px-3 py-1.5 rounded border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
        >
          Unlock (testing)
        </button>
      )}
    </div>
  );
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-md py-1 z-50 min-w-[140px]">
      {children}
    </div>
  );
}

function DropdownItem({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
    >
      {label}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,8 12,12 14,14" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="10" y1="15" x2="10" y2="9" />
      <line x1="14" y1="15" x2="14" y2="9" />
    </svg>
  );
}
