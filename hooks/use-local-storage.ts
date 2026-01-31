"use client";

import { useEffect, useRef, useCallback } from "react";
import type { GameState, SavedState } from "@/lib/crossword/types";

const STORAGE_PREFIX = "crossword_";

function getSavedState(state: GameState): SavedState {
  const cellValues: SavedState["cellValues"] = [];
  for (const row of state.cells) {
    for (const cell of row) {
      if (!cell.isBlack && cell.value) {
        cellValues.push({
          row: cell.row,
          col: cell.col,
          value: cell.value,
          status: cell.status,
        });
      }
    }
  }
  return {
    cellValues,
    selectedPosition: state.selectedPosition,
    direction: state.direction,
    elapsedSeconds: state.timer.elapsedSeconds,
    isComplete: state.isComplete,
    isRevealed: state.isRevealed,
  };
}

export function useSaveCrossword(puzzleId: string, state: GameState) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      try {
        const saved = getSavedState(state);
        localStorage.setItem(
          STORAGE_PREFIX + puzzleId,
          JSON.stringify(saved)
        );
      } catch {
        // localStorage might be full or unavailable
      }
    }, 250);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [puzzleId, state]);
}

export function useLoadCrossword(
  puzzleId: string,
  dispatch: React.Dispatch<{ type: "RESTORE_STATE"; state: Partial<SavedState> }>
) {
  const loaded = useRef(false);

  const load = useCallback(() => {
    if (loaded.current) return;
    loaded.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + puzzleId);
      if (raw) {
        const saved = JSON.parse(raw) as SavedState;
        dispatch({ type: "RESTORE_STATE", state: saved });
      }
    } catch {
      // Invalid data, ignore
    }
  }, [puzzleId, dispatch]);

  useEffect(() => {
    load();
  }, [load]);
}
