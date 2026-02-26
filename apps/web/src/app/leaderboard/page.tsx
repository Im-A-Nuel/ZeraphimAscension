"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { LeaderboardTable } from "@/components/pages/(leaderboard)";
import { useAuthStore, useLeaderboardStore, useUiStore } from "@/stores";
import styles from "./page.module.css";

const copy = {
  en: {
    backToDashboard: "Back to Dashboard",
    title: "Leaderboard",
    subtitle: "Competitive Rankings",
  },
  zh: {
    backToDashboard: "返回仪表盘",
    title: "排行榜",
    subtitle: "竞技排名",
  },
} as const;

export default function LeaderboardPage() {
  const address = useAuthStore((state) => state.address);
  const locale = useUiStore((state) => state.locale);
  const fetchLeaderboard = useLeaderboardStore((state) => state.fetchLeaderboard);
  const fetchUserRank = useLeaderboardStore((state) => state.fetchUserRank);
  const ui = copy[locale];

  useEffect(() => {
    void fetchLeaderboard("current", 100);
    if (address) {
      void fetchUserRank(address, "current");
    }
  }, [address, fetchLeaderboard, fetchUserRank]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/dashboard" className={styles.backLink}>
              <ArrowLeft size={16} strokeWidth={2.5} />
              <span>{ui.backToDashboard}</span>
            </Link>
            <div>
              <h1 className={styles.pageTitle}>{ui.title}</h1>
              <p className={styles.pageSubtitle}>{ui.subtitle}</p>
            </div>
          </div>
        </div>
        <div className={styles.headerGlow} />
      </header>

      <div className={styles.content}>
        <LeaderboardTable locale={locale} />
      </div>
    </main>
  );
}
