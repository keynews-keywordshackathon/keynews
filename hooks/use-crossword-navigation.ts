import type { CellState, Direction, Position } from "@/lib/crossword/types";
import {
  getAllClueNumbers,
  getWordCells,
  findFirstCellOfClue,
} from "@/lib/crossword/puzzle-utils";

export function getNextClue(
  cells: CellState[][],
  currentClueNumber: number,
  currentDirection: Direction,
  reverse = false
): { clueNumber: number; direction: Direction } | null {
  const acrossNumbers = getAllClueNumbers(cells, "across");
  const downNumbers = getAllClueNumbers(cells, "down");

  // Build ordered list: all across, then all down
  const allClues: { clueNumber: number; direction: Direction }[] = [
    ...acrossNumbers.map((n) => ({ clueNumber: n, direction: "across" as Direction })),
    ...downNumbers.map((n) => ({ clueNumber: n, direction: "down" as Direction })),
  ];

  const currentIndex = allClues.findIndex(
    (c) => c.clueNumber === currentClueNumber && c.direction === currentDirection
  );

  if (currentIndex === -1) return allClues[0] || null;

  const step = reverse ? -1 : 1;
  const nextIndex = (currentIndex + step + allClues.length) % allClues.length;
  return allClues[nextIndex];
}

export function getMovedPosition(
  cells: CellState[][],
  position: Position,
  moveDirection: "up" | "down" | "left" | "right"
): Position {
  const rows = cells.length;
  const cols = cells[0].length;

  const deltas: Record<string, { dr: number; dc: number }> = {
    up: { dr: -1, dc: 0 },
    down: { dr: 1, dc: 0 },
    left: { dr: 0, dc: -1 },
    right: { dr: 0, dc: 1 },
  };

  const { dr, dc } = deltas[moveDirection];
  let r = position.row + dr;
  let c = position.col + dc;

  // Skip black cells
  while (r >= 0 && r < rows && c >= 0 && c < cols) {
    if (!cells[r][c].isBlack) return { row: r, col: c };
    r += dr;
    c += dc;
  }

  return position; // Stay put if no valid cell found
}

export function getNextInputPosition(
  cells: CellState[][],
  position: Position,
  direction: Direction
): Position {
  const wordCells = getWordCells(cells, position, direction);
  const currentIndex = wordCells.findIndex(
    (p) => p.row === position.row && p.col === position.col
  );

  // First try to find next empty cell in word
  for (let i = currentIndex + 1; i < wordCells.length; i++) {
    const p = wordCells[i];
    if (!cells[p.row][p.col].value) return p;
  }

  // If no empty, go to next cell in word
  if (currentIndex + 1 < wordCells.length) {
    return wordCells[currentIndex + 1];
  }

  return position;
}

export function getPrevInputPosition(
  cells: CellState[][],
  position: Position,
  direction: Direction
): Position {
  const wordCells = getWordCells(cells, position, direction);
  const currentIndex = wordCells.findIndex(
    (p) => p.row === position.row && p.col === position.col
  );

  if (currentIndex > 0) {
    return wordCells[currentIndex - 1];
  }

  return position;
}

export function selectCluePosition(
  cells: CellState[][],
  clueNumber: number,
  direction: Direction
): Position | null {
  return findFirstCellOfClue(cells, clueNumber, direction);
}
