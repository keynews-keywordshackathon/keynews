// Connections game type definitions

export type Difficulty = "yellow" | "green" | "blue" | "purple";

export interface WordGroup {
    category: string;
    words: string[];
    difficulty: Difficulty;
    clue?: string;
}

export interface Puzzle {
    id: string;
    date?: string;
    groups: WordGroup[];
}

export interface GameState {
    puzzle: Puzzle;
    remainingWords: string[];
    selectedWords: string[];
    solvedGroups: WordGroup[];
    mistakesRemaining: number;
    guessedCombinations: string[][]; // Track already guessed combinations
    gameStatus: "playing" | "won" | "lost";
    message: string | null; // For "One away!" etc.
}

// Color mappings for difficulty levels
export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
    yellow: "#f9df6d",
    green: "#a0c35a",
    blue: "#b0c4ef",
    purple: "#ba81c5",
};

// Difficulty order for sorting solved groups
export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
    yellow: 0,
    green: 1,
    blue: 2,
    purple: 3,
};
