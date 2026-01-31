"use client";

interface CrosswordIncorrectModalProps {
  onDismiss: () => void;
}

export function CrosswordIncorrectModal({
  onDismiss,
}: CrosswordIncorrectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">Something&apos;s wrong</h2>
        <p className="text-muted-foreground">
          You&apos;ve filled in the puzzle, but some answers aren&apos;t correct.
          Use Check Cell, Check Word, or Check Puzzle to find the errors.
        </p>
        <button
          onClick={onDismiss}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
