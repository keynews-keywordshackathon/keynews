import "server-only";
import fs from "fs/promises";
import path from "path";
import type { Puzzle } from "./types";

// Server-side function to get today's puzzle
// This reads the JSON file directly for use in server components
export async function getTodaysPuzzle(): Promise<Puzzle> {
    try {
        const filePath = path.join(process.cwd(), "public", "daily-puzzle.json");
        const fileContent = await fs.readFile(filePath, "utf-8");
        const puzzle = JSON.parse(fileContent) as Puzzle;
        return puzzle;
    } catch (error) {
        console.error("Error reading daily puzzle from file:", error);
        return {
            id: "fallback",
            date: new Date().toISOString().split("T")[0],
            groups: []
        };
    }
}
