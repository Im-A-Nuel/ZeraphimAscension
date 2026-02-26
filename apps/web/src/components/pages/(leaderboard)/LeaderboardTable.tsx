"use client";

import { Trophy, Medal, Crown, Award, Feather, Gem, Zap } from "lucide-react";
import { useAuthStore, useLeaderboardStore } from "@/stores";
import styles from "./LeaderboardTable.module.css";

interface LeaderboardTableProps {
  locale: "en" | "zh";
}

const copy = {
  en: {
    loadingRankings: "Loading rankings...",
    emptyTitle: "No rankings available yet",
    emptySubtitle: "Complete quests to climb the leaderboard",
    yourRank: "Your Rank",
    score: "Score",
    topPlayers: "Top Players",
    currentWeek: "Current Week",
    rank: "Rank",
    player: "Player",
    stats: "Stats",
    you: "YOU",
  },
  zh: {
    loadingRankings: "正在加载排名...",
    emptyTitle: "暂无排行榜数据",
    emptySubtitle: "完成任务即可冲击排行榜",
    yourRank: "我的排名",
    score: "分数",
    topPlayers: "顶尖玩家",
    currentWeek: "本周",
    rank: "排名",
    player: "玩家",
    stats: "统计",
    you: "你",
  },
} as const;

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown size={20} strokeWidth={2.5} />;
  if (rank === 2) return <Trophy size={18} strokeWidth={2.5} />;
  if (rank === 3) return <Medal size={18} strokeWidth={2.5} />;
  return <Award size={16} strokeWidth={2.5} />;
};

const getRankClass = (rank: number) => {
  if (rank === 1) return styles.rank1;
  if (rank === 2) return styles.rank2;
  if (rank === 3) return styles.rank3;
  return "";
};

export const LeaderboardTable = ({ locale }: LeaderboardTableProps) => {
  const address = useAuthStore((state) => state.address);
  const entries = useLeaderboardStore((state) => state.entries);
  const status = useLeaderboardStore((state) => state.status);
  const currentUserEntry = useLeaderboardStore((state) => state.currentUserEntry);
  const ui = copy[locale];
  const numberLocale = locale === "zh" ? "zh-CN" : "en-US";

  const isLoading = status === "loading";

  if (isLoading && entries.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>{ui.loadingRankings}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <Trophy size={48} strokeWidth={1.5} className={styles.emptyIcon} />
        <p className={styles.emptyText}>{ui.emptyTitle}</p>
        <p className={styles.emptySubtext}>{ui.emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className={styles.leaderboardContainer}>
      {currentUserEntry && (
        <div className={styles.userRankCard}>
          <div className={styles.userRankHeader}>
            <span className={styles.userRankLabel}>{ui.yourRank}</span>
            <div className={styles.userRankBadge}>
              {getRankIcon(currentUserEntry.rank)}
              <span className={styles.userRankValue}>#{currentUserEntry.rank}</span>
            </div>
          </div>
          <div className={styles.userRankStats}>
            <div className={styles.statItem}>
              <Zap size={14} strokeWidth={2.5} />
              <span>
                {ui.score}: {currentUserEntry.score.toLocaleString(numberLocale)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>{ui.topPlayers}</h2>
          <div className={styles.periodBadge}>
            <span className={styles.periodDot} />
            <span className={styles.periodText}>{ui.currentWeek}</span>
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div className={styles.columnRank}>{ui.rank}</div>
            <div className={styles.columnAddress}>{ui.player}</div>
            <div className={styles.columnScore}>{ui.score}</div>
            <div className={styles.columnStats}>{ui.stats}</div>
          </div>

          <div className={styles.tableBody}>
            {entries.slice(0, 10).map((entry) => {
              const isCurrentUser = entry.address === address;
              return (
                <div
                  key={`${entry.period}-${entry.address}`}
                  className={`${styles.tableRow} ${getRankClass(entry.rank)} ${isCurrentUser ? styles.currentUser : ""}`}
                >
                  <div className={styles.columnRank}>
                    <div className={styles.rankBadge}>
                      {getRankIcon(entry.rank)}
                      <span className={styles.rankNumber}>#{entry.rank}</span>
                    </div>
                  </div>

                  <div className={styles.columnAddress}>
                    <div className={styles.addressBox}>
                      <span className={styles.addressText}>
                        {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                      </span>
                      {isCurrentUser && <span className={styles.youBadge}>{ui.you}</span>}
                    </div>
                  </div>

                  <div className={styles.columnScore}>
                    <div className={styles.scoreValue}>{entry.score.toLocaleString(numberLocale)}</div>
                  </div>

                  <div className={styles.columnStats}>
                    <div className={styles.statChips}>
                      <div className={styles.statChip}>
                        <Feather size={12} strokeWidth={2.5} />
                        <span>T{Math.floor(entry.score / 1000) % 4}</span>
                      </div>
                      <div className={styles.statChip}>
                        <Gem size={12} strokeWidth={2.5} />
                        <span>{Math.floor((entry.score % 1000) / 5)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.rowGlow} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.scanline} />
    </div>
  );
};
