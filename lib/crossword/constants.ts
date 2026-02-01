export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const CELL_SIZE = 56;

export const NAVIGATION_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Tab",
  " ",
  "Backspace",
  "Delete",
]);

export function isLetterKey(key: string): boolean {
  return /^[a-zA-Z]$/.test(key);
}
