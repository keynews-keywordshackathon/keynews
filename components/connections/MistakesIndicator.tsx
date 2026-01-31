"use client";

import { cn } from "@/lib/utils";

interface MistakesIndicatorProps {
    remaining: number;
    max?: number;
}

export function MistakesIndicator({ remaining, max = 4 }: MistakesIndicatorProps) {
    return (
        <div className="flex items-center gap-3 justify-center">
            <span className="text-base text-muted-foreground">Mistakes remaining:</span>
            <div className="flex gap-2">
                {Array.from({ length: max }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-4.5 h-4.5 rounded-full transition-all duration-300 border border-border",
                            i < remaining ? "bg-foreground" : "bg-muted"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
