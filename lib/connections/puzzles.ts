import type { Puzzle } from "./types";

// Get all words from a puzzle (flattened and shuffled)
export function getAllWords(puzzle: Puzzle): string[] {
    const words = puzzle.groups.flatMap((group) => group.words);
    return shuffleArray(words);
}

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
