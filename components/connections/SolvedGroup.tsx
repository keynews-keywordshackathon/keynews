"use client";

import type { WordGroup } from "@/lib/connections/types";
import { DIFFICULTY_COLORS } from "@/lib/connections/types";

interface SolvedGroupProps {
    group: WordGroup;
    animationDelay?: number;
}

export function SolvedGroup({ group, animationDelay = 0 }: SolvedGroupProps) {
    const bgColor = DIFFICULTY_COLORS[group.difficulty];

    return (
        <div
            className="w-full rounded-lg py-4 px-6 text-center animate-in slide-in-from-top-4 fade-in duration-500"
            style={{
                backgroundColor: bgColor,
                animationDelay: `${animationDelay}ms`,
            }}
        >
            <h3 className="font-bold text-sm sm:text-base uppercase tracking-wide text-black">
                {group.category}
            </h3>
            <p className="text-xs sm:text-sm uppercase text-black/80 mt-1">
                {group.words.join(", ")}
            </p>
        </div>
    );
}
