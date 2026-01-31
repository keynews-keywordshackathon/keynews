"use client";

import { useEffect } from "react";
import type { GameAction } from "@/lib/crossword/types";

export function useCrosswordTimer(
  isRunning: boolean,
  dispatch: React.Dispatch<GameAction>
) {
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, dispatch]);
}
