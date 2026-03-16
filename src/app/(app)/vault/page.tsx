"use client";

import { useUserStore } from "@/stores/user-store";
import { getXPProgress } from "@/lib/xp";
import { LEVEL_THRESHOLDS } from "@/lib/constants";
import { RewardsShop } from "@/components/vault/rewards-shop";
import { StreakBadge } from "@/components/ui/streak-badge";

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
      <h2 className="text-2xl mb-6 font-display">Vault</h2>

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

      {/* Savings Card */}
      {user.savings_total > 0 && (
        <div className="bg-surface border border-[#C49A1A]/30 rounded-card p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-foreground-secondary uppercase tracking-wider">
                Zaoszczedzone
              </p>
              <p className="text-3xl font-mono font-medium text-[#C49A1A]">
                {user.savings_total} <span className="text-lg">PLN</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-foreground-secondary uppercase tracking-wider">
                Bonus coins
              </p>
              <p className="text-lg font-mono text-warning">
                +{user.savings_total}
              </p>
            </div>
          </div>
        </div>
      )}

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
          <StreakBadge count={user.streak_current} shields={user.streak_shields} />
          <p className="text-[10px] text-foreground-secondary uppercase tracking-wider mt-1">
            Streak
          </p>
        </div>
      </div>

      {/* Rewards Shop */}
      <RewardsShop userCoins={user.coins} userId={user.id} />
    </div>
  );
}
