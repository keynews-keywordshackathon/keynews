"use client";

import { cn } from "@/lib/utils";

interface MistakesIndicatorProps {
    remaining: number;
    max?: number;
}

export function MistakesIndicator({ remaining, max = 4 }: MistakesIndicatorProps) {
    return (
        <div className="flex items-center gap-2 justify-center">
            <span className="text-sm text-gray-600">Mistakes remaining:</span>
            <div className="flex gap-1.5">
                {Array.from({ length: max }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-3 h-3 rounded-full transition-all duration-300",
                            i < remaining ? "bg-gray-800" : "bg-gray-300"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
