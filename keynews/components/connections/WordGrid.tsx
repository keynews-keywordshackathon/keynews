"use client";

import { WordTile } from "./WordTile";

interface WordGridProps {
    words: string[];
    selectedWords: string[];
    onWordClick: (word: string) => void;
    disabled?: boolean;
}

export function WordGrid({
    words,
    selectedWords,
    onWordClick,
    disabled,
}: WordGridProps) {
    return (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-xl mx-auto">
            {words.map((word) => (
                <WordTile
                    key={word}
                    word={word}
                    isSelected={selectedWords.includes(word)}
                    onClick={() => onWordClick(word)}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}
