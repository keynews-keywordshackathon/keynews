"use client";

import { useCallback, useEffect } from "react";
import type { PuzzleData, Position, Direction } from "@/lib/crossword/types";
import { isLetterKey, NAVIGATION_KEYS } from "@/lib/crossword/constants";
import { useCrosswordReducer } from "@/hooks/use-crossword-reducer";
import { useCrosswordTimer } from "@/hooks/use-crossword-timer";
import { useSaveCrossword, useLoadCrossword } from "@/hooks/use-local-storage";
import { CrosswordGrid } from "./crossword-grid";
import { CrosswordCluePanel } from "./crossword-clue-panel";
import { CrosswordToolbar } from "./crossword-toolbar";
import { CrosswordCompletionModal } from "./crossword-completion-modal";
import { CrosswordIncorrectModal } from "./crossword-incorrect-modal";
import { isFilled } from "@/lib/crossword/puzzle-utils";

interface CrosswordGameProps {
  puzzle: PuzzleData;
}

export function CrosswordGame({ puzzle }: CrosswordGameProps) {
  const [state, dispatch] = useCrosswordReducer(puzzle);

  useCrosswordTimer(state.timer.isRunning, dispatch);
  useSaveCrossword(puzzle.id, state);
  useLoadCrossword(puzzle.id, dispatch);

  const handleCellClick = useCallback(
    (position: Position) => {
      dispatch({ type: "SELECT_CELL", position });
    },
    [dispatch]
  );

  const handleClueClick = useCallback(
    (clueNumber: number, direction: Direction) => {
      dispatch({ type: "SELECT_CLUE", clueNumber, direction });
    },
    [dispatch]
  );

  // Global keyboard handler (no-op when puzzle is revealed/locked)
  useEffect(() => {
    if (state.isRevealed) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture if user is in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (isLetterKey(e.key)) {
        e.preventDefault();
        dispatch({ type: "INPUT_LETTER", letter: e.key });
        return;
      }

      if (!NAVIGATION_KEYS.has(e.key)) return;

      e.preventDefault();

      switch (e.key) {
        case "ArrowUp":
          dispatch({ type: "MOVE", direction: "up" });
          break;
        case "ArrowDown":
          dispatch({ type: "MOVE", direction: "down" });
          break;
        case "ArrowLeft":
          dispatch({ type: "MOVE", direction: "left" });
          break;
        case "ArrowRight":
          dispatch({ type: "MOVE", direction: "right" });
          break;
        case "Tab":
          if (e.shiftKey) {
            dispatch({ type: "PREV_CLUE" });
          } else {
            dispatch({ type: "NEXT_CLUE" });
          }
          break;
        case " ":
          dispatch({ type: "TOGGLE_DIRECTION" });
          break;
        case "Backspace":
        case "Delete":
          dispatch({ type: "DELETE_LETTER" });
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.isRevealed]);

  const activeCell =
    state.cells[state.selectedPosition.row]?.[state.selectedPosition.col];
  const activeClueNumber = activeCell?.clueNumbers[state.direction] ?? null;
  const activeClue =
    (state.direction === "across"
      ? puzzle.clues.across.find((c) => c.number === activeClueNumber)
      : puzzle.clues.down.find((c) => c.number === activeClueNumber)) ?? null;

  const filledButIncorrect =
    !state.isComplete &&
    isFilled(state.cells) &&
    !state.incorrectCompletionDismissed;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <CrosswordToolbar
        elapsedSeconds={state.timer.elapsedSeconds}
        isPaused={!state.timer.isRunning && state.timer.elapsedSeconds > 0}
        dispatch={dispatch}
        isLocked={state.isRevealed}
      />

      <div className="flex gap-6 items-start">
        {/* Grid column: current clue header + grid */}
        <div className="shrink-0 flex flex-col gap-2">
          {/* Current clue header above grid */}
          {activeClue && (
            <div className="bg-[var(--crossword-active-word)] px-3 py-2 rounded text-sm font-medium min-h-[2.75rem] flex items-center">
              <span className="font-bold shrink-0">
                {activeClue.number} {state.direction === "across" ? "Across" : "Down"}
              </span>
              <span className="ml-2">{activeClue.text}</span>
            </div>
          )}
          <CrosswordGrid
            cells={state.cells}
            selectedPosition={state.selectedPosition}
            direction={state.direction}
            onCellClick={handleCellClick}
            isLocked={state.isRevealed}
          />
        </div>

        {/* Clue panels: more space, not condensed */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-w-[280px]">
          <CrosswordCluePanel
            title="Across"
            clues={puzzle.clues.across}
            direction="across"
            activeClueNumber={activeClueNumber}
            activeDirection={state.direction}
            onClueClick={handleClueClick}
          />
          <CrosswordCluePanel
            title="Down"
            clues={puzzle.clues.down}
            direction="down"
            activeClueNumber={activeClueNumber}
            activeDirection={state.direction}
            onClueClick={handleClueClick}
          />
        </div>
      </div>

      {/* Completion modal */}
      {state.isComplete && !state.completionDismissed && (
        <CrosswordCompletionModal
          elapsedSeconds={state.timer.elapsedSeconds}
          onDismiss={() => dispatch({ type: "DISMISS_COMPLETION" })}
        />
      )}

      {/* Incorrect completion modal (shown once per session when filled but wrong) */}
      {filledButIncorrect && (
        <CrosswordIncorrectModal
          onDismiss={() => dispatch({ type: "DISMISS_INCORRECT_COMPLETION" })}
        />
      )}
    </div>
  );
}
