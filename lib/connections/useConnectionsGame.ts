"use client";

import { useState, useCallback, useMemo } from "react";
import type { Puzzle, WordGroup, GameState } from "./types";
import { getAllWords, shuffleArray } from "./puzzles";
import { DIFFICULTY_ORDER } from "./types";

const MAX_SELECTION = 4;
const MAX_MISTAKES = 4;
const MESSAGE_DURATION = 2000;
const STORAGE_PREFIX = "connections_";

interface SavedState {
    solvedCategories: string[]; // Save only category names to preserve order
    remainingWords: string[];
    mistakesRemaining: number;
    guessedCombinations: string[][];
    gameStatus: "playing" | "won" | "lost";
}

function getSavedState(state: GameState): SavedState {
    return {
        solvedCategories: state.solvedGroups.map((g) => g.category),
        remainingWords: state.remainingWords,
        mistakesRemaining: state.mistakesRemaining,
        guessedCombinations: state.guessedCombinations,
        gameStatus: state.gameStatus,
    };
}

function createInitialState(puzzle: Puzzle): GameState {
    return {
        puzzle,
        remainingWords: getAllWords(puzzle),
        selectedWords: [],
        solvedGroups: [],
        mistakesRemaining: MAX_MISTAKES,
        guessedCombinations: [],
        gameStatus: "playing",
        message: null,
    };
}

export function useConnectionsGame(puzzle: Puzzle) {
    const [gameState, setGameState] = useState<GameState>(() => {
        if (typeof window === "undefined") {
            return createInitialState(puzzle);
        }

        try {
            const raw = window.localStorage.getItem(STORAGE_PREFIX + puzzle.id);
            if (raw) {
                const saved = JSON.parse(raw) as SavedState;

                const categoryToGroup = new Map(puzzle.groups.map((g) => [g.category, g]));
                const restoredGroups: WordGroup[] = [];

                for (const category of saved.solvedCategories || []) {
                    const group = categoryToGroup.get(category);
                    if (group) {
                        restoredGroups.push(group);
                    }
                }

                const solvedWords = new Set(restoredGroups.flatMap((g) => g.words));
                const allWords = puzzle.groups.flatMap((g) => g.words);
                const remainingWords = allWords.filter((w) => !solvedWords.has(w));

                if (saved.gameStatus) {
                    return {
                        puzzle,
                        remainingWords: remainingWords.length > 0 ? shuffleArray(remainingWords) : [],
                        selectedWords: [],
                        solvedGroups: restoredGroups,
                        mistakesRemaining: saved.mistakesRemaining ?? MAX_MISTAKES,
                        guessedCombinations: saved.guessedCombinations || [],
                        gameStatus: saved.gameStatus,
                        message: null,
                    };
                }
            }
        } catch {
            return createInitialState(puzzle);
        }

        return createInitialState(puzzle);
    });

    // Helper to save state
    const saveState = useCallback((state: GameState) => {
        try {
            const saved = getSavedState(state);
            localStorage.setItem(
                STORAGE_PREFIX + puzzle.id,
                JSON.stringify(saved)
            );
        } catch {
            // localStorage might be full or unavailable
        }
    }, [puzzle.id]);

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

        // Create a set of solved category names for quick lookup
        const solvedCategories = new Set(
            gameState.solvedGroups.map((g) => g.category)
        );

        for (const group of puzzle.groups) {
            // Skip if this group is already solved (check by category)
            if (solvedCategories.has(group.category)) continue;

            // Check if all 4 words from the group are in the selected set
            const groupWordSet = new Set(group.words);
            const matches = group.words.filter((w) => selectedSet.has(w)).length;
            
            // Also verify that all selected words are in this group (exact match)
            const allSelectedInGroup = gameState.selectedWords.every((w) => groupWordSet.has(w));

            if (matches === 4 && allSelectedInGroup && gameState.selectedWords.length === 4) {
                matchedGroup = group;
                break;
            } else if (matches === 3) {
                oneAwayGroup = group;
            }
        }

        if (matchedGroup) {
            // Correct guess!
            const groupToAdd = matchedGroup; // Capture for closure
            setGameState((prev) => {
                // Keep groups in the order they were solved (don't sort)
                const newSolvedGroups = [...prev.solvedGroups, groupToAdd];
                const newRemainingWords = prev.remainingWords.filter(
                    (w) => !groupToAdd.words.includes(w)
                );
                const isWon = newSolvedGroups.length === 4;

                const newState = {
                    ...prev,
                    selectedWords: [],
                    solvedGroups: newSolvedGroups,
                    remainingWords: newRemainingWords,
                    gameStatus: isWon ? ("won" as const) : ("playing" as const),
                    message: isWon ? "Congratulations!" : null,
                };
                
                // Save state after correct guess
                saveState(newState);
                
                return newState;
            });
        } else {
            // Incorrect guess
            setGameState((prev) => {
                const newMistakes = prev.mistakesRemaining - 1;
                const isLost = newMistakes === 0;

                const newState = {
                    ...prev,
                    mistakesRemaining: newMistakes,
                    guessedCombinations: [...prev.guessedCombinations, prev.selectedWords],
                    gameStatus: isLost ? ("lost" as const) : ("playing" as const),
                    selectedWords: isLost ? [] : prev.selectedWords,
                };
                
                // Save state after incorrect guess
                saveState(newState);
                
                return newState;
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
        saveState,
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
        // Clear saved state
        try {
            localStorage.removeItem(STORAGE_PREFIX + puzzle.id);
        } catch {
            // Ignore
        }
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
