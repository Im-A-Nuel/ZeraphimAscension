"use client";

import { Zap, Gem, Feather, Ticket, Flame, Star } from "lucide-react";
import { AssetIcon } from "@/components/ui";
import { iconSlots } from "@/lib/assets/iconSlots";
import { useAuthStore } from "@/stores";
import type { UserStats } from "@/types";
import styles from "./ProfilePanel.module.css";

interface ProfilePanelProps {
  user: UserStats | null;
  locale: "en" | "zh";
}

const copy = {
  en: {
    disconnected: "Disconnected",
    wallet: "Wallet",
    commandCenter: "Command Center",
    operatorStatus: "Operator Status",
    experience: "Experience",
    shards: "Shards",
    wingsTier: "Wings Tier",
    lootTickets: "Loot Tickets",
    streak: "Streak",
    level: "Level",
  },
  zh: {
    disconnected: "未连接",
    wallet: "钱包",
    commandCenter: "指挥中心",
    operatorStatus: "操作员状态",
    experience: "经验",
    shards: "碎片",
    wingsTier: "羽翼等级",
    lootTickets: "战利品券",
    streak: "连击",
    level: "等级",
  },
} as const;

export const ProfilePanel = ({ user, locale }: ProfilePanelProps) => {
  const address = useAuthStore((state) => state.address);
  const wallets = useAuthStore((state) => state.wallets);
  const selectedWalletId = useAuthStore((state) => state.selectedWalletId);
  const ui = copy[locale];
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ui.disconnected;
  const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId);

  return (
    <section className={styles.profile}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <AssetIcon src={iconSlots.halo} alt="Command Crest" size={22} className={styles.titleIcon} />
          <div>
            <h2 className={styles.title}>{ui.commandCenter}</h2>
            <p className={styles.subtitle}>{ui.operatorStatus}</p>
          </div>
        </div>
        <div className={styles.walletInfo}>
          <p className={styles.walletLabel}>{selectedWallet?.label ?? ui.wallet}</p>
          <span className={styles.walletAddress}>{truncatedAddress}</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <AssetIcon
              src={iconSlots.xp}
              alt={ui.experience}
              fallback={<Zap size={18} strokeWidth={2.5} />}
            />
          </div>
          <p className={styles.statLabel}>{ui.experience}</p>
          <p className={styles.statValue}>{user?.xp ?? 0}</p>
          <div className={styles.statGlow} />
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <AssetIcon
              src={iconSlots.shard}
              alt={ui.shards}
              fallback={<Gem size={18} strokeWidth={2.5} />}
            />
          </div>
          <p className={styles.statLabel}>{ui.shards}</p>
          <p className={styles.statValue}>{user?.shards ?? 0}</p>
          <div className={styles.statGlow} />
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <AssetIcon
              src={iconSlots.wings}
              alt={ui.wingsTier}
              fallback={<Feather size={18} strokeWidth={2.5} />}
            />
          </div>
          <p className={styles.statLabel}>{ui.wingsTier}</p>
          <p className={styles.statValue}>{user?.wingsTier ?? 0}</p>
          <div className={styles.statGlow} />
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <AssetIcon
              src={iconSlots.ticket}
              alt={ui.lootTickets}
              fallback={<Ticket size={18} strokeWidth={2.5} />}
            />
          </div>
          <p className={styles.statLabel}>{ui.lootTickets}</p>
          <p className={styles.statValue}>{user?.lootTickets ?? 0}</p>
          <div className={styles.statGlow} />
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <AssetIcon
              src={iconSlots.streak}
              alt={ui.streak}
              fallback={<Flame size={18} strokeWidth={2.5} />}
            />
          </div>
          <p className={styles.statLabel}>{ui.streak}</p>
          <p className={styles.statValue}>{user?.streakCount ?? 0}</p>
          <div className={styles.statGlow} />
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <AssetIcon
              src={iconSlots.level}
              alt={ui.level}
              fallback={<Star size={18} strokeWidth={2.5} />}
            />
          </div>
          <p className={styles.statLabel}>{ui.level}</p>
          <p className={styles.statValue}>{user?.level ?? 0}</p>
          <div className={styles.statGlow} />
        </article>
      </div>

      <div className={styles.scanline} />
    </section>
  );
};
