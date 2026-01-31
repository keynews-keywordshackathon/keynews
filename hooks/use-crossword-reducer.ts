"use client";

import { useReducer } from "react";
import type {
  GameState,
  GameAction,
  PuzzleData,
  CellState,
  Direction,
  Position,
} from "@/lib/crossword/types";
import { buildGrid, getWordCells, isComplete, getFirstNonBlackCell } from "@/lib/crossword/puzzle-utils";
import {
  getNextClue,
  getMovedPosition,
  getNextInputPosition,
  getPrevInputPosition,
  selectCluePosition,
} from "./use-crossword-navigation";

export function initializeGameState(puzzle: PuzzleData): GameState {
  const cells = buildGrid(puzzle);
  const selectedPosition = getFirstNonBlackCell(cells);
  return {
    puzzle,
    cells,
    selectedPosition,
    direction: "across",
    timer: { elapsedSeconds: 0, isRunning: false },
    isComplete: false,
    completionDismissed: false,
    isRevealed: false,
    incorrectCompletionDismissed: false,
  };
}

function ensureDirection(
  cells: CellState[][],
  position: Position,
  direction: Direction
): Direction {
  const cell = cells[position.row]?.[position.col];
  if (!cell || cell.isBlack) return direction;
  if (cell.clueNumbers[direction] != null) return direction;
  // Flip to the other direction if current doesn't exist
  const other: Direction = direction === "across" ? "down" : "across";
  if (cell.clueNumbers[other] != null) return other;
  return direction;
}

function checkCompletion(state: GameState): GameState {
  if (isComplete(state.cells)) {
    return {
      ...state,
      isComplete: true,
      timer: { ...state.timer, isRunning: false },
    };
  }
  return state;
}

function updateCell(
  cells: CellState[][],
  row: number,
  col: number,
  updates: Partial<CellState>
): CellState[][] {
  return cells.map((r, ri) =>
    ri === row
      ? r.map((c, ci) => (ci === col ? { ...c, ...updates } : c))
      : r
  );
}

