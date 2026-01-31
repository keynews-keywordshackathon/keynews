"use client";

import type { WordGroup } from "@/lib/connections/types";
import { DIFFICULTY_COLORS, DIFFICULTY_ORDER } from "@/lib/connections/types";

interface GameOverlayProps {
    status: "won" | "lost";
    solvedGroups: WordGroup[];
    allGroups: WordGroup[];
    onPlayAgain: () => void;
}

export function GameOverlay({
    status,
    solvedGroups,
    allGroups,
    onPlayAgain,
}: GameOverlayProps) {
    const isWon = status === "won";
    const sortedGroups = [...allGroups].sort(
        (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">
                        {isWon ? "🎉 Congratulations!" : "Game Over"}
                    </h2>
                    <p className="text-gray-600">
                        {isWon
                            ? "You found all the connections!"
                            : `You found ${solvedGroups.length} of 4 groups`}
                    </p>
                </div>

                {/* Solution Grid */}
                <div className="space-y-2 mb-6">
                    {sortedGroups.map((group) => {
                        const wasSolved = solvedGroups.some(
                            (sg) => sg.category === group.category
                        );
                        return (
                            <div
                                key={group.category}
                                className="rounded-lg py-3 px-4 text-center"
                                style={{
                                    backgroundColor: DIFFICULTY_COLORS[group.difficulty],
                                    opacity: wasSolved ? 1 : 0.7,
                                }}
                            >
                                <h3 className="font-bold text-sm uppercase text-black">
                                    {group.category}
                                </h3>
                                <p className="text-xs uppercase text-black/70 mt-0.5">
                                    {group.words.join(", ")}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onPlayAgain}
                        className="px-6 py-2.5 rounded-full font-semibold text-sm bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        </div>
    );
}
