import type { CellState, Direction, PuzzleData, Position } from "./types";

export function buildGrid(puzzle: PuzzleData): CellState[][] {
  const { rows, cols, grid, clues } = puzzle;

  // Build number map from clue numbering
  const numberMap = new Map<string, number>();
  const clueNumberMap = new Map<string, { across?: number; down?: number }>();

  // Mark across clue membership
  for (const clue of clues.across) {
    for (let i = 0; i < clue.answer.length; i++) {
      const key = `${clue.row},${clue.col + i}`;
      const existing = clueNumberMap.get(key) || {};
      existing.across = clue.number;
      clueNumberMap.set(key, existing);
    }
    numberMap.set(`${clue.row},${clue.col}`, clue.number);
  }

  // Mark down clue membership
  for (const clue of clues.down) {
    for (let i = 0; i < clue.answer.length; i++) {
      const key = `${clue.row + i},${clue.col}`;
      const existing = clueNumberMap.get(key) || {};
      existing.down = clue.number;
      clueNumberMap.set(key, existing);
    }
    const key = `${clue.row},${clue.col}`;
    const existing = numberMap.get(key);
    if (!existing) {
      numberMap.set(key, clue.number);
    }
  }

  // Build cell grid
  const cells: CellState[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CellState[] = [];
    for (let c = 0; c < cols; c++) {
      const isBlack = grid[r][c] === ".";
      const key = `${r},${c}`;
      row.push({
        row: r,
        col: c,
        isBlack,
        number: numberMap.get(key) ?? null,
        solution: isBlack ? "" : grid[r][c],
        value: "",
        status: "default",
        clueNumbers: clueNumberMap.get(key) || {},
      });
    }
    cells.push(row);
  }

  return cells;
}

export function getWordCells(
  cells: CellState[][],
  position: Position,
  direction: Direction
): Position[] {
  const cell = cells[position.row]?.[position.col];
  if (!cell || cell.isBlack) return [];

  const clueNum = cell.clueNumbers[direction];
  if (clueNum == null) return [];

  const positions: Position[] = [];
  const rows = cells.length;
  const cols = cells[0].length;

  if (direction === "across") {
    for (let c = 0; c < cols; c++) {
      if (cells[position.row][c].clueNumbers.across === clueNum) {
        positions.push({ row: position.row, col: c });
      }
    }
  } else {
    for (let r = 0; r < rows; r++) {
      if (cells[r][position.col].clueNumbers.down === clueNum) {
        positions.push({ row: r, col: position.col });
      }
    }
  }

  return positions;
}

export function findFirstCellOfClue(
  cells: CellState[][],
  clueNumber: number,
  direction: Direction
): Position | null {
  for (const row of cells) {
    for (const cell of row) {
      if (cell.clueNumbers[direction] === clueNumber && cell.number === clueNumber) {
        return { row: cell.row, col: cell.col };
      }
    }
  }
  // Fallback: find first cell with this clue number
  for (const row of cells) {
    for (const cell of row) {
      if (cell.clueNumbers[direction] === clueNumber) {
        return { row: cell.row, col: cell.col };
      }
    }
  }
  return null;
}

export function getNextCellInDirection(
  cells: CellState[][],
  position: Position,
  direction: Direction,
  reverse = false
): Position | null {
  const rows = cells.length;
  const cols = cells[0].length;
  const dr = direction === "down" ? (reverse ? -1 : 1) : 0;
  const dc = direction === "across" ? (reverse ? -1 : 1) : 0;

  let r = position.row + dr;
  let c = position.col + dc;

  while (r >= 0 && r < rows && c >= 0 && c < cols) {
    if (!cells[r][c].isBlack) return { row: r, col: c };
    r += dr;
    c += dc;
  }

  return null;
}

export function getNextEmptyCellInWord(
  cells: CellState[][],
  position: Position,
  direction: Direction
): Position | null {
  const wordCells = getWordCells(cells, position, direction);
  const currentIndex = wordCells.findIndex(
    (p) => p.row === position.row && p.col === position.col
  );

  // Look forward from current position
  for (let i = currentIndex + 1; i < wordCells.length; i++) {
    const p = wordCells[i];
    if (!cells[p.row][p.col].value) return p;
  }

  return null;
}

/** True when every non-black cell has a value (puzzle is fully filled) */
export function isFilled(cells: CellState[][]): boolean {
  for (const row of cells) {
    for (const cell of row) {
      if (!cell.isBlack && !cell.value.trim()) return false;
    }
  }
  return true;
}

export function isComplete(cells: CellState[][]): boolean {
  for (const row of cells) {
    for (const cell of row) {
      if (!cell.isBlack && cell.value.toUpperCase() !== cell.solution.toUpperCase()) {
        return false;
      }
    }
  }
  return true;
}

export function getAllClueNumbers(
  cells: CellState[][],
  direction: Direction
): number[] {
  const numbers = new Set<number>();
  for (const row of cells) {
    for (const cell of row) {
      const num = cell.clueNumbers[direction];
      if (num != null) numbers.add(num);
    }
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export function getFirstNonBlackCell(cells: CellState[][]): Position {
  for (const row of cells) {
    for (const cell of row) {
      if (!cell.isBlack) return { row: cell.row, col: cell.col };
    }
  }
  return { row: 0, col: 0 };
}
