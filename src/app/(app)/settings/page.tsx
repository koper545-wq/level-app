"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div>
      <h2
        className="text-2xl mb-6 font-display"
      >
        Ustawienia
      </h2>

      <div className="space-y-3">
        <button
          onClick={handleLogout}
          className="w-full text-left p-4 bg-surface border border-border rounded-card text-sm hover:border-foreground-secondary/30 transition-colors"
        >
          Wyloguj sie
        </button>
      </div>
    </div>
  );
}
