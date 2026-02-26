"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { ActivityList } from "@/components/pages/(activity)";
import { useActivityStore, useAuthStore, useUiStore } from "@/stores";
import styles from "./page.module.css";

const copy = {
  en: {
    backToDashboard: "Back to Dashboard",
    title: "Activity Feed",
    subtitle: "Transaction History",
  },
  zh: {
    backToDashboard: "返回仪表盘",
    title: "动态记录",
    subtitle: "交易历史",
  },
} as const;

export default function ActivityPage() {
  const address = useAuthStore((state) => state.address);
  const locale = useUiStore((state) => state.locale);
  const fetchRecent = useActivityStore((state) => state.fetchRecent);
  const fetchUserActivities = useActivityStore((state) => state.fetchUserActivities);
  const ui = copy[locale];

  useEffect(() => {
    if (address) {
      void fetchUserActivities(address, 50);
      return;
    }

    void fetchRecent(50);
  }, [address, fetchRecent, fetchUserActivities]);

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
        <ActivityList locale={locale} />
      </div>
    </main>
  );
}
