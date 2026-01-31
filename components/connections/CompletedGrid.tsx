"use client";

import type { WordGroup } from "@/lib/connections/types";
import { DIFFICULTY_COLORS } from "@/lib/connections/types";

interface CompletedGridProps {
    groups: WordGroup[];
}

export function CompletedGrid({ groups }: CompletedGridProps) {
    // Display groups in the order they were solved (no sorting)
    return (
        <div className="w-full space-y-2">
            {groups.map((group, index) => {
                const bgColor = DIFFICULTY_COLORS[group.difficulty];
                return (
                    <div
                        key={group.category}
                        className="w-full rounded-lg py-4 px-6 text-center animate-in slide-in-from-top-4 fade-in duration-500"
                        style={{
                            backgroundColor: bgColor,
                            animationDelay: `${index * 100}ms`,
                        }}
                    >
                        <h3 className="font-bold text-base sm:text-lg uppercase tracking-wide text-foreground">
                            {group.category}
                        </h3>
                        <p className="text-sm sm:text-base font-semibold uppercase text-foreground/80 mt-1">
                            {group.words.join(", ")}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
