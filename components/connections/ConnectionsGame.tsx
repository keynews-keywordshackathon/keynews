"use client";

import { useConnectionsGame } from "@/lib/connections/useConnectionsGame";
import type { Puzzle } from "@/lib/connections/types";
import { WordGrid } from "./WordGrid";
import { SolvedGroup } from "./SolvedGroup";
import { MistakesIndicator } from "./MistakesIndicator";
import { ControlButtons } from "./ControlButtons";
import { GameOverlay } from "./GameOverlay";
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
        allGroups,
    } = useConnectionsGame(puzzle);

    const isGameOver = gameState.gameStatus !== "playing";

    return (
        <div className="flex flex-col items-center px-4 max-w-xl mx-auto">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-semibold text-center mb-6">
                Create four groups of four!
            </h1>

            {/* Solved Groups */}
            {gameState.solvedGroups.length > 0 && (
                <div className="w-full space-y-2 mb-4">
                    {gameState.solvedGroups.map((group, index) => (
                        <SolvedGroup
                            key={group.category}
                            group={group}
                            animationDelay={index * 100}
                        />
                    ))}
                </div>
            )}

            {/* Word Grid */}
            {gameState.remainingWords.length > 0 && (
                <div
                    className={cn(
                        "w-full mb-6",
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
            {gameState.message && (
                <div className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-full text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {gameState.message}
                </div>
            )}

            {/* Mistakes Indicator */}
            <div className="mb-6">
                <MistakesIndicator remaining={gameState.mistakesRemaining} />
            </div>

            {/* Control Buttons */}
            <ControlButtons
                onShuffle={shuffle}
                onDeselectAll={deselectAll}
                onSubmit={submitGuess}
                canSubmit={canSubmit}
                canDeselectAll={canDeselectAll}
                disabled={isGameOver}
            />

            {/* Game Over Overlay */}
            {isGameOver && (
                <GameOverlay
                    status={gameState.gameStatus as "won" | "lost"}
                    solvedGroups={gameState.solvedGroups}
                    allGroups={allGroups}
                    onPlayAgain={resetGame}
                />
            )}
        </div>
    );
}