const LOCKED_ACTIONS = new Set([
  "SELECT_CELL",
  "TOGGLE_DIRECTION",
  "SET_DIRECTION",
  "INPUT_LETTER",
  "DELETE_LETTER",
  "MOVE",
  "NEXT_CLUE",
  "PREV_CLUE",
  "SELECT_CLUE",
  "CHECK_CELL",
  "CHECK_WORD",
  "CHECK_PUZZLE",
  "REVEAL_CELL",
  "REVEAL_WORD",
  "REVEAL_PUZZLE",
  "CLEAR_WORD",
  "CLEAR_PUZZLE",
  "TOGGLE_TIMER",
]);

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.isRevealed && LOCKED_ACTIONS.has(action.type)) {
    return state;
  }

  switch (action.type) {
    case "SELECT_CELL": {
      const { position } = action;
      const cell = state.cells[position.row]?.[position.col];
      if (!cell || cell.isBlack) return state;

      // If clicking the already-selected cell, toggle direction
      const isSameCell =
        state.selectedPosition.row === position.row &&
        state.selectedPosition.col === position.col;

      let newDirection = state.direction;
      if (isSameCell) {
        const other: Direction =
          state.direction === "across" ? "down" : "across";
        if (cell.clueNumbers[other] != null) {
          newDirection = other;
        }
      } else {
        newDirection = ensureDirection(state.cells, position, state.direction);
      }

      return {
        ...state,
        selectedPosition: position,
        direction: newDirection,
        timer: { ...state.timer, isRunning: true },
      };
    }

    case "TOGGLE_DIRECTION": {
      const cell =
        state.cells[state.selectedPosition.row]?.[state.selectedPosition.col];
      if (!cell) return state;
      const other: Direction =
        state.direction === "across" ? "down" : "across";
      if (cell.clueNumbers[other] != null) {
        return { ...state, direction: other };
      }
      return state;
    }

    case "SET_DIRECTION": {
      return { ...state, direction: action.direction };
    }

    case "INPUT_LETTER": {
      const { row, col } = state.selectedPosition;
      const cell = state.cells[row]?.[col];
      if (!cell || cell.isBlack) return state;

      const letter = action.letter.toUpperCase().slice(0, 1);

      const newCells = updateCell(state.cells, row, col, {
        value: letter,
        status: "default",
      });

      const nextPos = getNextInputPosition(
        newCells,
        state.selectedPosition,
        state.direction
      );

      const newState: GameState = {
        ...state,
        cells: newCells,
        selectedPosition: nextPos,
        timer: { ...state.timer, isRunning: true },
      };

      return checkCompletion(newState);
    }

    case "DELETE_LETTER": {
      const { row, col } = state.selectedPosition;
      const cell = state.cells[row]?.[col];
      if (!cell || cell.isBlack) return state;

      if (cell.value) {
        // Clear current cell
        const newCells = updateCell(state.cells, row, col, {
          value: "",
          status: "default",
        });
        return { ...state, cells: newCells };
      }

      // Move to previous cell and clear it
      const prevPos = getPrevInputPosition(
        state.cells,
        state.selectedPosition,
        state.direction
      );

      if (
        prevPos.row === state.selectedPosition.row &&
        prevPos.col === state.selectedPosition.col
      ) {
        return state;
      }

      const newCells = updateCell(state.cells, prevPos.row, prevPos.col, {
        value: "",
        status: "default",
      });

      return { ...state, cells: newCells, selectedPosition: prevPos };
    }

    case "MOVE": {
      const moveDir = action.direction;
      const crosswordDir: Direction =
        moveDir === "left" || moveDir === "right" ? "across" : "down";

      // If perpendicular to current direction, toggle direction first
      if (crosswordDir !== state.direction) {
        const cell =
          state.cells[state.selectedPosition.row]?.[
            state.selectedPosition.col
          ];
        if (cell?.clueNumbers[crosswordDir] != null) {
          return { ...state, direction: crosswordDir };
        }
      }

      const newPos = getMovedPosition(
        state.cells,
        state.selectedPosition,
        moveDir
      );
      const newDirection = ensureDirection(state.cells, newPos, state.direction);
      return { ...state, selectedPosition: newPos, direction: newDirection };
    }

    case "NEXT_CLUE":
    case "PREV_CLUE": {
      const currentCell =
        state.cells[state.selectedPosition.row]?.[state.selectedPosition.col];
      if (!currentCell) return state;

      const currentClueNum = currentCell.clueNumbers[state.direction];
      if (currentClueNum == null) return state;

      const next = getNextClue(
        state.cells,
        currentClueNum,
        state.direction,
        action.type === "PREV_CLUE"
      );
      if (!next) return state;

      const pos = selectCluePosition(
        state.cells,
        next.clueNumber,
        next.direction
      );
      if (!pos) return state;

      return {
        ...state,
        selectedPosition: pos,
        direction: next.direction,
      };
    }

    case "SELECT_CLUE": {
      const pos = selectCluePosition(
        state.cells,
        action.clueNumber,
        action.direction
      );
      if (!pos) return state;
      return {
        ...state,
        selectedPosition: pos,
        direction: action.direction,
        timer: { ...state.timer, isRunning: true },
      };
    }

    case "CHECK_CELL": {
      const { row, col } = state.selectedPosition;
      const cell = state.cells[row]?.[col];
      if (!cell || cell.isBlack || !cell.value) return state;

      const isCorrect =
        cell.value.toUpperCase() === cell.solution.toUpperCase();
      const newCells = updateCell(state.cells, row, col, {
        status: isCorrect ? "correct" : "incorrect",
      });
      return { ...state, cells: newCells };
    }

    case "CHECK_WORD": {
      const wordPositions = getWordCells(
        state.cells,
        state.selectedPosition,
        state.direction
      );
      let newCells = state.cells;
      for (const pos of wordPositions) {
        const cell = newCells[pos.row][pos.col];
        if (cell.value) {
          const isCorrect =
            cell.value.toUpperCase() === cell.solution.toUpperCase();
          newCells = updateCell(newCells, pos.row, pos.col, {
            status: isCorrect ? "correct" : "incorrect",
          });
        }
      }
      return { ...state, cells: newCells };
    }

    case "CHECK_PUZZLE": {
      let newCells = state.cells;
      for (let r = 0; r < newCells.length; r++) {
        for (let c = 0; c < newCells[0].length; c++) {
          const cell = newCells[r][c];
          if (!cell.isBlack && cell.value) {
            const isCorrect =
              cell.value.toUpperCase() === cell.solution.toUpperCase();
            newCells = updateCell(newCells, r, c, {
              status: isCorrect ? "correct" : "incorrect",
            });
          }
        }
      }
      return { ...state, cells: newCells };
    }

    case "REVEAL_CELL": {
      const { row, col } = state.selectedPosition;
      const cell = state.cells[row]?.[col];
      if (!cell || cell.isBlack) return state;

      const newCells = updateCell(state.cells, row, col, {
        value: cell.solution,
        status: "revealed",
      });
      return checkCompletion({ ...state, cells: newCells });
    }

    case "REVEAL_WORD": {
      const wordPositions = getWordCells(
        state.cells,
        state.selectedPosition,
        state.direction
      );
      let newCells = state.cells;
      for (const pos of wordPositions) {
        const cell = newCells[pos.row][pos.col];
        newCells = updateCell(newCells, pos.row, pos.col, {
          value: cell.solution,
          status: "revealed",
        });
      }
      return checkCompletion({ ...state, cells: newCells });
    }

    case "REVEAL_PUZZLE": {
      let newCells = state.cells;
      for (let r = 0; r < newCells.length; r++) {
        for (let c = 0; c < newCells[0].length; c++) {
          const cell = newCells[r][c];
          if (!cell.isBlack) {
            newCells = updateCell(newCells, r, c, {
              value: cell.solution,
              status: "revealed",
            });
          }
        }
      }
      return checkCompletion({
        ...state,
        cells: newCells,
        isRevealed: true,
        timer: { ...state.timer, isRunning: false },
      });
    }

    case "CLEAR_WORD": {
      const wordPositions = getWordCells(
        state.cells,
        state.selectedPosition,
        state.direction
      );
      let newCells = state.cells;
      for (const pos of wordPositions) {
        newCells = updateCell(newCells, pos.row, pos.col, {
          value: "",
          status: "default",
        });
      }
      return { ...state, cells: newCells };
    }

    case "CLEAR_PUZZLE": {
      let newCells = state.cells;
      for (let r = 0; r < newCells.length; r++) {
        for (let c = 0; c < newCells[0].length; c++) {
          if (!newCells[r][c].isBlack) {
            newCells = updateCell(newCells, r, c, {
              value: "",
              status: "default",
            });
          }
        }
      }
      return {
        ...state,
        cells: newCells,
        isComplete: false,
        completionDismissed: false,
      };
    }

    case "TICK_TIMER": {
      if (!state.timer.isRunning) return state;
      return {
        ...state,
        timer: {
          ...state.timer,
          elapsedSeconds: state.timer.elapsedSeconds + 1,
        },
      };
    }

    case "TOGGLE_TIMER": {
      return {
        ...state,
        timer: { ...state.timer, isRunning: !state.timer.isRunning },
      };
    }

    case "DISMISS_COMPLETION": {
      return { ...state, completionDismissed: true };
    }

    case "DISMISS_INCORRECT_COMPLETION": {
      return { ...state, incorrectCompletionDismissed: true };
    }

    case "UNLOCK_PUZZLE": {
      return { ...state, isRevealed: false };
    }

    case "RESTORE_STATE": {
      const saved = action.state;
      let newCells = state.cells;

      if (saved.cellValues) {
        for (const cv of saved.cellValues) {
          if (newCells[cv.row]?.[cv.col]) {
            newCells = updateCell(newCells, cv.row, cv.col, {
              value: cv.value,
              status: cv.status,
            });
          }
        }
      }

      return {
        ...state,
        cells: newCells,
        selectedPosition: saved.selectedPosition ?? state.selectedPosition,
        direction: saved.direction ?? state.direction,
        timer: {
          elapsedSeconds: saved.elapsedSeconds ?? 0,
          isRunning: false,
        },
        isComplete: saved.isComplete ?? false,
        isRevealed: saved.isRevealed ?? state.isRevealed,
      };
    }

    default:
      return state;
  }
}

export function useCrosswordReducer(puzzle: PuzzleData) {
  return useReducer(gameReducer, puzzle, initializeGameState);
}
