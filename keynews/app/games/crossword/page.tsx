import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CrosswordGame } from "@/components/crossword/crossword-game";
import puzzleData from "@/lib/crossword/sample-puzzle.json";
import type { PuzzleData } from "@/lib/crossword/types";

export default async function CrosswordPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-svh py-8">
      <CrosswordGame puzzle={puzzleData as PuzzleData} />
    </main>
  );
}
