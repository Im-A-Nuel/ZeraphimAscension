import { Sword, Diamond, Sparkles } from "lucide-react";
import { AssetIcon } from "@/components/ui";
import { iconSlots } from "@/lib/assets/iconSlots";
import type { Quest } from "@/types";
import { QuestCard } from "./QuestCard";
import styles from "./QuestBoard.module.css";

interface QuestBoardProps {
  quests: Quest[];
  isPending: boolean;
  onComplete: (questId: number) => void;
  locale: "en" | "zh";
}

const paths: Array<Quest["path"]> = ["valor", "wisdom", "grace"];

const copy = {
  en: {
    title: "Mission Control",
    activeMissions: "Active Missions",
    pathValor: "Path of Valor",
    pathWisdom: "Path of Wisdom",
    pathGrace: "Path of Grace",
  },
  zh: {
    title: "任务控制",
    activeMissions: "进行中任务",
    pathValor: "勇武之路",
    pathWisdom: "智慧之路",
    pathGrace: "恩典之路",
  },
} as const;

export const QuestBoard = ({ quests, isPending, onComplete, locale }: QuestBoardProps) => {
  const ui = copy[locale];
  const pathConfig = {
    valor: { label: ui.pathValor, Icon: Sword, iconPath: iconSlots.pathValor },
    wisdom: { label: ui.pathWisdom, Icon: Diamond, iconPath: iconSlots.pathWisdom },
    grace: { label: ui.pathGrace, Icon: Sparkles, iconPath: iconSlots.pathGrace },
  };

  return (
    <section className={styles.questBoard}>
      <div className={styles.header}>
        <h2 className={styles.title}>{ui.title}</h2>
        <div className={styles.statusBadge}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>{ui.activeMissions}</span>
        </div>
      </div>

      <div className={styles.pathsGrid}>
        {paths.map((path) => {
          const pathQuests = quests.filter((quest) => quest.path === path);
          const completedCount = pathQuests.filter((q) => q.completed).length;
          const PathIcon = pathConfig[path].Icon;

          return (
            <div key={path} className={styles.pathColumn}>
              <div className={styles.pathHeader}>
                <span className={styles.pathIcon}>
                  <AssetIcon
                    src={pathConfig[path].iconPath}
                    alt={pathConfig[path].label}
                    fallback={<PathIcon size={18} strokeWidth={2.5} />}
                  />
                </span>
                <h3 className={styles.pathTitle}>{pathConfig[path].label}</h3>
                <span className={styles.pathProgress}>
                  {completedCount}/{pathQuests.length}
                </span>
              </div>

              <div className={styles.questList}>
                {pathQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    locale={locale}
                    isPending={isPending}
                    onComplete={onComplete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.scanline} />
    </section>
  );
};
