"use client";

import { motion } from "framer-motion";

interface Props {
  count: number;
  shields: number;
}

export function StreakBadge({ count, shields }: Props) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <motion.div
        key={count}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1"
      >
        <span className="text-base">{"\uD83D\uDD25"}</span>
        <span className="font-mono text-sm font-medium">{count}</span>
      </motion.div>

      {/* Shield indicators */}
      <div className="flex gap-0.5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < shields ? "bg-accent/60" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
