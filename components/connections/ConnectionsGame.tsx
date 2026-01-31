"use client";

import { useState } from "react";
import { useConnectionsGame } from "@/lib/connections/useConnectionsGame";
import type { Puzzle } from "@/lib/connections/types";
import { WordGrid } from "./WordGrid";
import { SolvedGroup } from "./SolvedGroup";
import { MistakesIndicator } from "./MistakesIndicator";
import { ControlButtons } from "./ControlButtons";
import { GameOverlay } from "./GameOverlay";
import { CompletedGrid } from "./CompletedGrid";
import { cn } from "@/lib/utils";

interface ConnectionsGameProps {
    puzzle: Puzzle;
}

export function ConnectionsGame({ puzzle }: ConnectionsGameProps) {
    const {
        gameState,
        toggleWord,
        deselectAll,
        shuffle,
        submitGuess,
        resetGame,
        canSubmit,
        canDeselectAll,
    } = useConnectionsGame(puzzle);

    const isGameOver = gameState.gameStatus !== "playing";
    const [dismissedOverlay, setDismissedOverlay] = useState(false);
    const showOverlay = isGameOver && !dismissedOverlay;

    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
            {/* Title */}
            <h1 className="text-xl font-normal text-center">
                Create four groups of four!
            </h1>

            {/* Solved Groups - Show during gameplay */}
            {gameState.solvedGroups.length > 0 && gameState.gameStatus === "playing" && (
                <div className="w-full space-y-2">
                    {gameState.solvedGroups.map((group, index) => (
                        <SolvedGroup
                            key={group.category}
                            group={group}
                            animationDelay={index * 100}
                        />
                    ))}
                </div>
            )}

            {/* Completed Grid - Show when game is won */}
            {gameState.gameStatus === "won" && (
                <CompletedGrid groups={gameState.solvedGroups} />
            )}

            {/* Word Grid - Show during gameplay */}
            {gameState.remainingWords.length > 0 && gameState.gameStatus === "playing" && (
                <div
                    className={cn(
                        "w-full",
                        // Shake animation on incorrect guess
                        gameState.mistakesRemaining < 4 &&
                        gameState.message === null &&
                        !isGameOver &&
                        "animate-shake"
                    )}
                >
                    <WordGrid
                        words={gameState.remainingWords}
                        selectedWords={gameState.selectedWords}
                        onWordClick={toggleWord}
                        disabled={isGameOver}
                    />
                </div>
            )}

            {/* Message Toast */}
            {gameState.message && gameState.gameStatus === "playing" && (
                <div className="px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
                    {gameState.message}
                </div>
            )}

            {/* Mistakes Indicator - Only show during gameplay */}
            {gameState.gameStatus === "playing" && (
                <MistakesIndicator remaining={gameState.mistakesRemaining} />
            )}

            {/* Control Buttons - Only show during gameplay */}
            {gameState.gameStatus === "playing" && (
                <ControlButtons
                    onShuffle={shuffle}
                    onDeselectAll={deselectAll}
                    onSubmit={submitGuess}
                    canSubmit={canSubmit}
                    canDeselectAll={canDeselectAll}
                    disabled={isGameOver}
                />
            )}

            {/* Game Over Overlay */}
            {showOverlay && (
                <GameOverlay
                    status={gameState.gameStatus as "won" | "lost"}
                    solvedGroups={gameState.solvedGroups}
                    onClose={() => setDismissedOverlay(true)}
                />
            )}

            {/* Debug Reset Button */}
            <div className="pt-8 flex justify-center">
                <button
                    onClick={() => {
                        setDismissedOverlay(false);
                        resetGame();
                    }}
                    className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                    Reset Game (Debug)
                </button>
            </div>
        </div>
    );
}
