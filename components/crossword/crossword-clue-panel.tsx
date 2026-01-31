"use client";

import type { Direction, PuzzleClue } from "@/lib/crossword/types";
import { CrosswordClueItem } from "./crossword-clue-item";

interface CrosswordCluePanelProps {
  title: string;
  clues: PuzzleClue[];
  direction: Direction;
  activeClueNumber: number | null;
  activeDirection: Direction;
  onClueClick: (clueNumber: number, direction: Direction) => void;
}

export function CrosswordCluePanel({
  title,
  clues,
  direction,
  activeClueNumber,
  activeDirection,
  onClueClick,
}: CrosswordCluePanelProps) {
  return (
    <div className="flex flex-col">
      <h3 className="font-bold text-sm uppercase tracking-wide px-2 py-1.5 border-b border-border">
        {title}
      </h3>
      <div className="py-1">
        {clues.map((clue) => (
          <CrosswordClueItem
            key={clue.number}
            number={clue.number}
            text={clue.text}
            isActive={
              activeDirection === direction &&
              activeClueNumber === clue.number
            }
            onClick={() => onClueClick(clue.number, direction)}
          />
        ))}
      </div>
    </div>
  );
}
