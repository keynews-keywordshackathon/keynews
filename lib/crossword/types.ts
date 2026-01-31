export type Direction = "across" | "down";

export type CellStatus = "default" | "incorrect" | "revealed" | "correct";

export interface Position {
  row: number;
  col: number;
}

export interface PuzzleClue {
  number: number;
  text: string;
  answer: string;
  row: number;
  col: number;
}

export interface PuzzleData {
  id: string;
  title: string;
  author?: string;
  rows: number;
  cols: number;
  grid: string[][];
  clues: {
    across: PuzzleClue[];
    down: PuzzleClue[];
  };
}

export interface CellState {
  row: number;
  col: number;
  isBlack: boolean;
  number: number | null;
  solution: string;
  value: string;
  status: CellStatus;
  clueNumbers: {
    across?: number;
    down?: number;
  };
}

export interface TimerState {
  elapsedSeconds: number;
  isRunning: boolean;
}

export interface GameState {
  puzzle: PuzzleData;
  cells: CellState[][];
  selectedPosition: Position;
  direction: Direction;
  timer: TimerState;
  isComplete: boolean;
  completionDismissed: boolean;
  /** When true, puzzle was fully revealed; grid and timer are locked for the session */
  isRevealed: boolean;
  /** When true, we already showed the "incorrect completion" popup this session */
  incorrectCompletionDismissed: boolean;
}

export type GameAction =
  | { type: "SELECT_CELL"; position: Position }
  | { type: "TOGGLE_DIRECTION" }
  | { type: "SET_DIRECTION"; direction: Direction }
  | { type: "INPUT_LETTER"; letter: string }
  | { type: "DELETE_LETTER" }
  | { type: "MOVE"; direction: "up" | "down" | "left" | "right" }
  | { type: "NEXT_CLUE" }
  | { type: "PREV_CLUE" }
  | { type: "SELECT_CLUE"; clueNumber: number; direction: Direction }
  | { type: "CHECK_CELL" }
  | { type: "CHECK_WORD" }
  | { type: "CHECK_PUZZLE" }
  | { type: "REVEAL_CELL" }
  | { type: "REVEAL_WORD" }
  | { type: "REVEAL_PUZZLE" }
  | { type: "CLEAR_WORD" }
  | { type: "CLEAR_PUZZLE" }
  | { type: "TICK_TIMER" }
  | { type: "TOGGLE_TIMER" }
  | { type: "DISMISS_COMPLETION" }
  | { type: "DISMISS_INCORRECT_COMPLETION" }
  | { type: "UNLOCK_PUZZLE" }
  | { type: "RESTORE_STATE"; state: Partial<SavedState> };

export interface SavedState {
  cellValues: { row: number; col: number; value: string; status: CellStatus }[];
  selectedPosition: Position;
  direction: Direction;
  elapsedSeconds: number;
  isComplete: boolean;
  isRevealed?: boolean;
}
