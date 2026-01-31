"use client";

import { cn } from "@/lib/utils";

interface ControlButtonsProps {
    onShuffle: () => void;
    onDeselectAll: () => void;
    onSubmit: () => void;
    canSubmit: boolean;
    canDeselectAll: boolean;
    disabled?: boolean;
}

export function ControlButtons({
    onShuffle,
    onDeselectAll,
    onSubmit,
    canSubmit,
    canDeselectAll,
    disabled,
}: ControlButtonsProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
                onClick={onShuffle}
                disabled={disabled}
                className={cn(
                    "px-5 py-2.5 rounded-full text-lg font-medium transition-colors",
                    disabled
                        ? "text-muted-foreground cursor-not-allowed border-0"
                        : "border border-foreground/70 hover:bg-muted"
                )}
            >
                Shuffle
            </button>

            <button
                onClick={onDeselectAll}
                disabled={disabled || !canDeselectAll}
                className={cn(
                    "px-5 py-2.5 rounded-full text-lg font-medium transition-colors",
                    disabled || !canDeselectAll
                        ? "text-muted-foreground cursor-not-allowed border-0"
                        : "border border-foreground/30 hover:bg-muted"
                )}
            >
                Deselect all
            </button>

            <button
                onClick={onSubmit}
                disabled={disabled || !canSubmit}
                className={cn(
                    "px-5 py-2.5 rounded-full text-lg font-medium transition-colors",
                    disabled || !canSubmit
                        ? "text-muted-foreground cursor-not-allowed border-0"
                        : "border border-foreground/30 hover:bg-muted"
                )}
            >
                Submit
            </button>
        </div>
    );
}
