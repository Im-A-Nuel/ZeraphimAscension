"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Quest } from "@/types";
import { useQuestStore } from "@/stores";
import styles from "./QuestCard.module.css";

interface QuestCardProps {
  quest: Quest;
  locale: "en" | "zh";
  isPending: boolean;
  onComplete: (questId: number) => void;
}

const copy = {
  en: {
    shards: "Shards",
    tickets: "Tickets",
    completed: "Completed",
    processing: "Processing...",
    executeMission: "Execute Mission",
    cooldown: "Ready in",
  },
  zh: {
    shards: "碎片",
    tickets: "券",
    completed: "已完成",
    processing: "处理中...",
    executeMission: "执行任务",
    cooldown: "冷却中",
  },
} as const;

const questTitleZh: Record<string, string> = {
  "Aegis Patrol": "神盾巡逻",
  "Sanctum Breach": "圣域突袭",
  "Archive Cipher": "秘典解码",
  "Oracle Alignment": "神谕校准",
  "Mercy Circuit": "怜悯回路",
  "Resonance Rite": "共鸣仪式",
};

const questDescZh: Record<string, string> = {
  "Clear hostile zones and secure divine relays.": "清除敌对区域并守护神圣中继。",
  "Lead a strike and claim strategic control points.": "发起突击并夺取战略控制点。",
  "Decode corrupted archives to recover elder knowledge.": "解码受损档案，恢复远古知识。",
  "Stabilize oracle channels for tactical foresight.": "稳定神谕通道以获取战术先见。",
  "Restore shrines and reinforce citizen sanctuaries.": "修复神殿并强化居民庇护所。",
  "Perform a rite to strengthen streak continuity.": "执行仪式以强化连击延续。",
};

const formatCountdown = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
};

const getRemainingSeconds = (completedAt: string, cooldownSeconds: number): number => {
  const elapsed = Math.floor((Date.now() - new Date(completedAt).getTime()) / 1000);
  return Math.max(0, cooldownSeconds - elapsed);
};

export const QuestCard = ({ quest, locale, isPending, onComplete }: QuestCardProps) => {
  const resetQuestCooldown = useQuestStore((state) => state.resetQuestCooldown);
  const ui = copy[locale];
  const title = locale === "zh" ? (questTitleZh[quest.title] ?? quest.title) : quest.title;
  const description =
    locale === "zh" ? (questDescZh[quest.description] ?? quest.description) : quest.description;

  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!quest.completed || !quest.completedAt || !quest.cooldownSeconds) {
      setSecondsLeft(0);
      return;
    }

    const remaining = getRemainingSeconds(quest.completedAt, quest.cooldownSeconds);
    setSecondsLeft(remaining);

    if (remaining === 0) {
      resetQuestCooldown(quest.id);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          resetQuestCooldown(quest.id);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quest.completed, quest.completedAt, quest.cooldownSeconds, quest.id, resetQuestCooldown]);

  const isOnCooldown = quest.completed && secondsLeft > 0;
  const cooldownProgress =
    quest.cooldownSeconds && quest.completedAt
      ? Math.max(0, Math.min(100, (secondsLeft / quest.cooldownSeconds) * 100))
      : 0;

  return (
    <article className={`${styles.questCard} ${isOnCooldown ? styles.onCooldown : ""}`}>
      <div className={styles.questHeader}>
        <h3 className={styles.questTitle}>{title}</h3>
        {isOnCooldown && (
          <span className={styles.completedBadge}>
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>

      <p className={styles.questDesc}>{description}</p>

      <div className={styles.rewards}>
        <div className={styles.rewardItem}>
          <span className={styles.rewardLabel}>XP</span>
          <span className={styles.rewardValue}>+{quest.xpReward}</span>
        </div>
        <div className={styles.rewardItem}>
          <span className={styles.rewardLabel}>{ui.shards}</span>
          <span className={styles.rewardValue}>+{quest.shardsReward}</span>
        </div>
        <div className={styles.rewardItem}>
          <span className={styles.rewardLabel}>{ui.tickets}</span>
          <span className={styles.rewardValue}>+{quest.lootTicketReward}</span>
        </div>
      </div>

      {isOnCooldown ? (
        <div className={styles.cooldownWrap}>
          <div className={styles.cooldownTrack}>
            <div
              className={styles.cooldownBar}
              style={{ width: `${cooldownProgress}%` }}
            />
          </div>
          <span className={styles.cooldownLabel}>
            {ui.cooldown} {formatCountdown(secondsLeft)}
          </span>
        </div>
      ) : (
        <button
          className={styles.questBtn}
          type="button"
          disabled={isPending}
          onClick={() => {
            if (quest.completed) {
              resetQuestCooldown(quest.id);
            }
            onComplete(quest.id);
          }}
        >
          {isPending ? ui.processing : ui.executeMission}
        </button>
      )}

      <div className={styles.questGlow} />
    </article>
  );
};
