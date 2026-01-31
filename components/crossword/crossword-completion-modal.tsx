"use client";

import { formatTime } from "@/lib/crossword/constants";

interface CrosswordCompletionModalProps {
  elapsedSeconds: number;
  onDismiss: () => void;
}

export function CrosswordCompletionModal({
  elapsedSeconds,
  onDismiss,
}: CrosswordCompletionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">Congratulations!</h2>
        <p className="text-muted-foreground">
          You completed the puzzle in
        </p>
        <p className="text-4xl font-mono font-bold">
          {formatTime(elapsedSeconds)}
        </p>
        <button
          onClick={onDismiss}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
