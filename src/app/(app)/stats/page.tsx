import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WeeklyChart } from "@/components/stats/weekly-chart";
import { StreakHeatmap } from "@/components/stats/streak-heatmap";
import { AreaBreakdown } from "@/components/stats/area-breakdown";
import { StatsSummary } from "@/components/stats/stats-summary";
import Link from "next/link";

export default async function StatsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch data for stats
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const [
    { data: xpLog },
    { data: streakLog },
    { data: completedTasks },
    { data: areas },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("xp_log")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("streak_log")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true }),
    supabase
      .from("tasks")
      .select("*, area:areas(*)")
      .eq("user_id", user.id)
      .eq("status", "done")
      .gte("completed_at", thirtyDaysAgo.toISOString())
      .order("completed_at", { ascending: true }),
    supabase.from("areas").select("*").eq("user_id", user.id).eq("is_active", true),
    supabase.from("users").select("*").eq("id", user.id).single(),
  ]);

  return (
    <div className="pb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-foreground-secondary hover:text-foreground transition-colors py-2"
      >
        &larr; Powrot
      </Link>

      <h2 className="text-2xl font-display mt-2 mb-6">Statystyki</h2>

      <StatsSummary
        profile={profile}
        completedTasks={completedTasks ?? []}
        xpLog={xpLog ?? []}
      />

      <WeeklyChart xpLog={xpLog ?? []} />

      <AreaBreakdown
        completedTasks={completedTasks ?? []}
        areas={areas ?? []}
      />

      <StreakHeatmap streakLog={streakLog ?? []} />
    </div>
  );
}
