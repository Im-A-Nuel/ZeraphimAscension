import type { UserStats } from "../types/index.js";

export const calculateScore = ({
  xp,
  shards,
  wingsTier,
  streakCount,
  questsCompletedTotal,
}: Pick<UserStats, "xp" | "shards" | "wingsTier" | "streakCount" | "questsCompletedTotal">): number => {
  const streakBonus = Math.min(Math.max(0, streakCount), 7) * 40;
  const consistencyBonus = Math.max(0, questsCompletedTotal) * 2;

  return Number((xp + shards * 0.2 + wingsTier * 200 + streakBonus + consistencyBonus).toFixed(2));
};

export const calculateLevel = (xp: number): number => {
  let level = 0;
  let threshold = 100;
  let remaining = Math.max(0, Math.trunc(xp));

  while (remaining >= threshold) {
    remaining -= threshold;
    threshold += 100;
    level += 1;
  }

  return level;
};
