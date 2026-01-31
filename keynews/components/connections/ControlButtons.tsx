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
    const buttonBase = cn(
        "px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
        "disabled:opacity-50 disabled:cursor-not-allowed"
    );

    return (
        <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
                onClick={onShuffle}
                disabled={disabled}
                className={cn(
                    buttonBase,
                    "border-2 border-gray-800 bg-white text-gray-800",
                    "hover:bg-gray-100 active:bg-gray-200"
                )}
            >
                Shuffle
            </button>

            <button
                onClick={onDeselectAll}
                disabled={disabled || !canDeselectAll}
                className={cn(
                    buttonBase,
                    "border-2 border-gray-800 bg-white text-gray-800",
                    "hover:bg-gray-100 active:bg-gray-200",
                    !canDeselectAll && "border-gray-300 text-gray-400"
                )}
            >
                Deselect all
            </button>

            <button
                onClick={onSubmit}
                disabled={disabled || !canSubmit}
                className={cn(
                    buttonBase,
                    "border-2",
                    canSubmit
                        ? "border-gray-800 bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-900"
                        : "border-gray-300 bg-gray-200 text-gray-400"
                )}
            >
                Submit
            </button>
        </div>
    );
}
