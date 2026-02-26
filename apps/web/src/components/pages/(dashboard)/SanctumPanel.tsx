import Link from "next/link";
import { Shield } from "lucide-react";
import { AssetIcon } from "@/components/ui";
import { iconSlots } from "@/lib/assets/iconSlots";
import type { ActivityItem, UserStats } from "@/types";
import styles from "./SanctumPanel.module.css";

interface SanctumPanelProps {
  user: UserStats | null;
  locale: "en" | "zh";
  activities: ActivityItem[];
}

const copy = {
  en: {
    title: "Sanctum Relay",
    status: "Oracle Online",
    objective: "Next Ascension",
    shards: "Shards",
    quests: "Quests",
    streak: "Streak",
    challengeTitle: "Ascension Challenges",
    challengeHint: "Complete objectives to maintain leaderboard momentum.",
    challengeDone: "Completed",
    activityFeed: "Activity Feed",
    leaderboard: "Leaderboard",
  },
  zh: {
    title: "Sanctum Relay",
    status: "Oracle Online",
    objective: "Next Ascension",
    shards: "Shards",
    quests: "Quests",
    streak: "Streak",
    challengeTitle: "Ascension Challenges",
    challengeHint: "Complete objectives to maintain leaderboard momentum.",
    challengeDone: "Completed",
    activityFeed: "Activity Feed",
    leaderboard: "Leaderboard",
  },
} as const;

interface ChallengeObjective {
  key: string;
  title: string;
  hint: string;
  current: number;
  target: number;
}

const LAST_24H_MS = 24 * 60 * 60 * 1000;

const getAscensionTarget = (
  user: UserStats | null,
): { title: string; detail: string } => {
  const wingsTier = user?.wingsTier ?? 0;
  const shards = user?.shards ?? 0;
  const quests = user?.questsCompletedTotal ?? 0;

  if (wingsTier <= 0) {
    return {
      title: "Awaken Wings",
      detail: "Mint your first wings to activate the Ascension chain.",
    };
  }

  if (wingsTier === 1) {
    const shardNeeded = Math.max(0, 200 - shards);
    const questNeeded = Math.max(0, 3 - quests);

    if (shardNeeded === 0 && questNeeded === 0) {
      return {
        title: "Tier 2 Ready",
        detail: "All requirements complete. Execute evolution in Wings Evolution.",
      };
    }

    return {
      title: "Tier 2 Protocol",
      detail: `${shardNeeded} shards and ${questNeeded} quest completions remaining.`,
    };
  }

  if (wingsTier === 2) {
    const shardNeeded = Math.max(0, 500 - shards);
    const questNeeded = Math.max(0, 8 - quests);

    if (shardNeeded === 0 && questNeeded === 0) {
      return {
        title: "Tier 3 Ready",
        detail: "Seraphim threshold reached. Execute final evolution.",
      };
    }

    return {
      title: "Tier 3 Protocol",
      detail: `${shardNeeded} shards and ${questNeeded} quest completions remaining.`,
    };
  }

  return {
    title: "Ascension Complete",
    detail: "Transcendent wings online. Focus on quests for leaderboard dominance.",
  };
};

const countRecentActivity = (activities: ActivityItem[], type: ActivityItem["type"]): number => {
  const now = Date.now();
  return activities.filter((activity) => {
    if (activity.type !== type) {
      return false;
    }

    const createdAtMs = new Date(activity.createdAt).getTime();
    return Number.isFinite(createdAtMs) && now - createdAtMs <= LAST_24H_MS;
  }).length;
};

const buildChallenges = (user: UserStats | null, activities: ActivityItem[]): ChallengeObjective[] => {
  const questsLast24h = countRecentActivity(activities, "QUEST");
  const lootLast24h = countRecentActivity(activities, "LOOT");
  const streak = user?.streakCount ?? 0;

  return [
    {
      key: "vanguard-run",
      title: "Vanguard Run",
      hint: "Complete 3 quests within 24h.",
      current: questsLast24h,
      target: 3,
    },
    {
      key: "vault-hunter",
      title: "Vault Hunter",
      hint: "Open 2 loot boxes within 24h.",
      current: lootLast24h,
      target: 2,
    },
    {
      key: "streak-keeper",
      title: "Streak Keeper",
      hint: "Maintain at least 2 streak.",
      current: streak,
      target: 2,
    },
  ];
};

export const SanctumPanel = ({ user, locale, activities }: SanctumPanelProps) => {
  const ui = copy[locale];
  const target = getAscensionTarget(user);
  const challenges = buildChallenges(user, activities);

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <AssetIcon
            src={iconSlots.halo}
            alt={ui.title}
            size={18}
            className={styles.headerIcon}
            fallback={<Shield size={18} strokeWidth={2.4} className={styles.headerIcon} />}
          />
          <h2 className={styles.title}>{ui.title}</h2>
        </div>
        <span className={styles.status}>{ui.status}</span>
      </div>

      <div className={styles.sigil} aria-hidden>
        <AssetIcon
          src={iconSlots.wings}
          alt=""
          size={96}
          className={`${styles.guardWing} ${styles.guardWingLeft}`}
        />
        <AssetIcon
          src={iconSlots.wings}
          alt=""
          size={96}
          className={`${styles.guardWing} ${styles.guardWingRight}`}
        />
        <AssetIcon
          src={iconSlots.halo}
          alt=""
          size={58}
          className={styles.halo}
        />
        <span className={styles.pillar} />
      </div>

      <div className={styles.objective}>
        <p className={styles.objectiveLabel}>{ui.objective}</p>
        <p className={styles.objectiveTitle}>{target.title}</p>
        <p className={styles.objectiveDetail}>{target.detail}</p>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>{ui.shards}</span>
          <span className={styles.metricValue}>{user?.shards ?? 0}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>{ui.quests}</span>
          <span className={styles.metricValue}>{user?.questsCompletedTotal ?? 0}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>{ui.streak}</span>
          <span className={styles.metricValue}>{user?.streakCount ?? 0}</span>
        </div>
      </div>

      <section className={styles.challengePanel}>
        <p className={styles.challengeTitle}>{ui.challengeTitle}</p>
        <p className={styles.challengeHint}>{ui.challengeHint}</p>

        <div className={styles.challengeList}>
          {challenges.map((challenge) => {
            const progress = Math.min(100, (challenge.current / challenge.target) * 100);
            const completed = challenge.current >= challenge.target;

            return (
              <article key={challenge.key} className={styles.challengeItem}>
                <div className={styles.challengeHeader}>
                  <p className={styles.challengeName}>{challenge.title}</p>
                  <span className={`${styles.challengeValue} ${completed ? styles.challengeComplete : ""}`}>
                    {completed ? ui.challengeDone : `${challenge.current}/${challenge.target}`}
                  </span>
                </div>
                <p className={styles.challengeText}>{challenge.hint}</p>
                <div className={styles.challengeBarTrack}>
                  <div className={styles.challengeBarFill} style={{ width: `${progress}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className={styles.actions}>
        <Link href="/activity" className={styles.actionLink}>
          {ui.activityFeed}
        </Link>
        <Link href="/leaderboard" className={styles.actionLink}>
          {ui.leaderboard}
        </Link>
      </div>

      <div className={styles.emberField}>
        <span className={styles.ember} />
        <span className={styles.ember} />
        <span className={styles.ember} />
      </div>

      <div className={styles.glow} />
    </section>
  );
};
