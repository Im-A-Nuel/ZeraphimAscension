"use client";

import { Sword, Gift, Feather, TrendingUp, ExternalLink, Clock } from "lucide-react";
import { buildExplorerTxUrl } from "@/lib/config";
import type { ActivityType } from "@/types";
import { useActivityStore } from "@/stores";
import styles from "./ActivityList.module.css";

interface ActivityListProps {
  locale: "en" | "zh";
}

const copy = {
  en: {
    loadingFeed: "Loading activity feed...",
    emptyTitle: "No activity yet",
    emptySubtitle: "Start completing quests to see your activity",
    title: "Recent Activity",
    liveFeed: "Live Feed",
    player: "Player",
    transaction: "Transaction",
    details: "Details",
    agoSeconds: "s ago",
    agoMinutes: "m ago",
    agoHours: "h ago",
    agoDays: "d ago",
    fallback: "Activity",
  },
  zh: {
    loadingFeed: "正在加载动态...",
    emptyTitle: "暂无动态",
    emptySubtitle: "开始完成任务即可看到动态记录",
    title: "近期动态",
    liveFeed: "实时流",
    player: "玩家",
    transaction: "交易",
    details: "详情",
    agoSeconds: "秒前",
    agoMinutes: "分钟前",
    agoHours: "小时前",
    agoDays: "天前",
    fallback: "动态",
  },
} as const;

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "QUEST":
      return <Sword size={18} strokeWidth={2.5} />;
    case "LOOT":
      return <Gift size={18} strokeWidth={2.5} />;
    case "MINT":
      return <Feather size={18} strokeWidth={2.5} />;
    case "EVOLVE":
      return <TrendingUp size={18} strokeWidth={2.5} />;
    default:
      return <Clock size={18} strokeWidth={2.5} />;
  }
};

const getActivityLabel = (type: ActivityType, locale: "en" | "zh") => {
  switch (type) {
    case "QUEST":
      return locale === "zh" ? "任务完成" : "Quest Completed";
    case "LOOT":
      return locale === "zh" ? "战利品箱开启" : "Lootbox Opened";
    case "MINT":
      return locale === "zh" ? "羽翼铸造" : "Wings Minted";
    case "EVOLVE":
      return locale === "zh" ? "羽翼进化" : "Wings Evolved";
    default:
      return locale === "zh" ? "动态" : "Activity";
  }
};

const formatTimestamp = (timestamp: string, locale: "en" | "zh") => {
  const ui = copy[locale];
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}${ui.agoDays}`;
  if (hours > 0) return `${hours}${ui.agoHours}`;
  if (minutes > 0) return `${minutes}${ui.agoMinutes}`;
  return `${Math.max(0, seconds)}${ui.agoSeconds}`;
};

export const ActivityList = ({ locale }: ActivityListProps) => {
  const items = useActivityStore((state) => state.items);
  const status = useActivityStore((state) => state.status);
  const ui = copy[locale];

  const isLoading = status === "loading";

  if (isLoading && items.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>{ui.loadingFeed}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <Clock size={48} strokeWidth={1.5} className={styles.emptyIcon} />
        <p className={styles.emptyText}>{ui.emptyTitle}</p>
        <p className={styles.emptySubtext}>{ui.emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className={styles.activityContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{ui.title}</h2>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          <span className={styles.liveText}>{ui.liveFeed}</span>
        </div>
      </div>

      <div className={styles.timeline}>
        {items.map((item, index) => (
          <div key={item.id} className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            {index < items.length - 1 && <div className={styles.timelineLine} />}

            <div className={styles.activityCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  {getActivityIcon(item.type)}
                </div>
                <div className={styles.cardTitle}>
                  <h3 className={styles.activityType}>{getActivityLabel(item.type, locale)}</h3>
                  <p className={styles.activityTime}>{formatTimestamp(item.createdAt, locale)}</p>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{ui.player}</span>
                  <span className={styles.infoValue}>
                    {item.address.slice(0, 6)}...{item.address.slice(-4)}
                  </span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{ui.transaction}</span>
                  <a
                    href={buildExplorerTxUrl(item.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.txLink}
                  >
                    <span>{item.txHash.slice(0, 8)}...{item.txHash.slice(-6)}</span>
                    <ExternalLink size={12} strokeWidth={2.5} />
                  </a>
                </div>

                {item.payload && Object.keys(item.payload).length > 0 && (
                  <div className={styles.payloadSection}>
                    <span className={styles.payloadLabel}>{ui.details}</span>
                    <div className={styles.payloadGrid}>
                      {Object.entries(item.payload).map(([key, value]) => (
                        <div key={key} className={styles.payloadItem}>
                          <span className={styles.payloadKey}>{key}</span>
                          <span className={styles.payloadValue}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.cardGlow} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.scanline} />
    </div>
  );
};
