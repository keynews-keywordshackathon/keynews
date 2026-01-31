"use client";

import type { WordGroup } from "@/lib/connections/types";
import { DIFFICULTY_COLORS, DIFFICULTY_ORDER } from "@/lib/connections/types";

interface GameOverlayProps {
    status: "won" | "lost";
    solvedGroups: WordGroup[];
    allGroups: WordGroup[];
    onClose: () => void;
}

export function GameOverlay({
    status,
    solvedGroups,
    allGroups,
    onClose,
}: GameOverlayProps) {
    const isWon = status === "won";

    return (
        <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 cursor-pointer"
            onClick={onClose}
        >
            <div 
                className="bg-popover border border-border rounded-lg p-6 sm:p-8 max-w-md w-full shadow-lg animate-in zoom-in-95 duration-300 cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                        {isWon ? "🎉 Congratulations!" : "Game Over"}
                    </h2>
                    <p className="text-muted-foreground">
                        {isWon
                            ? "You found all the connections!"
                            : `You found ${solvedGroups.length} of 4 groups`}
                    </p>
                </div>
            </div>
        </div>
    );
}
