"use client";

import { motion } from "framer-motion";

interface Props {
  color: string;
  /** Number of active days in last 7 */
  activeDays: number;
  name: string;
}

export function HealthBar({ color, activeDays, name }: Props) {
  // 0 days = empty, 1-2 = fading, 3-4 = partial, 5-7 = full
  const percent = Math.round((activeDays / 7) * 100);
  const opacity = activeDays === 0 ? 0.15 : activeDays <= 2 ? 0.4 : activeDays <= 4 ? 0.7 : 1;

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full transition-opacity duration-500"
        style={{ backgroundColor: color, opacity }}
      />
      <span className="text-[10px] text-foreground-secondary w-20 truncate">
        {name}
      </span>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, opacity }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] font-mono text-foreground-secondary w-4 text-right">
        {activeDays}
      </span>
    </div>
  );
}
