"use client";

import { useState, useCallback, useMemo } from "react";
import type { Puzzle, WordGroup, GameState } from "./types";
import { getAllWords, shuffleArray } from "./puzzles";
import { DIFFICULTY_ORDER } from "./types";

const MAX_SELECTION = 4;
const MAX_MISTAKES = 4;
const MESSAGE_DURATION = 2000;

export function useConnectionsGame(puzzle: Puzzle) {
    const [gameState, setGameState] = useState<GameState>(() => ({
        puzzle,
        remainingWords: getAllWords(puzzle),
        selectedWords: [],
        solvedGroups: [],
        mistakesRemaining: MAX_MISTAKES,
        guessedCombinations: [],
        gameStatus: "playing",
        message: null,
    }));

    // Check if a word is selected
    const isSelected = useCallback(
        (word: string) => gameState.selectedWords.includes(word),
        [gameState.selectedWords]
    );

    // Toggle word selection
    const toggleWord = useCallback((word: string) => {
        setGameState((prev) => {
            if (prev.gameStatus !== "playing") return prev;

            const isCurrentlySelected = prev.selectedWords.includes(word);

            if (isCurrentlySelected) {
                // Deselect the word
                return {
                    ...prev,
                    selectedWords: prev.selectedWords.filter((w) => w !== word),
                };
            } else if (prev.selectedWords.length < MAX_SELECTION) {
                // Select the word (if under limit)
                return {
                    ...prev,
                    selectedWords: [...prev.selectedWords, word],
                };
            }

            return prev;
        });
    }, []);

    // Deselect all words
    const deselectAll = useCallback(() => {
        setGameState((prev) => ({
            ...prev,
            selectedWords: [],
        }));
    }, []);

    // Shuffle remaining words
    const shuffle = useCallback(() => {
        setGameState((prev) => ({
            ...prev,
            remainingWords: shuffleArray(prev.remainingWords),
        }));
    }, []);

    // Clear message after timeout
    const clearMessage = useCallback(() => {
        setGameState((prev) => ({
            ...prev,
            message: null,
        }));
    }, []);

    // Show a temporary message
    const showMessage = useCallback(
        (message: string) => {
            setGameState((prev) => ({
                ...prev,
                message,
            }));
            setTimeout(clearMessage, MESSAGE_DURATION);
        },
        [clearMessage]
    );

    // Check if this combination was already guessed
    const wasAlreadyGuessed = useCallback(
        (words: string[]) => {
            const sortedWords = [...words].sort();
            return gameState.guessedCombinations.some((combo) => {
                const sortedCombo = [...combo].sort();
                return (
                    sortedCombo.length === sortedWords.length &&
                    sortedCombo.every((w, i) => w === sortedWords[i])
                );
            });
        },
        [gameState.guessedCombinations]
    );

    // Submit current selection
    const submitGuess = useCallback(() => {
        if (gameState.selectedWords.length !== MAX_SELECTION) return;
        if (gameState.gameStatus !== "playing") return;

        // Check if already guessed
        if (wasAlreadyGuessed(gameState.selectedWords)) {
            showMessage("Already guessed!");
            return;
        }

        const selectedSet = new Set(gameState.selectedWords);

        // Find matching group
        let matchedGroup: WordGroup | null = null;
        let oneAwayGroup: WordGroup | null = null;

        for (const group of puzzle.groups) {
            if (gameState.solvedGroups.includes(group)) continue;

            const matches = group.words.filter((w) => selectedSet.has(w)).length;

            if (matches === 4) {
                matchedGroup = group;
                break;
            } else if (matches === 3) {
                oneAwayGroup = group;
            }
        }

        if (matchedGroup) {
            // Correct guess!
            setGameState((prev) => {
                const newSolvedGroups = [...prev.solvedGroups, matchedGroup].sort(
                    (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
                );
                const newRemainingWords = prev.remainingWords.filter(
                    (w) => !matchedGroup.words.includes(w)
                );
                const isWon = newSolvedGroups.length === 4;

                return {
                    ...prev,
                    selectedWords: [],
                    solvedGroups: newSolvedGroups,
                    remainingWords: newRemainingWords,
                    gameStatus: isWon ? "won" : "playing",
                    message: isWon ? "Congratulations!" : null,
                };
            });
        } else {
            // Incorrect guess
            setGameState((prev) => {
                const newMistakes = prev.mistakesRemaining - 1;
                const isLost = newMistakes === 0;

                return {
                    ...prev,
                    mistakesRemaining: newMistakes,
                    guessedCombinations: [...prev.guessedCombinations, prev.selectedWords],
                    gameStatus: isLost ? "lost" : "playing",
                    selectedWords: isLost ? [] : prev.selectedWords,
                };
            });

            if (oneAwayGroup) {
                showMessage("One away...");
            }
        }
    }, [
        gameState.selectedWords,
        gameState.gameStatus,
        gameState.solvedGroups,
        puzzle.groups,
        wasAlreadyGuessed,
        showMessage,
    ]);

    // Reset the game
    const resetGame = useCallback(() => {
        setGameState({
            puzzle,
            remainingWords: getAllWords(puzzle),
            selectedWords: [],
            solvedGroups: [],
            mistakesRemaining: MAX_MISTAKES,
            guessedCombinations: [],
            gameStatus: "playing",
            message: null,
        });
    }, [puzzle]);

    // Computed values
    const canSubmit = useMemo(
        () =>
            gameState.selectedWords.length === MAX_SELECTION &&
            gameState.gameStatus === "playing",
        [gameState.selectedWords.length, gameState.gameStatus]
    );

    const canDeselectAll = useMemo(
        () => gameState.selectedWords.length > 0 && gameState.gameStatus === "playing",
        [gameState.selectedWords.length, gameState.gameStatus]
    );

    // Get all groups for game over display
    const allGroups = useMemo(() => {
        return [...puzzle.groups].sort(
            (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
        );
    }, [puzzle.groups]);

    return {
        gameState,
        isSelected,
        toggleWord,
        deselectAll,
        shuffle,
        submitGuess,
        resetGame,
        canSubmit,
        canDeselectAll,
        allGroups,
    };
}
