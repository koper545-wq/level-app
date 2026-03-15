"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { useTaskStore } from "@/stores/task-store";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsPage() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const tasks = useTaskStore((s) => s.tasks);
  const { theme, setTheme } = useTheme();
  const [exporting, setExporting] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleExportCSV() {
    setExporting(true);
    const supabase = createClient();

    const { data: allTasks } = await supabase
      .from("tasks")
      .select("title, status, difficulty, xp_value, scheduled_date, completed_at, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (allTasks && allTasks.length > 0) {
      const headers = Object.keys(allTasks[0]).join(",");
      const rows = allTasks.map((t) =>
        Object.values(t)
          .map((v) => `"${v ?? ""}"`)
          .join(",")
      );
      const csv = [headers, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `level-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setExporting(false);
  }

  return (
    <div>
      <h2 className="text-2xl mb-6 font-display">Ustawienia</h2>

      <div className="space-y-3">
        {/* Profile */}
        {user && (
          <div className="p-4 bg-surface border border-border rounded-card">
            <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-1">
              Profil
            </p>
            <p className="text-sm">{user.display_name || user.email}</p>
            <p className="text-xs text-foreground-secondary">{user.email}</p>
          </div>
        )}

        {/* Theme */}
        <div className="p-4 bg-surface border border-border rounded-card">
          <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-3">
            Motyw
          </p>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 text-xs py-2 rounded-card transition-colors ${
                  theme === t
                    ? "bg-foreground text-background"
                    : "bg-background border border-border text-foreground-secondary"
                }`}
              >
                {t === "light" ? "Jasny" : t === "dark" ? "Ciemny" : "System"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {user && (
          <div className="p-4 bg-surface border border-border rounded-card">
            <p className="text-xs text-foreground-secondary uppercase tracking-wider mb-2">
              Statystyki
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-foreground-secondary">Wszystkie taski: </span>
                <span className="font-mono">{tasks.length}</span>
              </div>
              <div>
                <span className="text-foreground-secondary">XP calkowite: </span>
                <span className="font-mono">{user.xp_total}</span>
              </div>
              <div>
                <span className="text-foreground-secondary">Najdluzszy streak: </span>
                <span className="font-mono">{user.streak_longest} dni</span>
              </div>
              <div>
                <span className="text-foreground-secondary">Coins: </span>
                <span className="font-mono">{user.coins}</span>
              </div>
            </div>
          </div>
        )}

        {/* Export */}
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="w-full text-left p-4 bg-surface border border-border rounded-card text-sm hover:border-foreground-secondary/30 transition-colors"
        >
          {exporting ? "Eksportowanie..." : "Eksportuj dane (CSV)"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full text-left p-4 bg-surface border border-border rounded-card text-sm text-red-500 hover:border-red-500/30 transition-colors"
        >
          Wyloguj sie
        </button>
      </div>
    </div>
  );
}
