"use client";

import { cn } from "@/lib/utils";

interface WordTileProps {
    word: string;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export function WordTile({ word, isSelected, onClick, disabled }: WordTileProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative h-16 sm:h-20 w-full rounded-md font-bold uppercase text-lg sm:text-xl",
                "transition-all duration-200 ease-out",
                "select-none",
                "focus:outline-none",
                // Default state
                !isSelected && [
                    "bg-[#efefe6] text-foreground",
                    "cursor-pointer",
                ],
                // Selected state
                isSelected && [
                    "bg-[#59594e] text-background",
                ],
                // Disabled state
                disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-pressed={isSelected}
        >
            <span className="absolute inset-0 flex items-center justify-center px-2 text-center leading-tight">
                {word}
            </span>
        </button>
    );
}
