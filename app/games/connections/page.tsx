import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConnectionsGame } from "@/components/connections/ConnectionsGame";
import { getTodaysPuzzle } from "@/lib/connections/puzzles.server";

export default async function ConnectionsPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
        redirect("/auth/login");
    }

    const puzzle = await getTodaysPuzzle();

    return (
        <main className="min-h-svh py-8 bg-white">
            <ConnectionsGame puzzle={puzzle} />
        </main>
    );
}
