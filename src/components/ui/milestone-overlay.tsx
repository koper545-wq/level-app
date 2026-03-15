"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  show: boolean;
  type: "streak" | "level" | "boss";
  title: string;
  subtitle: string;
  xp?: number;
  coins?: number;
  onClose: () => void;
}

export function MilestoneOverlay({
  show,
  type,
  title,
  subtitle,
  xp,
  coins,
  onClose,
}: Props) {
  const icon = type === "streak" ? "\uD83D\uDD25" : type === "boss" ? "\u2694\uFE0F" : "\u2B06\uFE0F";
  const accentColor =
    type === "streak" ? "#C49A1A" : type === "boss" ? "#3D4FE0" : "#2E7D52";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="text-center max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 10 }}
              className="text-6xl mb-6"
            >
              {icon}
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-display mb-2"
              style={{ color: accentColor }}
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-foreground-secondary mb-6"
            >
              {subtitle}
            </motion.p>

            {(xp || coins) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                {xp && (
                  <span className="font-mono text-sm text-accent">
                    +{xp} XP
                  </span>
                )}
                {coins && (
                  <span className="font-mono text-sm text-warning">
                    +{coins} Coins
                  </span>
                )}
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onClose}
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              Zamknij
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
