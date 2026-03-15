"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/user-store";
import { motion, AnimatePresence } from "framer-motion";
import type { Reward } from "@/types";

interface Props {
  userCoins: number;
  userId: string;
}

export function RewardsShop({ userCoins, userId }: Props) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCost, setNewCost] = useState("");
  const spendCoins = useUserStore((s) => s.spendCoins);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("rewards")
      .select("*")
      .eq("user_id", userId)
      .eq("is_redeemed", false)
      .order("created_at")
      .then(({ data }) => {
        if (data) setRewards(data);
      });
  }, [userId]);

  async function handleAddReward(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newCost) return;

    const supabase = createClient();
    const { data } = await supabase
      .from("rewards")
      .insert({
        user_id: userId,
        title: newTitle.trim(),
        coins_cost: parseInt(newCost),
      })
      .select()
      .single();

    if (data) {
      setRewards([...rewards, data]);
      setNewTitle("");
      setNewCost("");
      setShowAdd(false);
    }
  }

  async function handleRedeem(reward: Reward) {
    const success = spendCoins(reward.coins_cost);
    if (!success) return;

    const supabase = createClient();
    await supabase
      .from("rewards")
      .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
      .eq("id", reward.id);

    await supabase.from("reward_redemptions").insert({
      user_id: userId,
      reward_id: reward.id,
      coins_spent: reward.coins_cost,
    });

    setRewards(rewards.filter((r) => r.id !== reward.id));
  }

  async function handleDelete(rewardId: string) {
    const supabase = createClient();
    await supabase.from("rewards").delete().eq("id", rewardId);
    setRewards(rewards.filter((r) => r.id !== rewardId));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-wider text-foreground-secondary font-medium">
          Nagrody
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-accent hover:underline"
        >
          + Dodaj nagrode
        </button>
      </div>

      {/* Add reward form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddReward}
            className="overflow-hidden mb-3"
          >
            <div className="bg-surface border border-border rounded-card p-4 space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nazwa nagrody"
                autoFocus
                className="w-full px-3 py-2 bg-background border border-border rounded-card text-sm focus:outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  placeholder="Koszt (Coins)"
                  min="1"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-card text-sm focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newCost}
                  className="px-4 py-2 bg-accent text-white rounded-card text-sm font-medium disabled:opacity-50"
                >
                  Dodaj
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Rewards list */}
      {rewards.length === 0 ? (
        <div className="bg-surface border border-border rounded-card p-6 text-center">
          <p className="text-foreground-secondary text-sm">
            Brak nagrod
          </p>
          <p className="text-foreground-secondary text-xs mt-1">
            Dodaj nagrode za ktora bedziesz pracowac
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {rewards.map((reward) => {
              const canAfford = userCoins >= reward.coins_cost;
              return (
                <motion.div
                  key={reward.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-surface border border-border rounded-card p-4 flex items-center gap-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{reward.title}</p>
                    <p className="text-xs font-mono text-warning">
                      {reward.coins_cost} Coins
                    </p>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`text-xs px-3 py-1.5 rounded-card font-medium transition-all ${
                      canAfford
                        ? "bg-success text-white hover:opacity-90"
                        : "bg-border text-foreground-secondary cursor-not-allowed"
                    }`}
                  >
                    {canAfford ? "Odbierz" : "Za malo"}
                  </button>

                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="text-foreground-secondary hover:text-foreground text-xs"
                  >
                    &times;
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
