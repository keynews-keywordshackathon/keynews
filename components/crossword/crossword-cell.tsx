"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { CellState } from "@/lib/crossword/types";
import { CELL_SIZE } from "@/lib/crossword/constants";

interface CrosswordCellProps {
  cell: CellState;
  isSelected: boolean;
  isActiveWord: boolean;
  onClick: () => void;
}

export const CrosswordCell = memo(function CrosswordCell({
  cell,
  isSelected,
  isActiveWord,
  onClick,
}: CrosswordCellProps) {
  if (cell.isBlack) {
    return (
      <div
        style={{ width: CELL_SIZE, height: CELL_SIZE }}
        className="bg-foreground"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      className={cn(
        "relative flex items-center justify-center border border-foreground/30 cursor-pointer select-none",
        isSelected &&
          "bg-[var(--crossword-selected)] ring-2 ring-inset ring-[var(--crossword-selected-ring)]",
        !isSelected && isActiveWord && "bg-[var(--crossword-active-word)]",
        !isSelected && !isActiveWord && "bg-background"
      )}
      onClick={onClick}
      role="gridcell"
      aria-label={`Row ${cell.row + 1}, Column ${cell.col + 1}${cell.value ? `, letter ${cell.value}` : ", empty"}`}
    >
      {cell.number && (
        <span className="absolute top-1 left-1 text-[10px] leading-none font-medium text-foreground/70">
          {cell.number}
        </span>
      )}
      <span
        className={cn(
          "text-2xl font-semibold uppercase",
          cell.status === "incorrect" && "text-[var(--crossword-incorrect)]",
          cell.status === "revealed" && "text-[var(--crossword-revealed)]",
          cell.status === "correct" && "text-[var(--crossword-correct)]",
          cell.status === "default" && "text-foreground"
        )}
      >
        {cell.value}
      </span>
    </div>
  );
});
