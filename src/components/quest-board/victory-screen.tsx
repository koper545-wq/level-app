"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/stores/user-store";
import { getXPProgress } from "@/lib/xp";

interface Props {
  xpEarned: number;
  onClose: () => void;
}

export function VictoryScreen({ xpEarned, onClose }: Props) {
  const user = useUserStore((s) => s.user);

  if (!user) return null;

  const { currentLevel, progressPercent } = getXPProgress(user.xp_total);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 20 }}
        className="text-center max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", damping: 15 }}
          className="text-6xl mb-6"
        >
          &#10003;
        </motion.div>

        <h2
          className="text-3xl mb-2 font-display"
        >
          Wszystko zrobione
        </h2>

        <p className="text-foreground-secondary text-sm mb-8">
          Kolejny dobry dzien za Toba
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <p className="font-mono text-xl font-medium text-accent">
              +{xpEarned}
            </p>
            <p className="text-[10px] text-foreground-secondary uppercase tracking-wide">
              XP dzis
            </p>
          </div>
          <div>
            <p className="font-mono text-xl font-medium">
              {user.streak_current}
            </p>
            <p className="text-[10px] text-foreground-secondary uppercase tracking-wide">
              Streak
            </p>
          </div>
          <div>
            <p className="font-mono text-xl font-medium">
              LVL {currentLevel}
            </p>
            <p className="text-[10px] text-foreground-secondary uppercase tracking-wide">
              {progressPercent}%
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
        >
          Zamknij
        </button>
      </motion.div>
    </motion.div>
  );
}
