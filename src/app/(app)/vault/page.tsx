"use client";

import { useUserStore } from "@/stores/user-store";
import { getXPProgress } from "@/lib/xp";
import { LEVEL_THRESHOLDS } from "@/lib/constants";

export default function VaultPage() {
  const user = useUserStore((s) => s.user);

  if (!user) return null;

  const { currentLevel, nextLevelXP, progressPercent } =
    getXPProgress(user.xp_total);
  const nextThreshold = LEVEL_THRESHOLDS.find(
    (t) => t.level === currentLevel + 1
  );

  return (
    <div>
      <h2
        className="text-2xl mb-6 font-display"
      >
        Vault
      </h2>

      {/* Level Card */}
      <div className="bg-surface border border-border rounded-card p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-foreground-secondary uppercase tracking-wider">
              Level
            </p>
            <p className="text-4xl font-mono font-medium">{currentLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground-secondary uppercase tracking-wider">
              XP
            </p>
            <p className="font-mono text-lg">
              {user.xp_total}
              <span className="text-foreground-secondary">
                /{nextLevelXP === Infinity ? "MAX" : nextLevelXP}
              </span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {nextThreshold && (
          <p className="text-xs text-foreground-secondary mt-2">
            Nastepne odblokowanie: {nextThreshold.unlock}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-card p-4 text-center">
          <p className="font-mono text-xl font-medium text-accent">
            {user.xp_season}
          </p>
          <p className="text-[10px] text-foreground-secondary uppercase tracking-wider mt-1">
            XP Sezon
          </p>
        </div>
        <div className="bg-surface border border-border rounded-card p-4 text-center">
          <p className="font-mono text-xl font-medium text-warning">
            {user.coins}
          </p>
          <p className="text-[10px] text-foreground-secondary uppercase tracking-wider mt-1">
            Coins
          </p>
        </div>
        <div className="bg-surface border border-border rounded-card p-4 text-center">
          <p className="font-mono text-xl font-medium">
            {user.streak_current}
          </p>
          <p className="text-[10px] text-foreground-secondary uppercase tracking-wider mt-1">
            Streak
          </p>
        </div>
      </div>

      {/* Rewards placeholder */}
      <div className="bg-surface border border-border rounded-card p-6 text-center">
        <p className="text-foreground-secondary text-sm">
          Sklep nagrod
        </p>
        <p className="text-foreground-secondary text-xs mt-1">
          Wkrotce dostepny
        </p>
      </div>
    </div>
  );
}
