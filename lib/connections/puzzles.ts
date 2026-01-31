import type { Puzzle } from "./types";

// Sample puzzles for the Connections game
export const PUZZLES: Puzzle[] = [
    {
        id: "2024-01-31",
        date: "2024-01-31",
        groups: [
            {
                category: "PARTY TYPES",
                words: ["BALL", "MIXER", "RECEPTION", "SHOWER"],
                difficulty: "yellow",
            },
            {
                category: "THINGS WITH DRUMS",
                words: ["DRYER", "EAR", "KIT", "WASHING MACHINE"],
                difficulty: "green",
            },
            {
                category: "_____ ROLL",
                words: ["BARREL", "HONOR", "ROCK AND", "TOILET PAPER"],
                difficulty: "blue",
            },
            {
                category: "FASHION DESIGNERS",
                words: ["BANKS", "JACOBS", "KORS", "WANG"],
                difficulty: "purple",
            },
        ],
    },
    {
        id: "2024-02-01",
        date: "2024-02-01",
        groups: [
            {
                category: "UNITS OF MEASUREMENT",
                words: ["CUP", "FOOT", "POUND", "YARD"],
                difficulty: "yellow",
            },
            {
                category: "THINGS THAT ARE ROUND",
                words: ["BALL", "GLOBE", "PIZZA", "WHEEL"],
                difficulty: "green",
            },
            {
                category: "___ CREAM",
                words: ["ICE", "SHAVING", "SOUR", "WHIPPED"],
                difficulty: "blue",
            },
            {
                category: "FAMOUS MICHAELS",
                words: ["JACKSON", "JORDAN", "PHELPS", "TYSON"],
                difficulty: "purple",
            },
        ],
    },
    {
        id: "2024-02-02",
        date: "2024-02-02",
        groups: [
            {
                category: "BREAKFAST FOODS",
                words: ["BACON", "EGGS", "PANCAKES", "TOAST"],
                difficulty: "yellow",
            },
            {
                category: "CARD GAMES",
                words: ["BRIDGE", "POKER", "RUMMY", "SPADES"],
                difficulty: "green",
            },
            {
                category: "TYPES OF KEYS",
                words: ["CAR", "HOUSE", "PIANO", "SKELETON"],
                difficulty: "blue",
            },
            {
                category: "_____ STONE",
                words: ["COBBLE", "KIDNEY", "ROLLING", "STEPPING"],
                difficulty: "purple",
            },
        ],
    },
];

// Get today's puzzle (deterministic - uses date to pick a consistent puzzle)
export function getTodaysPuzzle(): Puzzle {
    const today = new Date().toISOString().split("T")[0];
    const todaysPuzzle = PUZZLES.find((p) => p.date === today);
    if (todaysPuzzle) return todaysPuzzle;
    
    // Use a deterministic selection based on the date (not random)
    // This ensures the same puzzle is returned for the same day
    const dateHash = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return PUZZLES[dateHash % PUZZLES.length];
}

// Get puzzle by ID
export function getPuzzleById(id: string): Puzzle | undefined {
    return PUZZLES.find((p) => p.id === id);
}

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
