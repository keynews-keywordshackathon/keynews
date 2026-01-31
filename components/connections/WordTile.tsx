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
                "relative h-16 sm:h-20 w-full rounded-lg font-bold uppercase text-sm sm:text-base",
                "transition-all duration-200 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
                "select-none cursor-pointer",
                // Default state
                !isSelected && [
                    "bg-[#efefe6] text-black",
                    "hover:bg-[#e4e4db] hover:scale-[1.02]",
                    "active:scale-[0.98]",
                ],
                // Selected state
                isSelected && [
                    "bg-[#5a594e] text-white",
                    "scale-[1.02]",
                    "shadow-lg",
                ],
                // Disabled state
                disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            aria-pressed={isSelected}
        >
            <span className="absolute inset-0 flex items-center justify-center px-2 text-center leading-tight">
                {word}
            </span>
        </button>
    );
}
