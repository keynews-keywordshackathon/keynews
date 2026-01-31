"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CellState, Direction, Position } from "@/lib/crossword/types";
import { CELL_SIZE } from "@/lib/crossword/constants";
import { getWordCells } from "@/lib/crossword/puzzle-utils";
import { CrosswordCell } from "./crossword-cell";

interface CrosswordGridProps {
  cells: CellState[][];
  selectedPosition: Position;
  direction: Direction;
  onCellClick: (position: Position) => void;
  /** When true, grid is read-only (e.g. puzzle was revealed) */
  isLocked?: boolean;
}

export const CrosswordGrid = memo(function CrosswordGrid({
  cells,
  selectedPosition,
  direction,
  onCellClick,
  isLocked = false,
}: CrosswordGridProps) {
  const cols = cells[0]?.length ?? 5;

  const activeWordSet = useMemo(() => {
    const wordCells = getWordCells(cells, selectedPosition, direction);
    return new Set(wordCells.map((p) => `${p.row},${p.col}`));
  }, [cells, selectedPosition, direction]);

  return (
    <div
      className={cn(
        "grid gap-0 border border-foreground/30",
        isLocked && "pointer-events-none select-none opacity-90"
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
      }}
      role="grid"
      aria-label={isLocked ? "Crossword grid (read-only)" : "Crossword grid"}
    >
      {cells.flatMap((row) =>
        row.map((cell) => {
          const key = `${cell.row},${cell.col}`;
          return (
            <CrosswordCell
              key={key}
              cell={cell}
              isSelected={
                selectedPosition.row === cell.row &&
                selectedPosition.col === cell.col
              }
              isActiveWord={activeWordSet.has(key)}
              onClick={
                isLocked
                  ? () => {}
                  : () => onCellClick({ row: cell.row, col: cell.col })
              }
            />
          );
        })
      )}
    </div>
  );
});
