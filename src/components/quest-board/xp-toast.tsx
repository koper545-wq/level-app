"use client";

import { motion } from "framer-motion";

interface Props {
  amount: number;
}

export function XPToast({ amount }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        animate={{ opacity: 0, y: -40 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-accent text-white px-4 py-2 rounded-full font-mono text-sm font-medium shadow-lg"
      >
        +{amount} XP
      </motion.div>
    </motion.div>
  );
}
