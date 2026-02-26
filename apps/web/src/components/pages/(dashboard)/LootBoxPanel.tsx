import type { CSSProperties } from "react";
import { Gem, Gift, Zap } from "lucide-react";
import { AssetIcon } from "@/components/ui";
import { iconSlots } from "@/lib/assets/iconSlots";
import styles from "./LootBoxPanel.module.css";

interface LootBoxPanelProps {
  lootTickets: number;
  locale: "en" | "zh";
  isPending: boolean;
  onOpen: () => void;
}

const copy = {
  en: {
    title: "Loot System",
    tickets: "Tickets",
    possibleRewards: "Possible Rewards",
    rewardOdds: "Reward Odds",
    shards: "Shards",
    commonRate: "Common 60%",
    rareRate: "Rare 30%",
    mythicRate: "Mythic 10%",
    xpBoost: "XP Boost",
    xpBoostRate: "14.3% chance",
    noWagerNotice: "Gameplay reward only. No cash wagering.",
    opening: "Opening...",
    openLootBox: "Open Loot Box",
    noTickets: "No Tickets",
  },
  zh: {
    title: "Loot System",
    tickets: "Tickets",
    possibleRewards: "Possible Rewards",
    rewardOdds: "Reward Odds",
    shards: "Shards",
    commonRate: "Common 60%",
    rareRate: "Rare 30%",
    mythicRate: "Mythic 10%",
    xpBoost: "XP Boost",
    xpBoostRate: "14.3% chance",
    noWagerNotice: "Gameplay reward only. No cash wagering.",
    opening: "Opening...",
    openLootBox: "Open Loot Box",
    noTickets: "No Tickets",
  },
} as const;

export const LootBoxPanel = ({ lootTickets, locale, isPending, onOpen }: LootBoxPanelProps) => {
  const ui = copy[locale];
  const canOpen = lootTickets > 0 && !isPending;

  return (
    <section className={styles.lootPanel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{ui.title}</h2>
        <div className={styles.ticketBadge}>
          <span className={styles.ticketLabel}>{ui.tickets}</span>
          <span className={styles.ticketValue}>{lootTickets}</span>
        </div>
      </div>

      <div className={styles.lootBox}>
        <AssetIcon src={iconSlots.halo} alt="" size={118} className={styles.guardHalo} />
        <AssetIcon
          src={iconSlots.wings}
          alt=""
          size={92}
          className={`${styles.guardWing} ${styles.guardWingLeft}`}
        />
        <AssetIcon
          src={iconSlots.wings}
          alt=""
          size={92}
          className={`${styles.guardWing} ${styles.guardWingRight}`}
        />
        <div className={styles.boxGlow} />
        <div className={styles.boxCore}>
          <div className={styles.boxRing} />
          <div className={styles.boxInner}>
            <span className={styles.boxIcon}>
              <AssetIcon
                src={iconSlots.lootbox}
                alt="Lootbox"
                size={32}
                fallback={<Gift size={32} strokeWidth={2} />}
              />
            </span>
          </div>
        </div>
      </div>

      <div className={styles.rewards}>
        <p className={styles.rewardsTitle}>{ui.possibleRewards}</p>
        <p className={styles.oddsTitle}>{ui.rewardOdds}</p>
        <div className={styles.rewardsGrid}>
          <div className={styles.rewardChip}>
            <AssetIcon
              src={iconSlots.shard}
              alt="Shards Reward"
              size={14}
              fallback={<Gem size={14} strokeWidth={2.5} />}
            />
            <span className={styles.rewardAmount}>50</span>
            <span className={styles.rewardType}>{ui.shards}</span>
            <span className={styles.rewardRate}>{ui.commonRate}</span>
          </div>
          <div className={styles.rewardChip}>
            <AssetIcon
              src={iconSlots.shard}
              alt="Shards Reward"
              size={14}
              fallback={<Gem size={14} strokeWidth={2.5} />}
            />
            <span className={styles.rewardAmount}>100</span>
            <span className={styles.rewardType}>{ui.shards}</span>
            <span className={styles.rewardRate}>{ui.rareRate}</span>
          </div>
          <div className={styles.rewardChip}>
            <AssetIcon
              src={iconSlots.shard}
              alt="Shards Reward"
              size={14}
              fallback={<Gem size={14} strokeWidth={2.5} />}
            />
            <span className={styles.rewardAmount}>200</span>
            <span className={styles.rewardType}>{ui.shards}</span>
            <span className={styles.rewardRate}>{ui.mythicRate}</span>
          </div>
        </div>
        <p className={styles.rewardsNote}>
          <AssetIcon
            src={iconSlots.xp}
            alt="XP Boost"
            size={14}
            fallback={<Zap size={14} strokeWidth={2.5} />}
          />
          <span>
            {ui.xpBoost} - {ui.xpBoostRate}
          </span>
        </p>
        <p className={styles.fairnessNote}>{ui.noWagerNotice}</p>
      </div>

      <button className={styles.openBtn} type="button" onClick={onOpen} disabled={!canOpen}>
        <span className={styles.btnGlow} />
        <span className={styles.btnText}>
          {isPending ? ui.opening : canOpen ? ui.openLootBox : ui.noTickets}
        </span>
      </button>

      <div className={styles.particles}>
        <div className={styles.particle} style={{ "--delay": "0s" } as CSSProperties} />
        <div className={styles.particle} style={{ "--delay": "0.5s" } as CSSProperties} />
        <div className={styles.particle} style={{ "--delay": "1s" } as CSSProperties} />
      </div>
    </section>
  );
};
